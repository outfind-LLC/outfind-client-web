"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { useChatPanelStore } from "@/features/applications/store/chat-panel.store";
import { ConversationThread } from "@/features/applications/components/conversation-thread";

/**
 * App-wide chat panel, mounted once in `AppShell`. A non-blocking docked drawer
 * on desktop/tablet (the page behind stays scrollable and interactive, so an
 * employer can keep browsing applicants while messaging) and a full-screen sheet
 * on mobile. State lives in `useChatPanelStore`, so it persists across
 * navigation. Not a Radix Dialog by design — a modal would trap focus and block
 * the page, defeating the "keep browsing" requirement.
 */
export function ChatPanel() {
  const thread = useChatPanelStore((s) => s.thread);
  const close = useChatPanelStore((s) => s.close);

  // Escape closes the panel.
  useEffect(() => {
    if (!thread) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [thread, close]);

  // Lock body scroll only while the full-screen mobile sheet is open; desktop
  // leaves the page scrollable so the user can keep browsing.
  useEffect(() => {
    if (!thread) return;
    const mobile = window.matchMedia("(max-width: 639px)");
    if (!mobile.matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [thread]);

  if (!thread) return null;

  return (
    <aside
      role="dialog"
      aria-label={`Conversation with ${thread.title}`}
      className="bg-card animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l shadow-xl duration-200 sm:z-40 sm:max-w-[400px]"
    >
      <header className="flex items-start gap-3 border-b p-4">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-base font-semibold">{thread.title}</p>
          <p className="text-muted-foreground truncate text-xs">
            {thread.subtitle ?? "Conversation about this application"}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close conversation"
          className="text-muted-foreground hover:text-foreground hover:bg-muted -mr-1 shrink-0 rounded-md p-1.5 transition-colors"
        >
          <X className="size-4" />
        </button>
      </header>

      <ConversationThread
        key={thread.applicationId}
        scope={thread.scope}
        applicationId={thread.applicationId}
        coverLetter={thread.coverLetter}
      />
    </aside>
  );
}
