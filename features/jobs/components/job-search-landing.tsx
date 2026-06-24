"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { useSession } from "@/features/auth/hooks/use-session";
import { JobSearchModal } from "@/features/jobs/components/job-search-modal";
import { ChatMark, Ic } from "@/features/dashboard/components/app-icons";
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
 * mark, the lead question, a search composer, and one-tap suggestion chips.
 *
 * The composer is intentionally free-text to match the design, but the backend's
 * JOB_FINDER specialist needs a structured profession + city (see the search
 * modal). So a submission seeds the profession into the modal, which confirms the
 * city before the search starts and the chat thread opens.
 */
export function JobSearchLanding() {
  const { isWorker } = useSession();
  const profileQuery = useWorkerProfile(Boolean(isWorker));

  const [seedProfession, setSeedProfession] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [input, setInput] = useState("");

  const openSearch = (profession: string | null) => {
    setSeedProfession(profession);
    setModalOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    openSearch(text);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (input.trim()) openSearch(input.trim());
    }
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

      <form className={s.composer} autoComplete="off" onSubmit={submit}>
        <textarea
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search jobs…"
          aria-label="Search jobs"
          autoFocus
        />
        <button
          type="submit"
          className={s.send}
          aria-label="Search"
          disabled={!input.trim()}
        >
          <Ic name="arrowUp" />
        </button>
      </form>

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
