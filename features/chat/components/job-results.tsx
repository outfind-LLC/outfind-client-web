"use client";

import { useState } from "react";

import { Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import type { JobCardData } from "@/features/chat/types/job";
import { JobCard } from "./job-card";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/** How many matches are shown before the "Show N more" expander. */
const INITIAL = 5;

/**
 * ONE consolidated match list for an assistant turn. The Job Finder may call its
 * search tools several times in a single reply; instead of a separate "N matches"
 * group per call (1 → 4 → 10…), all cards are merged + de-duplicated here into a
 * single ranked list with one count header and a "Show N more matches" expander
 * — matching the prototype.
 */
export function JobResults({ jobs }: { jobs: JobCardData[] }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);

  const shown = expanded ? jobs : jobs.slice(0, INITIAL);
  const remaining = jobs.length - shown.length;

  return (
    <div className={s.jobs}>
      <div className={s["jobs-head"]}>
        <span className={s.ttl}>
          {jobs.length === 1
            ? t("chat.matchCountOne")
            : t("chat.matchCount", { n: jobs.length })}
        </span>
        <span className={s.sub}>{t("chat.rankedByFit")}</span>
      </div>

      {shown.map((job, index) => (
        <JobCard key={job.id ?? `${job.title}-${index}`} job={job} />
      ))}

      {remaining > 0 ? (
        <button
          type="button"
          className={s["jobs-more"]}
          onClick={() => setExpanded(true)}
        >
          <span>{t("chat.showMoreMatches", { n: remaining })}</span>
          <Ic name="chevronDown" />
        </button>
      ) : null}
    </div>
  );
}
