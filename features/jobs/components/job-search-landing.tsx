"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { useResumes } from "@/features/resume/hooks/use-resumes";
import { useCvWizardStore } from "@/features/resume/store/cv-wizard.store";
import { useSession } from "@/features/auth/hooks/use-session";
import { handleFeatureLockedError } from "@/features/billing/lib/feature-locked";
import { useUpgradeProStore } from "@/features/billing/store/upgrade-pro.store";
import { ChatComposer } from "@/features/chat/components/chat-composer";
import { JobSearchModal } from "@/features/jobs/components/job-search-modal";
import { useStartConversation } from "@/features/chat/hooks/use-conversations";
import type { FeatureKey } from "@/interfaces/access.interface";
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
  // CV builder opens the guided "Create CV" wizard for first-timers, or the
  // resume list (/profile/cv) for workers who already have one.
  { key: "cv", icon: "fileText", labelKey: "chat.modeCv" },
  { key: "assist", icon: "brain", labelKey: "chat.modeAssist" },
  // "Search jobs" is the default composer mode, so it needs no chip.
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

/** Feature behind each mode — the upgrade modal's preselect when a value-
 * consuming action later 403s (entry points themselves are free). */
const MODE_FEATURE: Record<LandingMode, FeatureKey> = {
  cv: "ai_cv_builder",
  assist: "ai_assistant",
  search: "ai_job_search",
  visa: "visa_guidance",
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
  const resumesQuery = useResumes(Boolean(isWorker));
  const openCvWizard = useCvWizardStore((st) => st.openModal);
  const startConversation = useStartConversation(routes.jobsThread);
  const openUpgrade = useUpgradeProStore((st) => st.openModal);

  const [mode, setMode] = useState<LandingMode>("search");
  const [seedProfession, setSeedProfession] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Entry points are free — the backend's 403 FEATURE_LOCKED on value-consuming
  // actions is the enforcement (caught below and routed to the upgrade modal).
  const openSearch = (profession: string | null) => {
    setSeedProfession(profession);
    setModalOpen(true);
  };

  const startChat = (specialist: AiSpecialist, message: string) => {
    if (startConversation.isPending) return;
    startConversation.mutate(
      { message, specialist },
      {
        onError: (error) => {
          if (handleFeatureLockedError(error, openUpgrade, MODE_FEATURE[mode]))
            return;
          toast.error(
            isApiClientError(error) ? error.message : t("chat.startConvError"),
          );
        },
      },
    );
  };

  const send = (text: string) => {
    if (mode === "search" || mode === "cv") openSearch(text);
    else startChat(MODE_SPECIALIST[mode], text);
  };

  const pickMode = (next: LandingMode) => {
    // CV builder: returning workers with a CV go to their list; first-timers get
    // the guided "Create CV" wizard.
    if (next === "cv") {
      if ((resumesQuery.data?.length ?? 0) > 0) router.push(routes.profileCv);
      else openCvWizard();
      return;
    }
    // Visa documents opens the full-screen /visa experience (checklist if a
    // preference exists, otherwise the onboarding modal auto-opens there).
    if (next === "visa") {
      router.push(routes.visa);
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
