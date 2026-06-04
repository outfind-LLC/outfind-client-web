"use client";

import { Mic, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

interface VoiceInputButtonProps {
  listening: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** Presentational mic toggle. Recognition is owned by the composer so dictated
 * text can be merged into the input field. */
export function VoiceInputButton({
  listening,
  disabled,
  onClick,
}: VoiceInputButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      aria-label={listening ? "Stop dictation" : "Start voice input"}
      aria-pressed={listening}
      onClick={onClick}
      className={cn(listening && "text-destructive animate-pulse")}
    >
      {listening ? (
        <Square className="size-4 fill-current" />
      ) : (
        <Mic className="size-4" />
      )}
    </Button>
  );
}
