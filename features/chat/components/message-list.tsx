"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import type { ChatStatus, UIMessage } from "ai";

import { Button } from "@/ui/button";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
}

/** How close to the bottom (px) still counts as "stuck" to the latest message. */
const STICK_THRESHOLD = 80;

/** Scrollable transcript. Sticks to the bottom while the user is already there,
 * but never yanks them down once they scroll up to read. */
export function MessageList({ messages, status }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const handleScroll = (el: HTMLDivElement) => {
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < STICK_THRESHOLD);
  };

  // Follow new content only when the reader is already at the bottom.
  useEffect(() => {
    if (!atBottom) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, atBottom]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const streaming = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const awaitingFirstToken =
    status === "submitted" && (!lastMessage || lastMessage.role === "user");

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={(event) => handleScroll(event.currentTarget)}
        className="h-full scrollbar-thin overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-4 sm:py-6">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              streaming={
                streaming &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}

          {awaitingFirstToken ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Thinking…
            </div>
          ) : null}
        </div>
      </div>

      {!atBottom ? (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={scrollToBottom}
          aria-label="Scroll to latest"
          className="absolute bottom-4 left-1/2 size-9 -translate-x-1/2 rounded-full shadow-md"
        >
          <ArrowDown className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
