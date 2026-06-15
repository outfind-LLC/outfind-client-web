"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import type { UIMessage } from "ai";

import { Button } from "@/ui/button";

import { qk } from "@/config/query-keys";
import { chatService } from "@/features/chat/services/chat.service";
import { useChatThread } from "@/features/chat/hooks/use-chat-thread";
import { toUIMessages } from "@/features/chat/lib/map-messages";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { playEventSound } from "@/features/settings/lib/play-sound";
import { useSession } from "@/features/auth/hooks/use-session";
import type { AccountType } from "@/interfaces/enums";
import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";
import type { ChatSurface } from "./message-bubble";

/** Loads a conversation's history, then mounts the streaming runtime keyed by id
 * so switching conversations resets cleanly. */
export function ChatThread({
  conversationId,
  surface = "assistant",
}: {
  conversationId: string;
  surface?: ChatSurface;
}) {
  const { user } = useSession();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.messages(conversationId),
    queryFn: () => chatService.listMessages(conversationId, { limit: 100 }),
  });

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <TriangleAlert className="text-muted-foreground size-6" />
        <p className="text-muted-foreground max-w-xs text-sm">
          We couldn’t load this conversation. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ChatRuntime
      key={conversationId}
      conversationId={conversationId}
      accountType={user.accountType}
      initialMessages={toUIMessages(data ?? [])}
      surface={surface}
    />
  );
}

interface ChatRuntimeProps {
  conversationId: string;
  accountType: AccountType;
  initialMessages: UIMessage[];
  surface: ChatSurface;
}

function ChatRuntime({
  conversationId,
  accountType,
  initialMessages,
  surface,
}: ChatRuntimeProps) {
  const chat = useChatThread(conversationId, initialMessages);
  const takePending = useComposerStore((s) => s.takePending);
  const autoSent = useRef(false);

  // Auto-send the message handed over from the new-chat screen, exactly once.
  useEffect(() => {
    if (autoSent.current) return;
    autoSent.current = true;
    const pending = takePending(conversationId);
    if (pending) void chat.sendMessage({ text: pending });
  }, [conversationId, takePending, chat]);

  useEffect(() => {
    if (chat.error) toast.error("Something went wrong. Please try again.");
  }, [chat.error]);

  // Chime when a reply finishes streaming (respects the user's sound settings).
  const prevStatus = useRef(chat.status);
  useEffect(() => {
    const was = prevStatus.current;
    prevStatus.current = chat.status;
    if (
      (was === "streaming" || was === "submitted") &&
      chat.status === "ready"
    ) {
      playEventSound("chatComplete");
    }
  }, [chat.status]);

  const busy = chat.status === "submitted" || chat.status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageList
        messages={chat.messages}
        status={chat.status}
        surface={surface}
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:pb-6">
        <ChatComposer
          accountType={accountType}
          busy={busy}
          onSend={(text) => void chat.sendMessage({ text })}
          onStop={() => void chat.stop()}
          autoFocus
        />
      </div>
    </div>
  );
}
