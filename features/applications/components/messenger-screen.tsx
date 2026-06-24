"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import {
  useApplications,
  useEmployerApplications,
} from "@/features/applications/hooks/use-applications";
import {
  useApplicationMessages,
  useMarkApplicationRead,
  useSendApplicationMessage,
} from "@/features/applications/hooks/use-application-messages";
import { APPLICATION_STATUS_META } from "@/features/applications/constants/status";
import { useBookmarks } from "@/features/bookmarks/hooks/use-bookmarks";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS, type ApplicationStatus } from "@/interfaces/enums";
import type {
  Application,
  ConversationScope,
  EmployerApplication,
} from "@/interfaces/application.interface";
import type { Bookmark } from "@/interfaces/engagement.interface";
import s from "@/features/applications/styles/messenger.module.css";

/* ---------------- icons (exact prototype paths) ---------------- */
function mIcon(inner: string, sw = 1.5, fill = false): string {
  const svg = fill
    ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'>${inner}</svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const MICONS = {
  back: mIcon("<path d='M20 12H4'/><path d='M10 6l-6 6 6 6'/>", 1.8),
  send: mIcon("<path d='M12 20V5M6 11l6-6 6 6'/>", 1.8),
  phone: mIcon("<path d='M5 7c0-1 0-1.5.3-1.9.6-.8 1.7-1.1 2.6-.8.5.2.9.8 1.6 2 .3.5.5.8.5 1.2.1.4 0 .8-.2 1.5l-.5 1.3c-.1.3-.1.4 0 .7a8 8 0 0 0 4 4c.3.1.4.1.7 0l1.3-.5c.7-.2 1.1-.3 1.5-.2.4 0 .7.2 1.2.5 1.2.7 1.8 1.1 2 1.6.3.9 0 2-.8 2.6-.4.3-.9.3-1.9.3A14 14 0 0 1 5 7z'/>", 1.6),
  check: mIcon("<path d='M5 13l4 4L19 7'/>", 2),
  checks: mIcon("<path d='M1.5 13l4 4 8.5-9.5'/><path d='M10.5 17l8.5-9.5'/>", 1.7),
  plus: mIcon("<path d='M12 5v14M5 12h14'/>", 1.8),
  bookmark: mIcon("<path d='M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z'/>", 1.6),
  open: mIcon("<path d='M14 4h6v6'/><path d='M20 4l-9 9'/><path d='M18 14v3.5c0 1.4-1.1 2.5-2.5 2.5H6.5C5.1 20 4 18.9 4 17.5V8.5C4 7.1 5.1 6 6.5 6H10'/>", 1.7),
  wallet: mIcon("<path d='M3 8.5c0-1.4 0-2.1.4-2.6.5-.6 1.5-.6 3.6-.6h6c2.1 0 3.1 0 3.6.6.4.5.4 1.2.4 2.6v7c0 1.4 0 2.1-.4 2.6-.5.6-1.5.6-3.6.6H7c-2.1 0-3.1 0-3.6-.6C3 17.6 3 16.9 3 15.5z'/><path d='M16 12h2.5'/><path d='M3 9h13c1.4 0 2.1 0 2.6.4.4.5.4 1.2.4 2.6'/>", 1.5),
  menu: mIcon("<path d='M4 9h16M4 15h10'/>", 1.7),
  chat: mIcon("<path d='M4 8c0-1.9 0-2.83.6-3.41C5.17 4 6.1 4 8 4h8c1.9 0 2.83 0 3.41.59C20 5.17 20 6.1 20 8v5c0 1.9 0 2.83-.59 3.41C18.83 17 17.9 17 16 17H9l-3.4 3c-.6.5-1.6.1-1.6-.7z'/>", 1.5),
  eye: mIcon("<path d='M3 12c0-1.2.32-1.6 1-2.4C5.7 7.6 8.6 5 12 5s6.3 2.6 8 4.6c.68.8 1 1.2 1 2.4s-.32 1.6-1 2.4C18.3 16.4 15.4 19 12 19s-6.3-2.6-8-4.6C2.32 13.6 2 13.2 2 12z'/><circle cx='12' cy='12' r='3'/>", 1.5),
  dots: mIcon("<circle cx='12' cy='5' r='1.6'/><circle cx='12' cy='12' r='1.6'/><circle cx='12' cy='19' r='1.6'/>", 1.5),
} as const;
function MIc({ name, className }: { name: keyof typeof MICONS; className?: string }) {
  return (
    <span className={cn(s.ic, className)} style={{ "--i": MICONS[name] } as CSSProperties} aria-hidden="true" />
  );
}

/* ---------------- helpers ---------------- */
const AV_COLORS = ["#3158f6", "#22a06b", "#ff6b00", "#7a5af5", "#0f9bb3", "#e0532e", "#9b51e0"];
function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AV_COLORS[hash % AV_COLORS.length];
}
function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase() || "?";
}
function clockTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "long" });
}

const STATUS_CLS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUS.SENT]: "applied",
  [APPLICATION_STATUS.VIEWED]: "viewed",
  [APPLICATION_STATUS.ACCEPTED]: "interview",
  [APPLICATION_STATUS.REJECTED]: "rejected",
  [APPLICATION_STATUS.SAVED]: "done",
};

interface Thread {
  id: string;
  name: string;
  avatarUrl: string | null;
  color: string;
  mainLine: string;
  subLine: string;
  statusCls: string;
  statusLabel: string;
  date: string;
  vacancyTitle: string;
}

function workerThread(a: Application): Thread {
  const company = a.vacancy.companyName ?? "Employer";
  return {
    id: a.id,
    name: company,
    avatarUrl: null,
    color: avatarColor(company),
    mainLine: a.vacancy.title,
    subLine: a.vacancy.companyName ?? a.vacancy.city ?? "",
    statusCls: STATUS_CLS[a.status] ?? "applied",
    statusLabel: APPLICATION_STATUS_META[a.status]?.label ?? "Applied",
    date: formatRelativeTime(a.lastMessageAt ?? a.sentAt ?? a.createdAt),
    vacancyTitle: a.vacancy.title,
  };
}
function employerThread(e: EmployerApplication): Thread {
  const name = e.applicant.name;
  return {
    id: e.id,
    name,
    avatarUrl: e.applicant.avatarUrl,
    color: avatarColor(name),
    mainLine: name,
    subLine: e.applicant.profession ?? "Candidate",
    statusCls: STATUS_CLS[e.status] ?? "applied",
    statusLabel: APPLICATION_STATUS_META[e.status]?.label ?? "Applied",
    date: formatRelativeTime(e.lastMessageAt ?? e.sentAt ?? e.createdAt),
    vacancyTitle: e.applicant.profession ?? "",
  };
}

const QUICK = [
  "Thank you!",
  "I'm available this week",
  "What's the location?",
  "What are the next steps?",
];

/**
 * The Saved & applied (worker) / Candidates (employer) messenger — the prototype
 * inbox + conversation thread. Inbox + threads are real (applications + messages);
 * the employer flat inbox uses a proposed endpoint and degrades to empty. Online
 * presence / read-receipt flourishes from the prototype are omitted (no backend
 * signal) — see api-need.md.
 */
export function MessengerScreen({ scope }: { scope: ConversationScope }) {
  const employer = scope === "employer";
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  const workerApps = useApplications();
  const employerApps = useEmployerApplications();
  const bookmarks = useBookmarks();

  const [tab, setTab] = useState<"applied" | "saved">("applied");
  const [openId, setOpenId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const threads = useMemo<Thread[]>(() => {
    if (employer) return (employerApps.data ?? []).map(employerThread);
    return (workerApps.data ?? []).map(workerThread);
  }, [employer, employerApps.data, workerApps.data]);

  const open = openId ? threads.find((t) => t.id === openId) ?? null : null;
  const loading = employer ? employerApps.isLoading : workerApps.isLoading;

  if (open) {
    return (
      <div className={s.screen}>
        <ThreadView
          scope={scope}
          thread={open}
          onBack={() => setOpenId(null)}
        />
      </div>
    );
  }

  return (
    <div className={s.screen}>
      <header className={s["sv-topbar"]}>
        <button
          type="button"
          className={cn(s["sv-iconbtn"], s["sv-menu"])}
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <MIc name="menu" />
        </button>
        <div className={s["sv-title"]}>{employer ? "Candidates" : "Saved & applied"}</div>
      </header>

      <div className={s["sv-tabs"]}>
        <button
          type="button"
          className={cn(s["sv-tab"], tab === "applied" && s.on)}
          onClick={() => setTab("applied")}
        >
          {employer ? "Applicants" : "Applied"}
        </button>
        <button
          type="button"
          className={cn(s["sv-tab"], tab === "saved" && s.on)}
          onClick={() => setTab("saved")}
        >
          {employer ? "Shortlist" : "Saved"}
        </button>
      </div>

      <div className={s["sv-scroll"]}>
        {tab === "applied" ? (
          <AppliedTab
            threads={threads}
            loading={loading}
            unreadOnly={unreadOnly}
            onToggleUnread={setUnreadOnly}
            onOpen={setOpenId}
            employer={employer}
          />
        ) : (
          <SavedTab employer={employer} bookmarks={bookmarks.data ?? []} />
        )}
      </div>
    </div>
  );
}

function AppliedTab({
  threads,
  loading,
  unreadOnly,
  onToggleUnread,
  onOpen,
  employer,
}: {
  threads: Thread[];
  loading: boolean;
  unreadOnly: boolean;
  onToggleUnread: (v: boolean) => void;
  onOpen: (id: string) => void;
  employer: boolean;
}) {
  if (loading) {
    return (
      <div className={s["sv-list"]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={s["sv-item"]} aria-hidden="true">
            <span className={s["sv-avwrap"]}>
              <span className={s["sv-av"]} style={{ background: "var(--bg-secondary-hover)" }} />
            </span>
            <span className={s["sv-item-main"]}>
              <span className={s["sv-role"]} style={{ height: 14, background: "var(--bg-secondary-hover)", borderRadius: 6, maxWidth: 180 }} />
              <span className={s["sv-co"]} style={{ height: 12, background: "var(--bg-secondary-hover)", borderRadius: 6, maxWidth: 120 }} />
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <Empty
        icon="chat"
        title={employer ? "No applicants yet" : "No applications yet"}
        desc={
          employer
            ? "When someone applies to one of your roles, your chat with them shows up here."
            : "When you apply to a job, your chat with the employer shows up here."
        }
      />
    );
  }

  return (
    <>
      <label className={s["sv-filter"]}>
        <input
          type="checkbox"
          className={s["sv-check"]}
          checked={unreadOnly}
          onChange={(e) => onToggleUnread(e.target.checked)}
        />
        <span className={s["sv-check-box"]}>
          <MIc name="check" />
        </span>
        <span className={s["sv-check-l"]}>Only unread</span>
      </label>
      <div className={s["sv-list"]}>
        {threads.map((t) => (
          <button key={t.id} type="button" className={s["sv-item"]} onClick={() => onOpen(t.id)}>
            <span className={s["sv-avwrap"]}>
              <span className={s["sv-av"]} style={{ background: t.color }}>
                {t.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatarUrl} alt="" />
                ) : (
                  initials(t.name)
                )}
              </span>
            </span>
            <span className={s["sv-item-main"]}>
              <span className={s["sv-item-row"]}>
                <span className={s["sv-role"]}>{t.mainLine}</span>
                <span className={s["sv-meta"]}>
                  <span className={s["sv-meta-date"]}>{t.date}</span>
                </span>
              </span>
              {t.subLine ? <span className={s["sv-co"]}>{t.subLine}</span> : null}
              <span className={cn(s["sv-status"], s[`sv-status--${t.statusCls}`])}>
                {t.statusLabel}
              </span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function SavedTab({ employer, bookmarks }: { employer: boolean; bookmarks: Bookmark[] }) {
  if (employer) {
    return (
      <Empty
        icon="bookmark"
        title="No shortlisted candidates"
        desc="Shortlist a candidate to keep them here for later."
      />
    );
  }
  if (bookmarks.length === 0) {
    return (
      <Empty
        icon="bookmark"
        title="Nothing saved"
        desc="Tap the bookmark on any job to keep it here for later."
      />
    );
  }
  return (
    <div className={s["sv-saved"]}>
      {bookmarks.map((b) => (
        <div key={b.id} className={s["sv-job"]}>
          <div className={s["sv-job-top"]}>
            <span className={s["sv-av"]} style={{ background: avatarColor(b.vacancy.title) }}>
              {initials(b.vacancy.title)}
            </span>
            <div className={s["sv-job-head"]}>
              <div className={s["sv-job-role"]}>{b.vacancy.title}</div>
              <div className={s["sv-co"]}>
                {[b.vacancy.city, b.vacancy.country].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({
  icon,
  title,
  desc,
}: {
  icon: keyof typeof MICONS;
  title: string;
  desc: string;
}) {
  return (
    <div className={s["sv-empty"]}>
      <span className={s["sv-empty-ic"]}>
        <MIc name={icon} />
      </span>
      <div className={s["sv-empty-t"]}>{title}</div>
      <div className={s["sv-empty-d"]}>{desc}</div>
    </div>
  );
}

function ThreadView({
  scope,
  thread,
  onBack,
}: {
  scope: ConversationScope;
  thread: Thread;
  onBack: () => void;
}) {
  const { data: messages, isLoading } = useApplicationMessages(scope, thread.id, true);
  const send = useSendApplicationMessage(scope, thread.id);
  const markRead = useMarkApplicationRead(scope, thread.id);
  const [draft, setDraft] = useState("");
  const msgsRef = useRef<HTMLDivElement>(null);
  const me = scope === "worker" ? "WORKER" : "EMPLOYER";

  // Mark the thread read once on open.
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    markRead.mutate();
  }, [markRead]);

  // Stick to the latest message.
  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, send.isPending]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || send.isPending) return;
    send.mutate(text, { onError: () => toast.error("Couldn't send the message") });
    setDraft("");
  };

  const list = messages ?? [];
  let lastDay: string | null = null;

  return (
    <>
      <header className={cn(s["sv-topbar"], s["sv-thead"])}>
        <button type="button" className={cn(s["sv-iconbtn"], s["sv-back"])} onClick={onBack} aria-label="Back">
          <MIc name="back" />
        </button>
        <span className={s["sv-avwrap"]}>
          <span className={cn(s["sv-av"], s["sv-av--sm"])} style={{ background: thread.color }}>
            {thread.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thread.avatarUrl} alt="" />
            ) : (
              initials(thread.name)
            )}
          </span>
        </span>
        <div className={s["sv-thead-main"]}>
          <div className={s["sv-thead-name"]}>{thread.name}</div>
          <div className={s["sv-thead-sub"]}>{thread.statusLabel}</div>
        </div>
        <button type="button" className={s["sv-iconbtn"]} aria-label="More" onClick={() => toast("Conversation options coming soon")}>
          <MIc name="dots" />
        </button>
      </header>

      <div className={s["sv-pin"]}>
        <div className={s["sv-pin-main"]}>
          <span className={s["sv-pin-l"]}>{scope === "employer" ? "Applied for" : "Applied to vacancy"}</span>
          <span className={s["sv-pin-role"]}>{thread.vacancyTitle || thread.mainLine}</span>
        </div>
      </div>

      <div className={s["sv-msgs"]} ref={msgsRef}>
        <div className={s["sv-msgs-inner"]}>
          {isLoading ? (
            <div className={s["sv-sys"]}>Loading conversation…</div>
          ) : list.length === 0 ? (
            <div className={s["sv-sys"]}>
              <MIc name="eye" />
              No messages yet — say hello.
            </div>
          ) : (
            list.map((m) => {
              const isMe = m.senderRole === me;
              const day = dayLabel(m.createdAt);
              const showDay = day && day !== lastDay;
              if (showDay) lastDay = day;
              const read = scope === "worker" ? m.readByEmployer : m.readByWorker;
              return (
                <div key={m.id}>
                  {showDay ? (
                    <div className={s["sv-daysep"]}>
                      <span>{day}</span>
                    </div>
                  ) : null}
                  <div className={cn(s["sv-mrow"], isMe && s.me)}>
                    <div className={cn(s["sv-bubble"], isMe && s.me)}>
                      {m.content}
                      <span className={s["sv-btime"]}>
                        {clockTime(m.createdAt)}
                        {isMe ? (
                          <span className={cn(s["sv-bt-tick"], read && s.read)}>
                            <MIc name={read ? "checks" : "check"} />
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {send.isPending ? (
            <div className={s["sv-typing"]}>
              <div className={s["sv-bubble"]}>
                <span className={s["sv-tdot"]} />
                <span className={s["sv-tdot"]} />
                <span className={s["sv-tdot"]} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={s["sv-quick"]}>
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            className={s["sv-qchip"]}
            onClick={() => {
              if (send.isPending) return;
              send.mutate(q, { onError: () => toast.error("Couldn't send the message") });
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <form className={s["sv-composer"]} autoComplete="off" onSubmit={submit}>
        <button type="button" className={s["sv-attach"]} aria-label="Attach" onClick={() => toast("Attachments are coming soon")}>
          <MIc name="plus" />
        </button>
        <input
          className={s["sv-input"]}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message…"
          aria-label="Message"
        />
        <button type="submit" className={s["sv-send"]} aria-label="Send" disabled={!draft.trim() || send.isPending}>
          <MIc name="send" />
        </button>
      </form>
    </>
  );
}
