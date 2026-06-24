"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatStatus, UIMessage } from "ai";

import {
  MessageBubble,
  PendingAssistantBubble,
  type ChatSurface,
} from "./message-bubble";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
  surface?: ChatSurface;
}

/** How close to the bottom (px) still counts as "stuck" to the latest message. */
const STICK_THRESHOLD = 80;

/** Scrollable transcript (`.thread-scroll` → `.thread`). Sticks to the bottom
 * while the reader is already there, but never yanks them down once they scroll
 * up to read. */
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

  const streaming = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const awaitingFirstToken =
    status === "submitted" && (!lastMessage || lastMessage.role === "user");

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => handleScroll(event.currentTarget)}
      className={s["thread-scroll"]}
    >
      <div className={s.thread}>
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

        {awaitingFirstToken ? <PendingAssistantBubble /> : null}
      </div>
    </div>
  );
}
