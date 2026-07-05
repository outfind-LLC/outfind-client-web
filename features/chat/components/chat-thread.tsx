"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import type { UIMessage } from "ai";

import { Button } from "@/ui/button";

import { qk } from "@/config/query-keys";
import {
  extractLockCode,
  handleFeatureLockedError,
} from "@/features/billing/lib/feature-locked";
import { useUpgradeProStore } from "@/features/billing/store/upgrade-pro.store";
import { chatService } from "@/features/chat/services/chat.service";
import { useChatThread } from "@/features/chat/hooks/use-chat-thread";
import { toUIMessages } from "@/features/chat/lib/map-messages";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { playEventSound } from "@/features/settings/lib/play-sound";
import { useSession } from "@/features/auth/hooks/use-session";
import { useT } from "@/providers/i18n-provider";
import {
  AI_SPECIALIST,
  type AccountType,
  type AiSpecialist,
} from "@/interfaces/enums";
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
      // The thread's specialist, read off its history (any message carries it).
      specialist={data?.find((m) => m.specialist)?.specialist ?? null}
    />
  );
}

interface ChatRuntimeProps {
  conversationId: string;
  accountType: AccountType;
  initialMessages: UIMessage[];
  surface: ChatSurface;
  specialist: AiSpecialist | null;
}

function ChatRuntime({
  conversationId,
  accountType,
  initialMessages,
  surface,
  specialist,
}: ChatRuntimeProps) {
  const t = useT();
  const chat = useChatThread(conversationId, initialMessages);
  const takePending = useComposerStore((s) => s.takePending);
  const openUpgrade = useUpgradeProStore((s) => s.openModal);
  const autoSent = useRef(false);

  // Auto-send the message handed over from the new-chat screen, exactly once.
  useEffect(() => {
    if (autoSent.current) return;
    autoSent.current = true;
    const pending = takePending(conversationId);
    if (pending) void chat.sendMessage({ text: pending });
  }, [conversationId, takePending, chat]);

  useEffect(() => {
    if (!chat.error) return;
    // 403 FEATURE_LOCKED / LIMIT_REACHED on send → toast + the upgrade modal
    // (the AI-SDK transport error carries the raw response body text).
    const lockCode = extractLockCode(chat.error);
    if (lockCode) {
      handleFeatureLockedError(
        chat.error,
        openUpgrade,
        surface === "jobs" ? "ai_job_search" : "ai_assistant",
      );
      toast(
        t(lockCode === "LIMIT_REACHED" ? "pro.limitToast" : "pro.lockedToast"),
      );
      return;
    }
    toast.error("Something went wrong. Please try again.");
  }, [chat.error, openUpgrade, surface, t]);

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

  // Localized composer hint, matched to what this thread actually is.
  const placeholder =
    specialist === AI_SPECIALIST.JOB_FINDER ||
    (!specialist && surface === "jobs")
      ? t("chat.jobsThreadPlaceholder")
      : specialist === AI_SPECIALIST.RELOCATION_GUIDE
        ? t("chat.visaPlaceholder")
        : specialist === AI_SPECIALIST.CV_BUILDER
          ? t("chat.cvPlaceholder")
          : t("chat.assistPlaceholder");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageList
        messages={chat.messages}
        status={chat.status}
        surface={surface}
      />
      <ChatComposer
        accountType={accountType}
        busy={busy}
        onSend={(text) => void chat.sendMessage({ text })}
        onStop={() => void chat.stop()}
        autoFocus
        placeholder={placeholder}
      />
    </div>
  );
}
