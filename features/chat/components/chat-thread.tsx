"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UIMessage } from "ai";

import { qk } from "@/config/query-keys";
import { chatService } from "@/features/chat/services/chat.service";
import { useChatThread } from "@/features/chat/hooks/use-chat-thread";
import { toUIMessages } from "@/features/chat/lib/map-messages";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { useSession } from "@/features/auth/hooks/use-session";
import type { AccountType } from "@/interfaces/enums";
import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";

/** Loads a conversation's history, then mounts the streaming runtime keyed by id
 * so switching conversations resets cleanly. */
export function ChatThread({ conversationId }: { conversationId: string }) {
  const { user } = useSession();
  const { data, isLoading } = useQuery({
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

  return (
    <ChatRuntime
      key={conversationId}
      conversationId={conversationId}
      accountType={user.accountType}
      initialMessages={toUIMessages(data ?? [])}
    />
  );
}

interface ChatRuntimeProps {
  conversationId: string;
  accountType: AccountType;
  initialMessages: UIMessage[];
}

function ChatRuntime({
  conversationId,
  accountType,
  initialMessages,
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

  const busy = chat.status === "submitted" || chat.status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
        <MessageList messages={chat.messages} status={chat.status} />
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
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
