"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { ChatStatus } from "ai";
import type { UIMessage } from "ai";

import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
}

/** Scrollable transcript. Sticks to the bottom as new content streams in, and
 * shows a thinking indicator before the first assistant token arrives. */
export function MessageList({ messages, status }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const lastMessage = messages[messages.length - 1];
  const awaitingFirstToken =
    status === "submitted" && (!lastMessage || lastMessage.role === "user");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {awaitingFirstToken ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Thinking…
        </div>
      ) : null}

      <div ref={bottomRef} />
    </div>
  );
}
