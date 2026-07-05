"use client";

import { useState, type KeyboardEvent } from "react";
import { toast } from "sonner";

import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import {
  useAddBookmark,
  useBookmarks,
  useRemoveBookmark,
  useSaveExternalJob,
} from "@/features/bookmarks/hooks/use-bookmarks";
import { isConciseSalary, type JobCardData } from "@/features/chat/types/job";
import { ChatMark, Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SaveExternalJobPayload } from "@/interfaces/engagement.interface";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/** Build the save payload for a live-web job that has no vacancy id yet. */
function toExternalPayload(job: JobCardData): SaveExternalJobPayload {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    applyUrl: job.applyUrl ?? null,
    source: job.source ?? null,
    salary: job.salary,
    jobType: job.jobType,
    isRemote: job.isRemote,
    description: job.description,
    skills: job.skills,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    contact: job.contact,
  };
}

/**
 * A single job result inside an assistant message — a compact, tappable summary
 * that opens the right-side detail sheet. Platform vacancies carry the Peoplor
 * brand mark + a verified badge; roles Peoplor found online carry neither. Any
 * job backed by a vacancy id (platform OR a sourced job saved in our DB) can be
 * saved with the bookmark button — saved jobs appear under Saved & applied.
 */
export function JobCard({ job }: { job: JobCardData }) {
  const t = useT();
  const openDetail = useJobDetailPanelStore((st) => st.openDetail);
  const isPlatform = job.isPlatform ?? job.id !== null;

  const bookmarks = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const saveExternal = useSaveExternalJob();

  // The vacancy id: known up-front for platform / DB-cached jobs, or resolved
  // after a live-web job is persisted the first time it's saved.
  const [resolvedId, setResolvedId] = useState<string | null>(job.id);
  const saved = Boolean(
    resolvedId &&
    (bookmarks.data ?? []).some((b) => b.vacancyId === resolvedId),
  );
  const saving =
    saveExternal.isPending || addBookmark.isPending || removeBookmark.isPending;

  const toggleSave = () => {
    if (saving) return;
    if (resolvedId) {
      if (saved) removeBookmark.mutate(resolvedId);
      else addBookmark.mutate({ vacancyId: resolvedId });
    } else {
      // Live-web job: persist it (deduped into our DB) + bookmark it.
      saveExternal.mutate(toExternalPayload(job), {
        onSuccess: (bookmark) => setResolvedId(bookmark.vacancyId),
        onError: () => toast.error(t("chat.saveError")),
      });
    }
  };

  // Only platform vacancies load the in-app detail (which fetches the vacancy);
  // sourced jobs open the external sheet from the card data (no fetch → no error).
  const open = () => openDetail(job, isPlatform ? job.id : null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  // The card surfaces a couple of short tags; the full skill list lives in the sheet.
  const tags: string[] = [];
  if (job.jobType) tags.push(job.jobType);
  if (job.isRemote) tags.push(t("chat.remote"));
  for (const skill of job.skills) {
    if (tags.length >= 3) break;
    tags.push(skill);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={onKeyDown}
      className={s.jcard}
    >
      <div className={s["jc-top"]}>
        {isPlatform ? (
          <div
            className={cn(s["jc-logo"], s["jc-logo-platform"])}
            title={t("chat.postedOn")}
          >
            <ChatMark />
          </div>
        ) : null}
        <div className={s["jc-main"]}>
          <div className={s["jc-role"]}>
            <span>{job.title}</span>
            {isPlatform ? (
              <span
                className={s["jc-verified"]}
                title={t("chat.verifiedEmployer")}
              >
                <Ic name="checkBold" className={s["jc-verified-ic"]} />
              </span>
            ) : null}
          </div>
          {job.company || job.location ? (
            <div className={s["jc-co"]}>
              {job.company ? <span>{job.company}</span> : null}
              {job.company && job.location ? (
                <span className={s.dotsep} />
              ) : null}
              {job.location ? <span>{job.location}</span> : null}
            </div>
          ) : null}
        </div>
        {job.matchScore != null ? (
          <div className={s["jc-match"]}>
            <span className={s.pct}>
              {t("chat.cardMatch", { n: job.matchScore })}
            </span>
          </div>
        ) : null}
        <button
          type="button"
          className={cn(s["jc-save"], saved && s["jc-save-on"])}
          aria-label={saved ? t("chat.saved") : t("chat.save")}
          aria-pressed={saved}
          disabled={saving}
          onClick={(e) => {
            e.stopPropagation();
            toggleSave();
          }}
        >
          <Ic name="bookmark" />
        </button>
      </div>

      {isConciseSalary(job.salary) ? (
        <div className={s["jc-salary"]}>{job.salary}</div>
      ) : null}

      {tags.length > 0 ? (
        <div className={s["jc-tags"]}>
          {tags.map((tag) => (
            <span key={tag} className={s.tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {job.postedAt ? (
        <div className={s["jc-foot"]}>
          <span className={s["jc-posted"]}>
            {t("chat.cardPosted", { when: formatRelativeTime(job.postedAt) })}
          </span>
        </div>
      ) : null}
    </div>
  );
}
