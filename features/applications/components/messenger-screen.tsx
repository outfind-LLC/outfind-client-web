"use client";

import {
  Fragment,
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
  useApplyToVacancy,
  useEmployerApplications,
} from "@/features/applications/hooks/use-applications";
import {
  useApplicationMessages,
  useMarkApplicationRead,
  useSendApplicationMessage,
} from "@/features/applications/hooks/use-application-messages";
import { useBookmarks, useRemoveBookmark } from "@/features/bookmarks/hooks/use-bookmarks";
import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUS,
  VACANCY_TYPE,
  type VacancyType,
} from "@/interfaces/enums";
import type {
  Application,
  ApplicationMessageSender,
  ConversationScope,
  EmployerApplication,
} from "@/interfaces/application.interface";
import type {
  Bookmark,
  BookmarkVacancyPreview,
} from "@/interfaces/engagement.interface";
import type { JobCardData } from "@/features/chat/types/job";
import type { MessageKey } from "@/lib/i18n/translate";
import type { TranslateFn } from "@/providers/i18n-provider";
import s from "@/features/applications/styles/messenger.module.css";

/* ---------------- icons (exact prototype paths, 1.5px solar set) ------------ */
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
  verified: mIcon(
    "<path d='M12 2.2l2.3 1.7 2.85-.2 .9 2.72 2.35 1.63-.85 2.73.85 2.73-2.35 1.63-.9 2.72-2.85-.2L12 21.8l-2.3-1.7-2.85.2-.9-2.72-2.35-1.63.85-2.73-.85-2.73 2.35-1.63.9-2.72 2.85.2z'/><path d='M8.6 12.2l2.2 2.2 4.6-4.8' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/>",
    1.5,
    true,
  ),
} as const;
function MIc({ name, className }: { name: keyof typeof MICONS; className?: string }) {
  return (
    <span
      className={cn(s.ic, className)}
      style={{ "--i": MICONS[name] } as CSSProperties}
      aria-hidden="true"
    />
  );
}

/* ---------------- avatar + formatting helpers ------------------------------- */
const AV_COLORS = ["#3158f6", "#22a06b", "#ff6b00", "#7a5af5", "#0f9bb3", "#e0532e", "#9b51e0"];
function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AV_COLORS[hash % AV_COLORS.length];
}
function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase() || "?";
}
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
/** Chat-list timestamp: today → time, this week → weekday, older → dd.mm. */
function inboxDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return d.toLocaleDateString(locale, { weekday: "short" });
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function clockTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}
function dayLabel(iso: string, locale: string, t: TranslateFn): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) return t("applications.dayToday");
  if (diffDays === 1) return t("applications.dayYesterday");
  return d.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

/* ---------------- status mapping (backend enum → design status) ------------- */
type DisplayStatus = "interview" | "reply" | "applied" | "viewed" | "done" | "rejected";
const STATUS_LABEL_KEY: Record<DisplayStatus, MessageKey> = {
  interview: "applications.statusInterview",
  reply: "applications.statusReply",
  applied: "applications.statusApplied",
  viewed: "applications.statusViewed",
  done: "applications.statusInReview",
  rejected: "applications.statusRejected",
};
/** Worker view: dynamic status — an unread employer message reads as "New reply". */
function workerStatus(a: Application): DisplayStatus {
  if (a.status === APPLICATION_STATUS.REJECTED) return "rejected";
  if (a.status === APPLICATION_STATUS.ACCEPTED) return "interview";
  if (a.unreadCount > 0 && a.lastMessageSenderRole === "EMPLOYER") return "reply";
  if (a.status === APPLICATION_STATUS.VIEWED) return "viewed";
  if (a.lastMessageAt) return "done";
  return "applied";
}
function employerStatus(e: EmployerApplication): DisplayStatus {
  if (e.status === APPLICATION_STATUS.REJECTED) return "rejected";
  if (e.status === APPLICATION_STATUS.ACCEPTED) return "interview";
  if (e.status === APPLICATION_STATUS.VIEWED) return "viewed";
  if (e.lastMessageAt) return "done";
  return "applied";
}

/* ---------------- saved-card formatting ------------------------------------- */
const TYPE_LABEL_KEY: Record<VacancyType, MessageKey> = {
  [VACANCY_TYPE.FULL_TIME]: "applications.typeFullTime",
  [VACANCY_TYPE.PART_TIME]: "applications.typePartTime",
  [VACANCY_TYPE.CONTRACT]: "applications.typeContract",
  [VACANCY_TYPE.SEASONAL]: "applications.typeSeasonal",
  [VACANCY_TYPE.INTERNSHIP]: "applications.typeInternship",
};
function formatBookmarkSalary(
  v: BookmarkVacancyPreview,
  t: TranslateFn,
  locale: string,
): string | null {
  if (v.salaryRaw) return v.salaryRaw;
  const cur = v.currency ? ` ${v.currency}` : "";
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  if (v.salaryMin != null && v.salaryMax != null) return `${fmt(v.salaryMin)}–${fmt(v.salaryMax)}${cur}`;
  if (v.salaryMin != null) return t("applications.salaryFrom", { amount: `${fmt(v.salaryMin)}${cur}` });
  if (v.salaryMax != null) return `${fmt(v.salaryMax)}${cur}`;
  return null;
}
function savedTags(v: BookmarkVacancyPreview, t: TranslateFn): string[] {
  const tags: string[] = [];
  if (v.type) tags.push(t(TYPE_LABEL_KEY[v.type]));
  tags.push(v.isRemote ? t("applications.workRemote") : t("applications.workOnSite"));
  return tags;
}

/* ---------------- JobCardData builders (for the shared job-detail sheet) ----- */
const EMPTY_CONTACT = {
  email: null,
  phone: null,
  whatsapp: null,
  telegram: null,
  website: null,
  contactForm: null,
};
function jobFromBookmark(v: BookmarkVacancyPreview, salary: string | null): JobCardData {
  return {
    id: v.id,
    title: v.title,
    company: v.companyName,
    location: [v.city, v.country].filter(Boolean).join(", ") || null,
    salary,
    skills: [],
    isRemote: v.isRemote,
    jobType: null,
    description: null,
    requirements: [],
    responsibilities: [],
    contact: { ...EMPTY_CONTACT },
    matchScore: null,
    postedAt: null,
  };
}
function jobFromThread(thread: Thread): JobCardData {
  return {
    id: thread.vacancyId,
    title: thread.vacancyTitle || thread.mainLine,
    company: thread.company,
    location: [thread.city, thread.country].filter(Boolean).join(", ") || null,
    salary: null,
    skills: [],
    isRemote: false,
    jobType: null,
    description: null,
    requirements: [],
    responsibilities: [],
    contact: { ...EMPTY_CONTACT },
    matchScore: null,
    postedAt: null,
  };
}

/* ---------------- thread model ---------------------------------------------- */
interface Thread {
  id: string;
  name: string;
  avatarUrl: string | null;
  color: string;
  mainLine: string;
  subLine: string;
  statusCls: DisplayStatus;
  statusLabelKey: MessageKey;
  date: string;
  unreadCount: number;
  lastMessageMine: boolean;
  lastMessageRead: boolean;
  employerVerified: boolean;
  vacancyId: string | null;
  vacancyTitle: string;
  company: string | null;
  city: string | null;
  country: string | null;
  sentAt: string | null;
  isWorker: boolean;
}

function workerThread(a: Application, locale: string): Thread {
  const company = a.vacancy.companyName ?? a.vacancy.title;
  const st = workerStatus(a);
  return {
    id: a.id,
    name: company,
    avatarUrl: a.vacancy.companyLogoUrl,
    color: avatarColor(company),
    mainLine: a.vacancy.title,
    subLine: a.vacancy.companyName ?? a.vacancy.city ?? "",
    statusCls: st,
    statusLabelKey: STATUS_LABEL_KEY[st],
    date: inboxDate(a.lastMessageAt ?? a.sentAt ?? a.createdAt, locale),
    unreadCount: a.unreadCount,
    lastMessageMine: a.lastMessageSenderRole === "WORKER",
    lastMessageRead: a.lastMessageReadByCounterparty,
    employerVerified: a.employerVerified,
    vacancyId: a.vacancyId,
    vacancyTitle: a.vacancy.title,
    company: a.vacancy.companyName,
    city: a.vacancy.city,
    country: a.vacancy.country,
    sentAt: a.sentAt,
    isWorker: true,
  };
}
function employerThread(e: EmployerApplication, locale: string): Thread {
  const name = e.applicant.name;
  const st = employerStatus(e);
  return {
    id: e.id,
    name,
    avatarUrl: e.applicant.avatarUrl,
    color: avatarColor(name),
    mainLine: name,
    subLine: e.applicant.profession ?? "",
    statusCls: st,
    statusLabelKey: STATUS_LABEL_KEY[st],
    date: inboxDate(e.lastMessageAt ?? e.sentAt ?? e.createdAt, locale),
    unreadCount: 0,
    lastMessageMine: false,
    lastMessageRead: false,
    employerVerified: false,
    vacancyId: null,
    vacancyTitle: e.applicant.profession ?? "",
    company: null,
    city: null,
    country: null,
    sentAt: e.sentAt,
    isWorker: false,
  };
}

const QUICK_KEYS: MessageKey[] = [
  "applications.quickThanks",
  "applications.quickAvailable",
  "applications.quickLocation",
  "applications.quickRemote",
  "applications.quickNext",
];

/**
 * The Saved & applied (worker) / Candidates (employer) messenger — the prototype
 * inbox + conversation thread + saved-jobs tab. Worker data is real (applications
 * + messages + bookmarks). Online presence and formal employer letters from the
 * prototype are omitted (no backend signal yet) — see docs/api-need.md. The
 * employer side reuses this shell and is fleshed out in a later feature.
 */
export function MessengerScreen({ scope }: { scope: ConversationScope }) {
  const employer = scope === "employer";
  const { t, locale } = useI18n();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  const workerApps = useApplications();
  const employerApps = useEmployerApplications();
  const bookmarks = useBookmarks();

  const [tab, setTab] = useState<"applied" | "saved">("applied");
  const [openId, setOpenId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const threads = useMemo<Thread[]>(() => {
    if (employer) return (employerApps.data ?? []).map((e) => employerThread(e, locale));
    return (workerApps.data ?? []).map((a) => workerThread(a, locale));
  }, [employer, employerApps.data, workerApps.data, locale]);

  const totalUnread = useMemo(
    () => threads.reduce((n, th) => n + th.unreadCount, 0),
    [threads],
  );

  const open = openId ? (threads.find((th) => th.id === openId) ?? null) : null;
  const loading = employer ? employerApps.isLoading : workerApps.isLoading;

  const openThread = (id: string) => {
    setTab("applied");
    setOpenId(id);
  };

  if (open) {
    return (
      <div className={s.screen}>
        <ThreadView scope={scope} thread={open} onBack={() => setOpenId(null)} />
      </div>
    );
  }

  return (
    <div className={s.screen}>
      <header className={s["sv-topbar"]}>
        <button
          type="button"
          className={cn(s["sv-iconbtn"], s["sv-menu"])}
          aria-label={t("applications.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <MIc name="menu" />
        </button>
        <div className={s["sv-title"]}>
          {employer ? "Candidates" : t("applications.title")}
        </div>
      </header>

      <div className={s["sv-tabs"]}>
        <button
          type="button"
          className={cn(s["sv-tab"], tab === "applied" && s.on)}
          onClick={() => setTab("applied")}
        >
          {employer ? "Applicants" : t("applications.tabApplied")}
          {totalUnread > 0 ? <span className={s["sv-tabbadge"]}>{totalUnread}</span> : null}
        </button>
        <button
          type="button"
          className={cn(s["sv-tab"], tab === "saved" && s.on)}
          onClick={() => setTab("saved")}
        >
          {employer ? "Shortlist" : t("applications.tabSaved")}
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
          <SavedTab
            employer={employer}
            bookmarks={bookmarks.data ?? []}
            onOpenThread={openThread}
          />
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
  const { t } = useI18n();

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
        title={employer ? "No applicants yet" : t("applications.emptyNoApps")}
        desc={
          employer
            ? "When someone applies to one of your roles, your chat with them shows up here."
            : t("applications.emptyNoAppsDesc")
        }
      />
    );
  }

  const list = threads.filter((th) => !unreadOnly || th.unreadCount > 0);

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
        <span className={s["sv-check-l"]}>{t("applications.onlyUnread")}</span>
      </label>

      {list.length === 0 ? (
        <Empty
          icon="chat"
          title={t("applications.emptyNoUnread")}
          desc={t("applications.emptyNoUnreadDesc")}
        />
      ) : (
        <div className={s["sv-list"]}>
          {list.map((th) => (
            <button
              key={th.id}
              type="button"
              className={cn(s["sv-item"], th.unreadCount > 0 && s["is-unread"])}
              onClick={() => onOpen(th.id)}
            >
              <span className={s["sv-avwrap"]}>
                <span className={s["sv-av"]} style={{ background: th.color }}>
                  {th.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={th.avatarUrl} alt="" />
                  ) : (
                    initials(th.name)
                  )}
                </span>
              </span>
              <span className={s["sv-item-main"]}>
                <span className={s["sv-item-row"]}>
                  <span className={s["sv-role"]}>{th.mainLine}</span>
                  <span className={s["sv-meta"]}>
                    {th.unreadCount > 0 ? (
                      <>
                        <span className={s["sv-meta-date"]}>{th.date}</span>
                        <span className={s["sv-unread"]}>{th.unreadCount}</span>
                      </>
                    ) : (
                      <span className={s["sv-meta-date"]}>
                        {th.lastMessageMine ? (
                          <span className={cn(s["sv-tick"], th.lastMessageRead && s["sv-tick--read"])}>
                            <MIc name={th.lastMessageRead ? "checks" : "check"} />
                          </span>
                        ) : null}
                        {th.date}
                      </span>
                    )}
                  </span>
                </span>
                {th.subLine ? <span className={s["sv-co"]}>{th.subLine}</span> : null}
                <span className={cn(s["sv-status"], s[`sv-status--${th.statusCls}`])}>
                  {t(th.statusLabelKey)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function SavedTab({
  employer,
  bookmarks,
  onOpenThread,
}: {
  employer: boolean;
  bookmarks: Bookmark[];
  onOpenThread: (applicationId: string) => void;
}) {
  const { t, locale } = useI18n();
  const apply = useApplyToVacancy();
  const removeBookmark = useRemoveBookmark();
  const openDetail = useJobDetailPanelStore((st) => st.openDetail);

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
        title={t("applications.emptyNoSaved")}
        desc={t("applications.emptyNoSavedDesc")}
      />
    );
  }

  const onView = (b: Bookmark) => {
    const salary = formatBookmarkSalary(b.vacancy, t, locale);
    openDetail(jobFromBookmark(b.vacancy, salary), b.vacancyId);
  };
  const onUnsave = (b: Bookmark) => {
    removeBookmark.mutate(b.vacancyId);
    toast(t("applications.toastRemoved"));
  };
  const onApply = (b: Bookmark) => {
    if (apply.isPending) return;
    apply.mutate(
      { vacancyId: b.vacancyId },
      {
        onSuccess: (created) => {
          removeBookmark.mutate(b.vacancyId);
          toast.success(t("applications.toastAppSent"));
          onOpenThread(created.id);
        },
        onError: () => toast.error(t("applications.errorApply")),
      },
    );
  };

  return (
    <div className={s["sv-saved"]}>
      {bookmarks.map((b) => {
        const v = b.vacancy;
        const label = v.companyName ?? v.title;
        const salary = formatBookmarkSalary(v, t, locale);
        const tags = savedTags(v, t);
        return (
          <div key={b.id} className={s["sv-job"]}>
            <div className={s["sv-job-top"]}>
              <span className={s["sv-av"]} style={{ background: avatarColor(label) }}>
                {v.companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.companyLogoUrl} alt="" />
                ) : (
                  initials(label)
                )}
              </span>
              <div className={s["sv-job-head"]}>
                <div className={s["sv-job-role"]}>{v.title}</div>
                <div className={s["sv-co"]}>
                  {[v.companyName, v.city].filter(Boolean).join(" · ")}
                </div>
              </div>
              <button
                type="button"
                className={s["sv-job-save"]}
                aria-label={t("applications.removeSaved")}
                onClick={() => onUnsave(b)}
              >
                <MIc name="bookmark" />
              </button>
            </div>
            <div className={s["sv-job-meta"]}>
              {salary ? (
                <span className={s["sv-job-pay"]}>
                  <MIc name="wallet" />
                  {salary}
                </span>
              ) : null}
              {tags.map((tag) => (
                <span key={tag} className={s["sv-chip"]}>
                  {tag}
                </span>
              ))}
            </div>
            <div className={s["sv-job-actions"]}>
              <button
                type="button"
                className={cn(s["sv-btn"], s["sv-btn-ghost"])}
                onClick={() => onView(b)}
              >
                {t("applications.viewJob")}
              </button>
              <button
                type="button"
                className={cn(s["sv-btn"], s["sv-btn-primary"])}
                onClick={() => onApply(b)}
                disabled={apply.isPending}
              >
                {t("applications.applyMessage")}
              </button>
            </div>
          </div>
        );
      })}
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
  const { t, locale } = useI18n();
  const { data: messages, isLoading } = useApplicationMessages(scope, thread.id, true);
  const send = useSendApplicationMessage(scope, thread.id);
  const markRead = useMarkApplicationRead(scope, thread.id);
  const openDetail = useJobDetailPanelStore((st) => st.openDetail);
  const [draft, setDraft] = useState("");
  const msgsRef = useRef<HTMLDivElement>(null);
  const me: ApplicationMessageSender = scope === "worker" ? "WORKER" : "EMPLOYER";

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
    send.mutate(text, { onError: () => toast.error(t("applications.errorSend")) });
    setDraft("");
  };

  const list = messages ?? [];
  const showApplied = thread.isWorker && Boolean(thread.sentAt);
  let lastDay: string | null = null;

  return (
    <>
      <header className={cn(s["sv-topbar"], s["sv-thead"])}>
        <button
          type="button"
          className={cn(s["sv-iconbtn"], s["sv-back"])}
          onClick={onBack}
          aria-label={t("applications.ariaBack")}
        >
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
          <div className={s["sv-thead-name"]}>
            {thread.name}
            {thread.employerVerified ? (
              <span className={s["sv-verified"]}>
                <MIc name="verified" />
              </span>
            ) : null}
          </div>
          <div className={s["sv-thead-sub"]}>{t(thread.statusLabelKey)}</div>
        </div>
        {thread.isWorker ? (
          <button
            type="button"
            className={s["sv-iconbtn"]}
            aria-label={t("applications.ariaCall")}
            onClick={() => toast(t("applications.toastCalling"))}
          >
            <MIc name="phone" />
          </button>
        ) : null}
        <button
          type="button"
          className={s["sv-iconbtn"]}
          aria-label={t("applications.ariaMore")}
          onClick={() => toast(t("applications.toastConvOptions"))}
        >
          <MIc name="dots" />
        </button>
      </header>

      <div className={s["sv-pin"]}>
        <div className={s["sv-pin-main"]}>
          <span className={s["sv-pin-l"]}>{t("applications.pinApplied")}</span>
          <span className={s["sv-pin-role"]}>{thread.vacancyTitle || thread.mainLine}</span>
        </div>
        {thread.isWorker && thread.vacancyId ? (
          <button
            type="button"
            className={s["sv-pin-go"]}
            onClick={() => openDetail(jobFromThread(thread), thread.vacancyId)}
          >
            {t("applications.viewJob")}
            <MIc name="open" />
          </button>
        ) : null}
      </div>

      <div className={s["sv-msgs"]} ref={msgsRef}>
        <div className={s["sv-msgs-inner"]}>
          {showApplied ? (
            <div className={s["sv-sys"]}>
              <MIc name="eye" />
              {t("applications.appliedOn", {
                date: dayLabel(thread.sentAt as string, locale, t),
              })}
            </div>
          ) : null}

          {isLoading ? (
            <div className={s["sv-sys"]}>{t("applications.loadingConversation")}</div>
          ) : list.length === 0 && !showApplied ? (
            <div className={s["sv-sys"]}>
              <MIc name="eye" />
              {t("applications.noMessages")}
            </div>
          ) : (
            list.map((m) => {
              const isMe = m.senderRole === me;
              const day = dayLabel(m.createdAt, locale, t);
              const showDay = Boolean(day) && day !== lastDay;
              if (showDay) lastDay = day;
              const read = scope === "worker" ? m.readByEmployer : m.readByWorker;
              return (
                <Fragment key={m.id}>
                  {showDay ? (
                    <div className={s["sv-daysep"]}>
                      <span>{day}</span>
                    </div>
                  ) : null}
                  <div className={cn(s["sv-mrow"], isMe && s.me)}>
                    <div className={cn(s["sv-bubble"], isMe && s.me)}>
                      {m.content}
                      <span className={s["sv-btime"]}>
                        {clockTime(m.createdAt, locale)}
                        {isMe ? (
                          <span className={cn(s["sv-bt-tick"], read && s.read)}>
                            <MIc name={read ? "checks" : "check"} />
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                </Fragment>
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
        {QUICK_KEYS.map((key) => {
          const label = t(key);
          return (
            <button
              key={key}
              type="button"
              className={s["sv-qchip"]}
              onClick={() => {
                if (send.isPending) return;
                send.mutate(label, { onError: () => toast.error(t("applications.errorSend")) });
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <form className={s["sv-composer"]} autoComplete="off" onSubmit={submit}>
        <button
          type="button"
          className={s["sv-attach"]}
          aria-label={t("applications.ariaAttach")}
          onClick={() => toast(t("applications.toastAttach"))}
        >
          <MIc name="plus" />
        </button>
        <input
          className={s["sv-input"]}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("applications.composerPlaceholder")}
          aria-label={t("applications.composerPlaceholder")}
        />
        <button
          type="submit"
          className={s["sv-send"]}
          aria-label={t("applications.ariaSend")}
          disabled={!draft.trim() || send.isPending}
        >
          <MIc name="send" />
        </button>
      </form>
    </>
  );
}
