"use client";

import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useStartConversation } from "@/features/chat/hooks/use-conversations";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { useSession } from "@/features/auth/hooks/use-session";
import { isApiClientError } from "@/lib/api/error";
import type { AiSpecialist } from "@/interfaces/enums";
import { ChatComposer } from "./chat-composer";
import { ChatEmptyState } from "./chat-empty-state";
import { SpecialistChips } from "./specialist-chips";

interface NewChatScreenProps {
  /** Where the freshly-created conversation thread lives (per tab). */
  threadHref?: (id: string) => string;
  /** Specialist used when the composer hasn't picked one explicitly. */
  defaultSpecialist?: AiSpecialist;
}

/** The "New chat" screen. Sending the first message creates a conversation and
 * routes to its thread (which auto-sends the queued message). */
export function NewChatScreen({
  threadHref = routes.assistantThread,
  defaultSpecialist,
}: NewChatScreenProps = {}) {
  const { user } = useSession();
  const specialist = useComposerStore((s) => s.specialist);
  const startConversation = useStartConversation(threadHref);

  if (!user) return null;

  const send = (text: string) => {
    if (startConversation.isPending) return;
    startConversation.mutate(
      { message: text, specialist: specialist ?? defaultSpecialist },
      {
        onError: (error) =>
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Couldn't start the conversation",
          ),
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-4 sm:py-8">
        <ChatEmptyState
          userName={user.name}
          accountType={user.accountType}
          onPick={send}
        />
      </div>
      <div className="mx-auto w-full max-w-3xl space-y-3 px-4 pb-4 sm:pb-6">
        <ChatComposer
          accountType={user.accountType}
          busy={startConversation.isPending}
          onSend={send}
          autoFocus
        />
        <SpecialistChips
          accountType={user.accountType}
          disabled={startConversation.isPending}
        />
      </div>
    </div>
  );
}
