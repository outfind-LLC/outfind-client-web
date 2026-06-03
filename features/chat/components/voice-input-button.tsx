"use client";

import { Mic, Square } from "lucide-react";

import { useSpeechRecognition } from "@/features/chat/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/** Mic toggle that streams recognised speech back to the composer. Renders
 * nothing where the Web Speech API is unsupported. */
export function VoiceInputButton({
  onTranscript,
  disabled,
}: VoiceInputButtonProps) {
  const { supported, listening, start, stop } = useSpeechRecognition({
    onResult: onTranscript,
  });

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      aria-label={listening ? "Stop dictation" : "Start dictation"}
      aria-pressed={listening}
      onClick={listening ? stop : start}
      className={cn(listening && "text-destructive")}
    >
      {listening ? (
        <Square className="size-4 fill-current" />
      ) : (
        <Mic className="size-4" />
      )}
    </Button>
  );
}
