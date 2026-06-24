"use client";

import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import type { JobCardData } from "@/features/chat/types/job";
import { ChatMark, Ic } from "@/features/dashboard/components/app-icons";
import { cn } from "@/lib/utils";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/**
 * A single job result inside an assistant message — a compact, tappable summary
 * that opens the right-side detail sheet. Platform vacancies (an internal
 * `job.id`) carry the Peoplor brand mark + a verified badge; roles Peoplor found
 * online carry neither — matching the prototype exactly.
 */
export function JobCard({ job }: { job: JobCardData }) {
  const openDetail = useJobDetailPanelStore((st) => st.openDetail);
  const isPlatform = job.id !== null;

  // The card surfaces a couple of short tags; the full skill list lives in the sheet.
  const tags: string[] = [];
  if (job.jobType) tags.push(job.jobType);
  if (job.isRemote) tags.push("Remote");
  for (const skill of job.skills) {
    if (tags.length >= 3) break;
    tags.push(skill);
  }

  return (
    <button type="button" onClick={() => openDetail(job, job.id)} className={s.jcard}>
      <div className={s["jc-top"]}>
        {isPlatform ? (
          <div className={cn(s["jc-logo"], s["jc-logo-platform"])} title="Posted on Peoplor">
            <ChatMark />
          </div>
        ) : null}
        <div className={s["jc-main"]}>
          <div className={s["jc-role"]}>
            <span>{job.title}</span>
            {isPlatform ? (
              <Ic name="verified" className={s["jc-verified"]} title="Verified employer" />
            ) : null}
          </div>
          {job.company || job.location ? (
            <div className={s["jc-co"]}>
              {job.company ? <span>{job.company}</span> : null}
              {job.company && job.location ? <span className={s.dotsep} /> : null}
              {job.location ? <span>{job.location}</span> : null}
            </div>
          ) : null}
        </div>
      </div>

      {job.salary ? <div className={s["jc-salary"]}>{job.salary}</div> : null}

      {tags.length > 0 ? (
        <div className={s["jc-tags"]}>
          {tags.map((tag) => (
            <span key={tag} className={s.tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
