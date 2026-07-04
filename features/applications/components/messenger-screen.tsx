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
  useEmployerApplications,
} from "@/features/applications/hooks/use-applications";
import {
  useApplicationMessages,
  useMarkApplicationRead,
  useSendApplicationMessage,
} from "@/features/applications/hooks/use-application-messages";
import {
  useBookmarks,
  useRemoveBookmark,
} from "@/features/bookmarks/hooks/use-bookmarks";
import { useCandidateProfile } from "@/features/applications/hooks/use-candidate-profile";
import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import type {
  WorkerEducation,
  WorkerExperience,
  WorkerLanguage,
} from "@/interfaces/worker-profile.interface";
import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import { useCandidateDetailStore } from "@/features/applications/store/candidate-detail.store";
import {
  useEmployerShortlist,
  useRemoveFromShortlist,
} from "@/features/applications/hooks/use-shortlist";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { ICONS as REG } from "@/components/icons";
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
import type { ShortlistCandidate } from "@/interfaces/candidate.interface";
import type { CandidateCardData } from "@/features/chat/types/candidate";
import type { JobCardData } from "@/features/chat/types/job";
import type { MessageKey } from "@/lib/i18n/translate";
import type { TranslateFn } from "@/providers/i18n-provider";
import s from "@/features/applications/styles/messenger.module.css";

/* Messenger icon names → central registry entries (glyph data: @/components/icons) */
const MICONS = {
  back: REG.back,
  send: REG.arrowUp,
  phone: REG.phoneClassic,
  check: REG.check,
  checks: REG.checks,
  plus: REG.plusBold,
  bookmark: REG.bookmarkCard,
  open: REG.externalLink,
  wallet: REG.wallet,
  menu: REG.menuShort,
  chat: REG.chat,
  eye: REG.eye,
  dots: REG.dotsVertical,
  verified: REG.verifiedSeal,
  brief: REG.briefcase,
  pin: REG.pin,
  clock: REG.clock,
  doc: REG.fileText,
  mail: REG.mail,
} as const;
function MIc({
  name,
  className,
}: {
  name: keyof typeof MICONS;
  className?: string;
}) {
  return (
    <span
      className={cn(s.ic, className)}
      style={{ "--i": MICONS[name] } as CSSProperties}
      aria-hidden="true"
    />
  );
}

/* ---------------- avatar + formatting helpers ------------------------------- */
const AV_COLORS = [
  "#3158f6",
  "#22a06b",
  "#ff6b00",
  "#7a5af5",
  "#0f9bb3",
  "#e0532e",
  "#9b51e0",
];
function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AV_COLORS[hash % AV_COLORS.length];
}
function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
/** Chat-list timestamp: today → time, this week → weekday, older → dd.mm. */
function inboxDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(d)) / 86400000,
  );
  if (diffDays <= 0)
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
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
  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(d)) / 86400000,
  );
  if (diffDays <= 0) return t("applications.dayToday");
  if (diffDays === 1) return t("applications.dayYesterday");
  return d.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

/* ---------------- status mapping (backend enum → design status) ------------- */
type DisplayStatus =
  | "interview"
  | "reply"
  | "applied"
  | "viewed"
  | "done"
  | "rejected";
const STATUS_LABEL_KEY: Record<DisplayStatus, MessageKey> = {
  interview: "applications.statusInterview",
  reply: "applications.statusReply",
  applied: "applications.statusApplied",
  viewed: "applications.statusViewed",
  done: "applications.statusInReview",
  rejected: "applications.statusRejected",
};
/** Employer labels differ from the worker's (prototype `sv.status.*#hire`). */
const EMPLOYER_STATUS_LABEL_KEY: Record<DisplayStatus, MessageKey> = {
  interview: "candidates.statusInterview",
  reply: "candidates.statusReplied",
  applied: "candidates.statusNewApplicant",
  viewed: "candidates.statusProfileViewed",
  done: "candidates.statusHired",
  rejected: "candidates.statusPassed",
};
/** Worker view: dynamic status — an unread employer message reads as "New reply". */
function workerStatus(a: Application): DisplayStatus {
  if (a.status === APPLICATION_STATUS.REJECTED) return "rejected";
  if (a.status === APPLICATION_STATUS.ACCEPTED) return "interview";
  if (a.unreadCount > 0 && a.lastMessageSenderRole === "EMPLOYER")
    return "reply";
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
/** Worker status → human availability label (shared with Settings → Job search). */
const AVAIL_LABEL_KEY: Partial<Record<string, MessageKey>> = {
  ACTIVE: "settings.searchActive",
  PASSIVE: "settings.searchOpen",
  OFFLINE: "settings.searchClosed",
};

/** Map a backend shortlist row to the candidate card the detail sheet expects. */
function shortlistCard(
  c: ShortlistCandidate,
  t: TranslateFn,
): CandidateCardData {
  const availKey = AVAIL_LABEL_KEY[c.availability];
  return {
    id: c.id,
    name: c.name,
    title: c.title,
    location: c.location,
    salary: c.salary,
    skills: c.skills,
    availability: availKey ? t(availKey) : null,
    years: c.years,
    matchScore: c.matchScore,
    verified: c.verified,
    summary: null,
    experience: [],
    contact: {
      email: null,
      phone: null,
      telegram: null,
      whatsapp: null,
      website: null,
    },
  };
}

const TYPE_LABEL_KEY: Record<VacancyType, MessageKey> = {
  [VACANCY_TYPE.FULL_TIME]: "applications.typeFullTime",
  [VACANCY_TYPE.PART_TIME]: "applications.typePartTime",
  [VACANCY_TYPE.CONTRACT]: "applications.typeContract",
  [VACANCY_TYPE.SEASONAL]: "applications.typeSeasonal",
  [VACANCY_TYPE.INTERNSHIP]: "applications.typeInternship",
  [VACANCY_TYPE.SHIFT_WORK]: "applications.typeShiftWork",
  [VACANCY_TYPE.FREELANCE]: "applications.typeFreelance",
  [VACANCY_TYPE.TEMPORARY]: "applications.typeTemporary",
};
function formatBookmarkSalary(
  v: BookmarkVacancyPreview,
  t: TranslateFn,
  locale: string,
): string | null {
  if (v.salaryRaw) return v.salaryRaw;
  const cur = v.currency ? ` ${v.currency}` : "";
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  if (v.salaryMin != null && v.salaryMax != null)
    return `${fmt(v.salaryMin)}–${fmt(v.salaryMax)}${cur}`;
  if (v.salaryMin != null)
    return t("applications.salaryFrom", {
      amount: `${fmt(v.salaryMin)}${cur}`,
    });
  if (v.salaryMax != null) return `${fmt(v.salaryMax)}${cur}`;
  return null;
}
function savedTags(v: BookmarkVacancyPreview, t: TranslateFn): string[] {
  const tags: string[] = [];
  if (v.type) tags.push(t(TYPE_LABEL_KEY[v.type]));
  tags.push(
    v.isRemote ? t("applications.workRemote") : t("applications.workOnSite"),
  );
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
function jobFromBookmark(
  v: BookmarkVacancyPreview,
  salary: string | null,
): JobCardData {
  return {
    id: v.id,
    title: v.title,
    company: v.companyName,
    location: [v.city, v.country].filter(Boolean).join(", ") || null,
    salary,
    skills: v.skills ?? [],
    isRemote: v.isRemote,
    jobType: null,
    description: v.description,
    requirements: v.requirements ?? [],
    responsibilities: v.responsibilities ?? [],
    contact: { ...EMPTY_CONTACT, ...v.contact },
    matchScore: null,
    postedAt: null,
    // Carry source so a saved SOURCED job opens the external detail (apply link
    // / contacts / board) instead of the in-app "Apply with my CV" flow.
    isPlatform: v.isPlatform,
    applyUrl: v.applyUrl,
    source: v.source,
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
  matchScore: number | null;
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
    matchScore: null,
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
    statusLabelKey: EMPLOYER_STATUS_LABEL_KEY[st],
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
    matchScore: e.matchScore,
  };
}

const QUICK_KEYS: MessageKey[] = [
  "applications.quickThanks",
  "applications.quickAvailable",
  "applications.quickLocation",
  "applications.quickRemote",
  "applications.quickNext",
];
/** Employer quick replies (prototype `sv.quick.*#hire`). */
const EMPLOYER_QUICK_KEYS: MessageKey[] = [
  "candidates.quickThanks",
  "candidates.quickStart",
  "candidates.quickLocal",
  "candidates.quickShareCv",
  "candidates.quickBook",
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
  const [sub, setSub] = useState<"thread" | "detail" | "cv">("thread");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const threads = useMemo<Thread[]>(() => {
    if (employer)
      return (employerApps.data ?? []).map((e) => employerThread(e, locale));
    return (workerApps.data ?? []).map((a) => workerThread(a, locale));
  }, [employer, employerApps.data, workerApps.data, locale]);

  const totalUnread = useMemo(
    () => threads.reduce((n, th) => n + th.unreadCount, 0),
    [threads],
  );

  const open = openId ? (threads.find((th) => th.id === openId) ?? null) : null;
  const loading = employer ? employerApps.isLoading : workerApps.isLoading;

  if (open) {
    if (employer && sub === "detail") {
      return (
        <div className={s.screen}>
          <CandidateDetailView
            thread={open}
            onBack={() => setSub("thread")}
            onOpenCv={() => setSub("cv")}
          />
        </div>
      );
    }
    if (sub === "cv") {
      return (
        <div className={s.screen}>
          {employer ? (
            <CandidateCvView thread={open} onBack={() => setSub("thread")} />
          ) : (
            <WorkerCvView thread={open} onBack={() => setSub("thread")} />
          )}
        </div>
      );
    }
    return (
      <div className={s.screen}>
        <ThreadView
          scope={scope}
          thread={open}
          onBack={() => {
            setOpenId(null);
            setSub("thread");
          }}
          onViewProfile={() => setSub("detail")}
          onViewCv={() => setSub("cv")}
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
          aria-label={t("applications.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <MIc name="menu" />
        </button>
        <div className={s["sv-title"]}>
          {employer ? t("nav.chat") : t("applications.tabSaved")}
        </div>
      </header>

      {/* Workers see only Saved for now — Applied is employer-conversation-based
          and doesn't apply to sourced jobs. Employer keeps both tabs. */}
      {employer ? (
        <div className={s["sv-tabs"]}>
          <button
            type="button"
            className={cn(s["sv-tab"], tab === "applied" && s.on)}
            onClick={() => setTab("applied")}
          >
            {t("candidates.tabConversations")}
            {totalUnread > 0 ? (
              <span className={s["sv-tabbadge"]}>{totalUnread}</span>
            ) : null}
          </button>
          <button
            type="button"
            className={cn(s["sv-tab"], tab === "saved" && s.on)}
            onClick={() => setTab("saved")}
          >
            {t("candidates.tabShortlist")}
          </button>
        </div>
      ) : null}

      <div className={s["sv-scroll"]}>
        {!employer ? (
          <SavedTab employer={false} bookmarks={bookmarks.data ?? []} />
        ) : tab === "applied" ? (
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
  const { t } = useI18n();

  if (loading) {
    return (
      <div className={s["sv-list"]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={s["sv-item"]} aria-hidden="true">
            <span className={s["sv-avwrap"]}>
              <span
                className={s["sv-av"]}
                style={{ background: "var(--bg-secondary-hover)" }}
              />
            </span>
            <span className={s["sv-item-main"]}>
              <span
                className={s["sv-role"]}
                style={{
                  height: 14,
                  background: "var(--bg-secondary-hover)",
                  borderRadius: 6,
                  maxWidth: 180,
                }}
              />
              <span
                className={s["sv-co"]}
                style={{
                  height: 12,
                  background: "var(--bg-secondary-hover)",
                  borderRadius: 6,
                  maxWidth: 120,
                }}
              />
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
        title={
          employer
            ? t("candidates.emptyNoApplicants")
            : t("applications.emptyNoApps")
        }
        desc={
          employer
            ? t("candidates.emptyNoApplicantsDesc")
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
                          <span
                            className={cn(
                              s["sv-tick"],
                              th.lastMessageRead && s["sv-tick--read"],
                            )}
                          >
                            <MIc
                              name={th.lastMessageRead ? "checks" : "check"}
                            />
                          </span>
                        ) : null}
                        {th.date}
                      </span>
                    )}
                  </span>
                </span>
                {th.subLine ? (
                  <span className={s["sv-co"]}>
                    {employer
                      ? t("candidates.appliedInbox", { role: th.subLine })
                      : th.subLine}
                  </span>
                ) : null}
                <span
                  className={cn(
                    s["sv-status"],
                    s[`sv-status--${th.statusCls}`],
                  )}
                >
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
}: {
  employer: boolean;
  bookmarks: Bookmark[];
}) {
  const { t, locale } = useI18n();
  const removeBookmark = useRemoveBookmark();
  const openDetail = useJobDetailPanelStore((st) => st.openDetail);
  const openCandidate = useCandidateDetailStore((st) => st.openCandidate);
  // Employer shortlist — real backend data (`GET /employer/shortlist`).
  const shortlistQ = useEmployerShortlist(employer);
  const removeShortlist = useRemoveFromShortlist();

  if (employer) {
    const shortlist = shortlistQ.data ?? [];
    if (shortlistQ.isLoading) return null;
    if (shortlist.length === 0) {
      return (
        <Empty
          icon="bookmark"
          title={t("candidates.emptyNoShortlist")}
          desc={t("candidates.emptyNoShortlistDesc")}
        />
      );
    }
    return (
      <div className={s["sv-saved"]}>
        {shortlist.map((sc) => {
          const c = shortlistCard(sc, t);
          const tags = [
            ...c.skills.slice(0, 1),
            ...(c.years != null
              ? [t("candidates.yearsShort", { n: c.years })]
              : []),
          ];
          return (
            <div key={c.id} className={s["sv-job"]}>
              <div className={s["sv-job-top"]}>
                <span
                  className={s["sv-av"]}
                  style={{ background: avatarColor(c.name) }}
                >
                  {initials(c.name)}
                </span>
                <div className={s["sv-job-head"]}>
                  <div className={s["sv-job-role"]}>{c.name}</div>
                  <div className={s["sv-co"]}>
                    {[c.title, c.location].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <button
                  type="button"
                  className={s["sv-job-save"]}
                  aria-label={t("applications.removeSaved")}
                  onClick={() =>
                    removeShortlist.mutate(c.id, {
                      onSuccess: () => toast(t("applications.toastRemoved")),
                    })
                  }
                >
                  <MIc name="bookmark" />
                </button>
              </div>
              <div className={s["sv-job-meta"]}>
                {c.salary ? (
                  <span className={s["sv-job-pay"]}>
                    <MIc name="wallet" />
                    {c.salary}
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
                  onClick={() => openCandidate(c)}
                >
                  {t("candidates.viewProfile")}
                </button>
                <button
                  type="button"
                  className={cn(s["sv-btn"], s["sv-btn-primary"])}
                  onClick={() =>
                    toast(t("candidates.msgOpened", { name: c.name }))
                  }
                >
                  {t("candidates.messageBtn")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
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

  // Saved jobs open the job detail (these can be sourced jobs with no employer
  // conversation) — not a chat thread. Platform vacancies still support in-app
  // apply from the detail sheet itself.
  const onView = (b: Bookmark) => {
    const salary = formatBookmarkSalary(b.vacancy, t, locale);
    // Only platform vacancies load the in-app detail; sourced jobs open the
    // external sheet from the saved data (apply link / contacts / board).
    openDetail(
      jobFromBookmark(b.vacancy, salary),
      b.vacancy.isPlatform ? b.vacancyId : null,
    );
  };
  const onUnsave = (b: Bookmark) => {
    removeBookmark.mutate(b.vacancyId);
    toast(t("applications.toastRemoved"));
  };

  return (
    <div className={s["sv-saved"]}>
      {bookmarks.map((b) => {
        const v = b.vacancy;
        const label = v.companyName ?? v.title;
        const salary = formatBookmarkSalary(v, t, locale);
        const tags = savedTags(v, t);
        return (
          <div
            key={b.id}
            className={s["sv-job"]}
            role="button"
            tabIndex={0}
            onClick={() => onView(b)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onView(b);
              }
            }}
          >
            <div className={s["sv-job-top"]}>
              <span
                className={s["sv-av"]}
                style={{ background: avatarColor(label) }}
              >
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
                onClick={(e) => {
                  e.stopPropagation();
                  onUnsave(b);
                }}
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
  onViewProfile,
  onViewCv,
}: {
  scope: ConversationScope;
  thread: Thread;
  onBack: () => void;
  onViewProfile?: () => void;
  onViewCv?: () => void;
}) {
  const { t, locale } = useI18n();
  const employer = scope === "employer";
  const { data: messages, isLoading } = useApplicationMessages(
    scope,
    thread.id,
    true,
  );
  const send = useSendApplicationMessage(scope, thread.id);
  const markRead = useMarkApplicationRead(scope, thread.id);
  const openDetail = useJobDetailPanelStore((st) => st.openDetail);
  const [draft, setDraft] = useState("");
  const msgsRef = useRef<HTMLDivElement>(null);
  const me: ApplicationMessageSender =
    scope === "worker" ? "WORKER" : "EMPLOYER";

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
    send.mutate(text, {
      onError: () => toast.error(t("applications.errorSend")),
    });
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
          <span
            className={cn(s["sv-av"], s["sv-av--sm"])}
            style={{ background: thread.color }}
          >
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
        <button
          type="button"
          className={s["sv-iconbtn"]}
          aria-label={t("applications.ariaCall")}
          onClick={() => toast(t("applications.toastCalling"))}
        >
          <MIc name="phone" />
        </button>
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
          {employer ? (
            <button
              type="button"
              className={s["sv-pin-l"]}
              onClick={onViewCv}
              aria-label={t("candidates.viewCv")}
            >
              {t("candidates.pinApplied")}
              <span className={s["sv-pin-cv"]}>
                <MIc name="doc" />
                {t("candidates.viewCv")}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className={s["sv-pin-l"]}
              onClick={onViewCv}
              aria-label={t("applications.myCv")}
            >
              {t("applications.pinApplied")}
              <span className={s["sv-pin-cv"]}>
                <MIc name="doc" />
                {t("applications.myCv")}
              </span>
            </button>
          )}
          <span className={s["sv-pin-role"]}>
            {thread.vacancyTitle || thread.mainLine}
          </span>
        </div>
        {employer ? (
          <button
            type="button"
            className={s["sv-pin-go"]}
            onClick={onViewProfile}
          >
            {t("candidates.viewProfile")}
            <MIc name="open" />
          </button>
        ) : thread.vacancyId ? (
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
            <div className={s["sv-sys"]}>
              {t("applications.loadingConversation")}
            </div>
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
              const read =
                scope === "worker" ? m.readByEmployer : m.readByWorker;
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
        {(employer ? EMPLOYER_QUICK_KEYS : QUICK_KEYS).map((key) => {
          const label = t(key);
          return (
            <button
              key={key}
              type="button"
              className={s["sv-qchip"]}
              onClick={() => {
                if (send.isPending) return;
                send.mutate(label, {
                  onError: () => toast.error(t("applications.errorSend")),
                });
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
          placeholder={
            employer
              ? t("candidates.composerPlaceholder")
              : t("applications.composerPlaceholder")
          }
          aria-label={
            employer
              ? t("candidates.composerPlaceholder")
              : t("applications.composerPlaceholder")
          }
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

/* ---------------- candidate profile + CV (employer, from the thread pin) ----- */
function slugName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function expYear(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
}
/** Rough total years of experience: earliest start → latest end (or now). */
function totalYears(exps: WorkerExperience[]): number | null {
  if (exps.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const e of exps) {
    const s = new Date(e.startDate).getTime();
    const en = e.endDate ? new Date(e.endDate).getTime() : new Date().getTime();
    if (!Number.isNaN(s)) min = Math.min(min, s);
    if (!Number.isNaN(en)) max = Math.max(max, en);
  }
  if (min === Number.POSITIVE_INFINITY) return null;
  const years = Math.round((max - min) / (365.25 * 24 * 3600 * 1000));
  return years > 0 ? years : null;
}
function expBullets(description: string | null): string[] {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-•]\s*/, "").trim())
    .filter(Boolean);
}

/** The Candidate profile detail view — prototype `saved.js` detailHTML (hire). */
function CandidateDetailView({
  thread,
  onBack,
  onOpenCv,
}: {
  thread: Thread;
  onBack: () => void;
  onOpenCv: () => void;
}) {
  const { t } = useI18n();
  const { data: profile } = useCandidateProfile(thread.id);
  const name = profile?.name ?? thread.name;
  const role = profile?.profession ?? thread.subLine;
  const city = profile?.currentCity ?? null;
  const summary = profile?.summary ?? null;
  const experiences = profile?.experiences ?? [];
  const skills = profile?.skills ?? [];
  const years = totalYears(experiences);
  const matchScore = profile?.matchScore ?? thread.matchScore;

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
        <div className={s["sv-title"]}>{t("candidates.profileTitle")}</div>
      </header>

      <div className={cn(s["sv-scroll"], s["sv-d-scroll"])}>
        <div className={s["sv-d-wrap"]}>
          <div className={s["sv-d-hero"]}>
            <span
              className={cn(s["sv-av"], s["sv-d-av"])}
              style={{ background: thread.color }}
            >
              {thread.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thread.avatarUrl} alt="" />
              ) : (
                initials(name)
              )}
            </span>
            <div className={s["sv-d-name"]}>{name}</div>
            {role ? <div className={s["sv-d-role"]}>{role}</div> : null}
            <div className={s["sv-d-facts"]}>
              {city ? (
                <span className={s["sv-d-fact"]}>
                  <MIc name="pin" />
                  {city}
                </span>
              ) : null}
              <span className={s["sv-d-fact"]}>
                <MIc name="clock" />
                {t("candidates.recentlyActive")}
              </span>
            </div>
          </div>

          <div className={s["sv-d-stats"]}>
            <DStat
              n={years != null ? t("candidates.yearsShort", { n: years }) : "—"}
              l={t("candidates.statExperience")}
            />
            <DStat
              n={matchScore != null ? `${matchScore}%` : "—"}
              l={t("candidates.statMatch")}
            />
            <DStat
              n={t("candidates.identityPending")}
              l={t("candidates.statIdentity")}
            />
          </div>

          {summary ? (
            <section className={s["sv-sec"]}>
              <div className={s["sv-sec-h"]}>{t("candidates.about")}</div>
              <p className={s["sv-d-about"]}>{summary}</p>
            </section>
          ) : null}

          {experiences.length > 0 ? (
            <section className={s["sv-sec"]}>
              <div className={s["sv-sec-h"]}>{t("candidates.experience")}</div>
              <div className={s["sv-exp"]}>
                {experiences.map((e) => {
                  const bullets = expBullets(e.description);
                  const period = `${expYear(e.startDate)} — ${
                    e.endDate ? expYear(e.endDate) : t("candidates.present")
                  }`;
                  return (
                    <div key={e.id} className={s["sv-exp-item"]}>
                      <span className={s["sv-exp-ic"]}>
                        <MIc name="brief" />
                      </span>
                      <div>
                        <div className={s["sv-exp-role"]}>{e.position}</div>
                        <div className={s["sv-exp-co"]}>
                          {[e.companyName, period].filter(Boolean).join(" · ")}
                        </div>
                        {bullets.length > 0 ? (
                          <ul className={s["sv-exp-list"]}>
                            {bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {skills.length > 0 ? (
            <section className={s["sv-sec"]}>
              <div className={s["sv-sec-h"]}>{t("candidates.skills")}</div>
              <div className={s["sv-skills"]}>
                {skills.map((sk) => (
                  <span key={sk} className={s["sv-skill"]}>
                    {sk}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className={s["sv-d-foot"]}>
          <button
            type="button"
            className={cn(s["sv-btn"], s["sv-btn-ghost"])}
            onClick={onOpenCv}
          >
            <MIc name="doc" />
            {t("candidates.openFullCv")}
          </button>
          <button
            type="button"
            className={cn(s["sv-btn"], s["sv-btn-primary"])}
            onClick={onBack}
          >
            {t("candidates.backToChat")}
          </button>
        </div>
      </div>
    </>
  );
}

function DStat({ n, l }: { n: string; l: string }) {
  return (
    <div className={s["sv-d-stat"]}>
      <div className={s.n}>{n}</div>
      <div className={s.l}>{l}</div>
    </div>
  );
}

interface CvViewData {
  name: string;
  role: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  color: string;
  summary: string | null;
  experiences: WorkerExperience[];
  skills: string[];
  education: WorkerEducation[];
  languages: WorkerLanguage[];
}

/** Shared CV page (prototype `saved.js` cvHTML) — the sv-cv-* paper. Fed by the
 * candidate profile (employer views the applicant) or the worker's own profile
 * (worker views "My CV" for a job). */
function MessengerCvView({
  data,
  onBack,
}: {
  data: CvViewData;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const {
    name,
    role,
    city,
    phone,
    email,
    color,
    summary,
    experiences,
    skills,
    education,
    languages,
  } = data;

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
        <div className={s["sv-title"]}>{t("candidates.cvTitle")}</div>
        <button
          type="button"
          className={s["sv-iconbtn"]}
          aria-label={t("candidates.cvAriaOpen")}
          onClick={() => toast(t("applications.toastConvOptions"))}
        >
          <MIc name="open" />
        </button>
      </header>

      <div className={cn(s["sv-scroll"], s["sv-cv-scroll"])}>
        <div className={s["sv-cv-url"]}>
          <MIc name="doc" />
          <span>peoplor.uz/cv/{slugName(name)}</span>
        </div>
        <div className={s["sv-cv-paper"]}>
          <div className={s["sv-cv-head"]}>
            <div>
              <div className={s["sv-cv-name"]}>{name}</div>
              {role ? <div className={s["sv-cv-title"]}>{role}</div> : null}
            </div>
            <span
              className={cn(s["sv-av"], s["sv-cv-av"])}
              style={{ background: color }}
            >
              {initials(name)}
            </span>
          </div>

          <div className={s["sv-cv-contact"]}>
            {city ? (
              <span>
                <MIc name="pin" />
                {city}
              </span>
            ) : null}
            {phone ? (
              <span>
                <MIc name="phone" />
                {phone}
              </span>
            ) : null}
            {email ? (
              <span>
                <MIc name="mail" />
                {email}
              </span>
            ) : null}
          </div>

          {summary ? (
            <div className={s["sv-cv-sec"]}>
              <div className={s["sv-cv-h"]}>{t("candidates.cvProfile")}</div>
              <p className={s["sv-cv-p"]}>{summary}</p>
            </div>
          ) : null}

          {experiences.length > 0 ? (
            <div className={s["sv-cv-sec"]}>
              <div className={s["sv-cv-h"]}>{t("candidates.experience")}</div>
              {experiences.map((e) => {
                const bullets = expBullets(e.description);
                const period = `${expYear(e.startDate)} — ${
                  e.endDate ? expYear(e.endDate) : t("candidates.present")
                }`;
                return (
                  <div key={e.id} className={s["sv-cv-exp"]}>
                    <div className={s["sv-cv-exp-top"]}>
                      <span className={s["sv-cv-exp-role"]}>{e.position}</span>
                      <span className={s["sv-cv-exp-per"]}>{period}</span>
                    </div>
                    <div className={s["sv-cv-exp-co"]}>{e.companyName}</div>
                    {bullets.length > 0 ? (
                      <ul className={s["sv-cv-list"]}>
                        {bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {skills.length > 0 ? (
            <div className={s["sv-cv-sec"]}>
              <div className={s["sv-cv-h"]}>{t("candidates.skills")}</div>
              <div className={s["sv-skills"]}>
                {skills.map((sk) => (
                  <span key={sk} className={s["sv-skill"]}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {education.length > 0 ? (
            <div className={s["sv-cv-sec"]}>
              <div className={s["sv-cv-h"]}>{t("candidates.education")}</div>
              <ul className={s["sv-cv-list"]}>
                {education.map((ed) => (
                  <li key={ed.id}>
                    {[ed.degree, ed.fieldOfStudy, ed.institutionName]
                      .filter(Boolean)
                      .join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {languages.length > 0 ? (
            <div className={s["sv-cv-sec"]}>
              <div className={s["sv-cv-h"]}>{t("candidates.languages")}</div>
              <div className={s["sv-skills"]}>
                {languages.map((lg) => (
                  <span key={lg.id} className={s["sv-skill"]}>
                    {lg.language} — {lg.proficiency}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** Employer views the applicant's CV (candidate-profile endpoint). */
function CandidateCvView({
  thread,
  onBack,
}: {
  thread: Thread;
  onBack: () => void;
}) {
  const { data: profile } = useCandidateProfile(thread.id);
  return (
    <MessengerCvView
      onBack={onBack}
      data={{
        name: profile?.name ?? thread.name,
        role: profile?.profession ?? thread.subLine,
        city: profile?.currentCity ?? null,
        phone: profile?.contact?.phone ?? null,
        email: profile?.contact?.email ?? null,
        color: thread.color,
        summary: profile?.summary ?? null,
        experiences: profile?.experiences ?? [],
        skills: profile?.skills ?? [],
        education: profile?.education ?? [],
        languages: profile?.languages ?? [],
      }}
    />
  );
}

/** Worker views their OWN CV for the job ("My CV" from the thread pin). */
function WorkerCvView({
  thread,
  onBack,
}: {
  thread: Thread;
  onBack: () => void;
}) {
  const { user } = useSession();
  const { data: profile } = useWorkerProfile(true);
  const name = user?.name ?? thread.name;
  return (
    <MessengerCvView
      onBack={onBack}
      data={{
        name,
        role: profile?.profession ?? null,
        city: profile?.currentCity ?? null,
        phone: null,
        email: user?.email ?? null,
        color: avatarColor(name),
        summary: profile?.summary ?? null,
        experiences: profile?.experiences ?? [],
        skills: profile?.skills ?? [],
        education: profile?.education ?? [],
        languages: profile?.languages ?? [],
      }}
    />
  );
}
