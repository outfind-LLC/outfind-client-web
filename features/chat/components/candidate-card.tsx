"use client";

import { useCandidateDetailStore } from "@/features/applications/store/candidate-detail.store";
import type { CandidateCardData } from "@/features/chat/types/candidate";
import { Ic } from "@/features/dashboard/components/app-icons";
import { cn } from "@/lib/utils";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

const AV_COLORS = [
  "#4a49cf",
  "#ff6b00",
  "#3158f6",
  "#58b685",
  "#0f0f10",
  "#7c3aed",
  "#e11d48",
];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
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

/**
 * A candidate result inside an employer assistant message — same card shape as a
 * job card, with a coloured avatar, availability tag, and skills. Opens the
 * candidate detail sheet. Verified candidates carry the Peoplor badge.
 */
export function CandidateCard({ candidate }: { candidate: CandidateCardData }) {
  const open = useCandidateDetailStore((st) => st.openCandidate);

  return (
    <button type="button" onClick={() => open(candidate)} className={s.jcard}>
      <div className={s["jc-top"]}>
        <div
          className={cn(s["jc-logo"], s["jc-cand-av"])}
          style={{ background: avatarColor(candidate.id) }}
        >
          {initials(candidate.name)}
        </div>
        <div className={s["jc-main"]}>
          <div className={s["jc-role"]}>
            <span>{candidate.name}</span>
            {candidate.verified ? (
              <Ic name="verified" className={s["jc-verified"]} title="Verified by Peoplor" />
            ) : null}
          </div>
          {candidate.title || candidate.location ? (
            <div className={s["jc-co"]}>
              {candidate.title ? <span>{candidate.title}</span> : null}
              {candidate.title && candidate.location ? (
                <span className={s.dotsep} />
              ) : null}
              {candidate.location ? <span>{candidate.location}</span> : null}
            </div>
          ) : null}
        </div>
        {candidate.matchScore != null ? (
          <div className={s["jc-match"]}>
            <span className={s.pct}>{candidate.matchScore}% match</span>
          </div>
        ) : null}
      </div>

      {candidate.salary ? <div className={s["jc-salary"]}>{candidate.salary}</div> : null}

      {candidate.availability || candidate.skills.length > 0 ? (
        <div className={s["jc-tags"]}>
          {candidate.availability ? (
            <span className={cn(s.tag, s["tag-avail"])}>{candidate.availability}</span>
          ) : null}
          {candidate.skills.slice(0, 4).map((skill) => (
            <span key={skill} className={s.tag}>
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
