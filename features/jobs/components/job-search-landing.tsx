"use client";

import { useState } from "react";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { useSession } from "@/features/auth/hooks/use-session";
import { ChatComposer } from "@/features/chat/components/chat-composer";
import { JobSearchModal } from "@/features/jobs/components/job-search-modal";
import { useStartConversation } from "@/features/chat/hooks/use-conversations";
import {
  ChatMark,
  Ic,
  type IconName,
} from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";
import { isApiClientError } from "@/lib/api/error";
import {
  ACCOUNT_TYPE,
  AI_SPECIALIST,
  type AiSpecialist,
} from "@/interfaces/enums";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/** The landing's three entry points (the row under the composer). */
type LandingMode = "visa" | "search" | "assist";

const MODES: {
  key: LandingMode;
  icon: IconName;
  labelKey: MessageKey;
}[] = [
  { key: "visa", icon: "docCheck", labelKey: "chat.modeVisa" },
  { key: "search", icon: "search", labelKey: "chat.modeSearch" },
  { key: "assist", icon: "sparkle", labelKey: "chat.modeAssist" },
];

/** Chat specialist behind each conversational mode. */
const MODE_SPECIALIST: Record<Exclude<LandingMode, "search">, AiSpecialist> = {
  visa: AI_SPECIALIST.RELOCATION_GUIDE,
  assist: AI_SPECIALIST.CAREER_ASSISTANT,
};

/**
 * Job Search "New job" landing — the animated brand mark, the lead question,
 * the composer, and three modes at the bottom: Visa documentation, Search jobs
 * (default), and AI assistance.
 *
 * Search jobs keeps the structured flow: free text seeds the profession into
 * the search modal, which confirms the city before the JOB_FINDER thread opens.
 * Visa documentation and AI assistance are conversational — the typed question
 * starts a thread with that specialist (RELOCATION_GUIDE / CAREER_ASSISTANT),
 * which replies in the user's own language.
 */
export function JobSearchLanding() {
  const t = useT();
  const { user, isWorker } = useSession();
  const profileQuery = useWorkerProfile(Boolean(isWorker));
  const startConversation = useStartConversation(routes.jobsThread);

  const [mode, setMode] = useState<LandingMode>("search");
  const [seedProfession, setSeedProfession] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openSearch = (profession: string | null) => {
    setSeedProfession(profession);
    setModalOpen(true);
  };

  const startChat = (specialist: AiSpecialist, message: string) => {
    if (startConversation.isPending) return;
    startConversation.mutate(
      { message, specialist },
      {
        onError: (error) =>
          toast.error(
            isApiClientError(error) ? error.message : t("chat.startConvError"),
          ),
      },
    );
  };

  const send = (text: string) => {
    if (mode === "search") openSearch(text);
    else startChat(MODE_SPECIALIST[mode], text);
  };

  const pickMode = (next: LandingMode) => {
    setMode(next);
    // Search is one-tap: choosing it opens the search form right away.
    if (next === "search") openSearch(null);
  };

  const placeholder =
    mode === "visa"
      ? t("chat.visaPlaceholder")
      : mode === "assist"
        ? t("chat.assistPlaceholder")
        : t("chat.composerPlaceholder");

  return (
    <div className={s.landing}>
      <div className={s.hero}>
        <div className={s["hero-head"]}>
          <ChatMark className={s["hero-mark"]} />
          <h1 className={s["hero-title"]}>{t("chat.heroTitle")}</h1>
        </div>
      </div>

      <ChatComposer
        accountType={user?.accountType ?? ACCOUNT_TYPE.WORKER}
        busy={startConversation.isPending}
        onSend={send}
        autoFocus
        placeholder={placeholder}
        showFoot={false}
      />

      <div className={s["hero-chips"]}>
        {MODES.map(({ key, icon, labelKey }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => pickMode(key)}
          >
            <Ic name={icon} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      <JobSearchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultProfession={
          seedProfession ?? profileQuery.data?.profession ?? ""
        }
        defaultCity={profileQuery.data?.currentCity ?? ""}
      />
    </div>
  );
}
