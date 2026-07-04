"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

/** The landing's four entry points (the row under the composer). */
type LandingMode = "cv" | "assist" | "search" | "visa";

const MODES: {
  key: LandingMode;
  icon: IconName;
  labelKey: MessageKey;
}[] = [
  // CV builder opens the guided builder screen (gate → AI → templates →
  // download → public link) at /profile/cv.
  { key: "cv", icon: "fileText", labelKey: "chat.modeCv" },
  { key: "assist", icon: "zap", labelKey: "chat.modeAssist" },
  { key: "search", icon: "search", labelKey: "chat.modeSearch" },
  { key: "visa", icon: "docCheck", labelKey: "chat.modeVisa" },
];

/** Chat specialist behind each conversational mode. */
const MODE_SPECIALIST: Record<
  Exclude<LandingMode, "search" | "cv">,
  AiSpecialist
> = {
  assist: AI_SPECIALIST.CAREER_ASSISTANT,
  visa: AI_SPECIALIST.RELOCATION_GUIDE,
};

/** Composer hint per mode. */
const MODE_PLACEHOLDER: Record<LandingMode, MessageKey> = {
  cv: "chat.cvPlaceholder",
  assist: "chat.assistPlaceholder",
  search: "chat.composerPlaceholder",
  visa: "chat.visaPlaceholder",
};

/**
 * Job Search "New job" landing — the animated brand mark, the lead question,
 * the composer, and four modes at the bottom: CV builder, AI assistance,
 * Search jobs (default), and Visa documentation.
 *
 * Search jobs keeps the structured flow: free text seeds the profession into
 * the search modal, which confirms the city before the JOB_FINDER thread opens.
 * The other three are conversational — the typed question starts a thread with
 * that specialist (CV_BUILDER / CAREER_ASSISTANT / RELOCATION_GUIDE), which
 * replies in the user's own language.
 */
export function JobSearchLanding() {
  const t = useT();
  const router = useRouter();
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
    if (mode === "search" || mode === "cv") openSearch(text);
    else startChat(MODE_SPECIALIST[mode], text);
  };

  const pickMode = (next: LandingMode) => {
    // CV builder is a guided screen, not a chat — navigate straight to it.
    if (next === "cv") {
      router.push(routes.profileCv);
      return;
    }
    setMode(next);
    // Search is one-tap: choosing it opens the search form right away.
    if (next === "search") openSearch(null);
  };

  const placeholder = t(MODE_PLACEHOLDER[mode]);

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
