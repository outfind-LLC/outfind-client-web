"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useSetReaction } from "@/features/chat/hooks/use-message-reaction";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import { REACTION_TYPE, type ReactionType } from "@/interfaces/enums";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

interface MessageActionsProps {
  messageId: string;
  /** Plain-text answer placed on the clipboard (copy hidden when empty). */
  text: string;
  initialReaction: ReactionType | null;
}

/** Copy / like / dislike row shown under a completed assistant response. */
export function MessageActions({
  messageId,
  text,
  initialReaction,
}: MessageActionsProps) {
  const t = useT();
  const [reaction, setReaction] = useState<ReactionType | null>(
    initialReaction,
  );
  const [copied, setCopied] = useState(false);
  const setReactionMutation = useSetReaction();

  const react = (next: ReactionType) => {
    const value = reaction === next ? null : next;
    const previous = reaction;
    setReaction(value); // optimistic — rolled back if the write fails
    setReactionMutation.mutate(
      { messageId, reaction: value },
      {
        onError: () => {
          setReaction(previous);
          toast.error(t("chat.feedbackError"));
        },
      },
    );
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("chat.copyError"));
    }
  };

  const copyLabel = copied ? t("chat.copiedAction") : t("chat.copyAction");
  const likeLabel = t("chat.goodResponse");
  const dislikeLabel = t("chat.badResponse");

  return (
    <div className={s["msg-actions"]}>
      {text ? (
        <button
          type="button"
          title={copyLabel}
          aria-label={copyLabel}
          aria-pressed={copied}
          onClick={() => void copyText()}
        >
          <Ic name={copied ? "checkBold" : "copy"} />
        </button>
      ) : null}
      <button
        type="button"
        title={likeLabel}
        aria-label={likeLabel}
        aria-pressed={reaction === REACTION_TYPE.LIKE}
        onClick={() => react(REACTION_TYPE.LIKE)}
      >
        <Ic name="thumbUp" />
      </button>
      <button
        type="button"
        title={dislikeLabel}
        aria-label={dislikeLabel}
        aria-pressed={reaction === REACTION_TYPE.DISLIKE}
        onClick={() => react(REACTION_TYPE.DISLIKE)}
      >
        <Ic name="thumbDown" />
      </button>
    </div>
  );
}
