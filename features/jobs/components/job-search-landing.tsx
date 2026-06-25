"use client";

import { useState } from "react";

import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { useSession } from "@/features/auth/hooks/use-session";
import { ChatComposer } from "@/features/chat/components/chat-composer";
import { JobSearchModal } from "@/features/jobs/components/job-search-modal";
import { ChatMark } from "@/features/dashboard/components/app-icons";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/** Common starting points so workers can search in one tap. */
const QUICK_PROFESSIONS = [
  "Truck driver",
  "Warehouse work",
  "Delivery courier",
  "Cleaner",
  "Welder",
  "Care assistant",
];

/**
 * Job Search "New job" landing — the prototype's empty state: the animated brand
 * mark, the lead question, the search composer, and one-tap suggestion chips.
 *
 * Reuses the shared {@link ChatComposer} so the input is pixel-identical to the
 * chat composer (full-width pill, voice mic, send) — not a stripped-down variant.
 * The composer is free-text to match the design, but JOB_FINDER needs a structured
 * profession + city, so a submission seeds the profession into the search modal,
 * which confirms the city before the search starts and the thread opens.
 */
export function JobSearchLanding() {
  const { user, isWorker } = useSession();
  const profileQuery = useWorkerProfile(Boolean(isWorker));

  const [seedProfession, setSeedProfession] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openSearch = (profession: string | null) => {
    setSeedProfession(profession);
    setModalOpen(true);
  };

  return (
    <div className={s.landing}>
      <div className={s.hero}>
        <div className={s["hero-head"]}>
          <ChatMark className={s["hero-mark"]} />
          <h1 className={s["hero-title"]}>
            What kind of role are you looking for?
          </h1>
        </div>
      </div>

      <ChatComposer
        accountType={user?.accountType ?? ACCOUNT_TYPE.WORKER}
        busy={false}
        onSend={(text) => openSearch(text)}
        autoFocus
        placeholder="Search jobs…"
        showFoot={false}
      />

      <div className={s["hero-chips"]}>
        {QUICK_PROFESSIONS.map((profession) => (
          <button
            key={profession}
            type="button"
            onClick={() => openSearch(profession)}
          >
            {profession}
          </button>
        ))}
      </div>

      <JobSearchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultProfession={seedProfession ?? profileQuery.data?.profession ?? ""}
        defaultCity={profileQuery.data?.currentCity ?? ""}
      />
    </div>
  );
}
