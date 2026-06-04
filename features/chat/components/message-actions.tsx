"use client";

import { useState } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { useSetReaction } from "@/features/chat/hooks/use-message-reaction";
import { cn } from "@/lib/utils";
import { REACTION_TYPE, type ReactionType } from "@/interfaces/enums";

interface MessageActionsProps {
  messageId: string;
  /** Plain-text answer to place on the clipboard. */
  text: string;
  initialReaction: ReactionType | null;
}

/** Copy / like / dislike row shown under a completed assistant response. */
export function MessageActions({
  messageId,
  text,
  initialReaction,
}: MessageActionsProps) {
  const [reaction, setReaction] = useState<ReactionType | null>(
    initialReaction,
  );
  const [copied, setCopied] = useState(false);
  const setReactionMutation = useSetReaction();

  const react = (next: ReactionType) => {
    const value = reaction === next ? null : next;
    const previous = reaction;
    setReaction(value); // optimistic
    setReactionMutation.mutate(
      { messageId, reaction: value },
      {
        onError: () => {
          setReaction(previous);
          toast.error("Couldn't save your feedback");
        },
      },
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <div
      data-reacted={reaction !== null}
      className="text-muted-foreground -ml-1.5 flex items-center gap-0.5 opacity-70 transition-opacity group-hover/msg:opacity-100 focus-within:opacity-100 data-[reacted=true]:opacity-100"
    >
      <ActionButton
        label={copied ? "Copied" : "Copy"}
        onClick={copy}
        active={copied}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </ActionButton>
      <ActionButton
        label="Good response"
        onClick={() => react(REACTION_TYPE.LIKE)}
        active={reaction === REACTION_TYPE.LIKE}
      >
        <ThumbsUp
          className={cn(
            "size-4",
            reaction === REACTION_TYPE.LIKE && "fill-current",
          )}
        />
      </ActionButton>
      <ActionButton
        label="Bad response"
        onClick={() => react(REACTION_TYPE.DISLIKE)}
        active={reaction === REACTION_TYPE.DISLIKE}
      >
        <ThumbsDown
          className={cn(
            "size-4",
            reaction === REACTION_TYPE.DISLIKE && "fill-current",
          )}
        />
      </ActionButton>
    </div>
  );
}

function ActionButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors",
        active && "text-foreground",
      )}
    >
      {children}
    </button>
  );
}
