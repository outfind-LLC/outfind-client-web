"use client";

import { toast } from "sonner";

import { useStartConversation } from "@/features/chat/hooks/use-conversations";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { useSession } from "@/features/auth/hooks/use-session";
import { isApiClientError } from "@/lib/api/error";
import { ChatComposer } from "./chat-composer";
import { ChatEmptyState } from "./chat-empty-state";

/** The "New chat" screen. Sending the first message creates a conversation and
 * routes to its thread (which auto-sends the queued message). */
export function NewChatScreen() {
  const { user } = useSession();
  const specialist = useComposerStore((s) => s.specialist);
  const startConversation = useStartConversation();

  if (!user) return null;

  const send = (text: string) => {
    if (startConversation.isPending) return;
    startConversation.mutate(
      { message: text, specialist: specialist ?? undefined },
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
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8">
        <ChatEmptyState
          userName={user.name}
          accountType={user.accountType}
          onPick={send}
        />
      </div>
      <div className="mx-auto w-full max-w-4xl px-4 pb-4">
        <ChatComposer
          accountType={user.accountType}
          busy={startConversation.isPending}
          onSend={send}
          autoFocus
        />
      </div>
    </div>
  );
}
