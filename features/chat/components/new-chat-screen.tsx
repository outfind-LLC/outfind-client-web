"use client";

import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useStartConversation } from "@/features/chat/hooks/use-conversations";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { useSession } from "@/features/auth/hooks/use-session";
import { ChatMark } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";
import { isApiClientError } from "@/lib/api/error";
import { ACCOUNT_TYPE, type AiSpecialist } from "@/interfaces/enums";
import { ChatComposer } from "./chat-composer";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

const EMPLOYER_CHIP_KEYS: MessageKey[] = [
  "chat.chipTruckDrivers",
  "chat.chipWarehouseStaff",
  "chat.chipDeliveryCouriers",
  "chat.chipCleaners",
];
const ASSISTANT_CHIP_KEYS: MessageKey[] = [
  "chat.chipBuildCv",
  "chat.chipImproveResume",
  "chat.chipInterviewPrep",
  "chat.chipCareerAdvice",
];

interface NewChatScreenProps {
  /**
   * Which primary tab this screen belongs to — selects where a freshly created
   * conversation thread lands (`/assistant/<id>` vs `/jobs/<id>`). Passed as a
   * serializable string (not a route function) so the screen can be rendered
   * from a Server Component — functions can't cross the server→client boundary.
   */
  tab?: "assistant" | "jobs";
  /** Specialist used when the composer hasn't picked one explicitly. */
  defaultSpecialist?: AiSpecialist;
}

/** The "New chat" / "New search" hero. Employers describe who they need;
 * everyone else gets the assistant hero. Sending the first message creates a
 * conversation and routes to its thread (which auto-sends the queued message). */
export function NewChatScreen({
  tab = "assistant",
  defaultSpecialist,
}: NewChatScreenProps = {}) {
  const t = useT();
  const { user } = useSession();
  const specialist = useComposerStore((st) => st.specialist);
  const threadHref =
    tab === "jobs" ? routes.jobsThread : routes.assistantThread;
  const startConversation = useStartConversation(threadHref);

  if (!user) return null;

  const employer = user.accountType === ACCOUNT_TYPE.EMPLOYER;
  const title = employer ? t("chat.employerTitle") : t("chat.assistantTitle");
  const placeholder = employer
    ? t("chat.employerPlaceholder")
    : t("chat.assistantPlaceholder");
  const chipKeys = employer ? EMPLOYER_CHIP_KEYS : ASSISTANT_CHIP_KEYS;

  const send = (text: string) => {
    if (startConversation.isPending) return;
    startConversation.mutate(
      { message: text, specialist: specialist ?? defaultSpecialist },
      {
        onError: (error) =>
          toast.error(
            isApiClientError(error) ? error.message : t("chat.startConvError"),
          ),
      },
    );
  };

  return (
    <div className={s.landing}>
      <div className={s.hero}>
        <div className={s["hero-head"]}>
          <ChatMark className={s["hero-mark"]} />
          <h1 className={s["hero-title"]}>{title}</h1>
        </div>
      </div>

      <ChatComposer
        accountType={user.accountType}
        busy={startConversation.isPending}
        onSend={send}
        autoFocus
        placeholder={placeholder}
        showFoot={false}
      />

      <div className={s["hero-chips"]}>
        {chipKeys.map((key) => {
          const label = t(key);
          return (
            <button key={key} type="button" onClick={() => send(label)}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
