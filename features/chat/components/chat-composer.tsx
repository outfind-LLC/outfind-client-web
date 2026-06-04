"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { toast } from "sonner";

import { getDefaultSpecialist } from "@/features/chat/constants/specialists";
import { useSpeechRecognition } from "@/features/chat/hooks/use-speech-recognition";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/interfaces/enums";
import { Button } from "@/ui/button";
import { ModelSelector } from "./model-selector";
import { SpecialistSelector } from "./specialist-selector";
import { VoiceInputButton } from "./voice-input-button";

interface ChatComposerProps {
  accountType: AccountType;
  /** True while a reply is streaming — swaps send for stop and locks the input. */
  busy: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
  autoFocus?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 200;

/** Friendly message for a Web Speech API error code. */
function dictationError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone blocked. Allow mic access in your browser settings.";
    case "no-speech":
      return "Didn't catch that — try speaking again.";
    case "audio-capture":
      return "No microphone found.";
    case "network":
      return "Voice service is unavailable right now.";
    default:
      return "Couldn't start voice input.";
  }
}

/** Message composer: auto-growing input plus specialist/model/voice controls. */
export function ChatComposer({
  accountType,
  busy,
  onSend,
  onStop,
  autoFocus,
}: ChatComposerProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Text already in the field when dictation starts; new speech is appended to it.
  const dictationBaseRef = useRef("");

  const storeSpecialist = useComposerStore((s) => s.specialist);
  const setSpecialist = useComposerStore((s) => s.setSpecialist);
  const model = useComposerStore((s) => s.model);
  const setModel = useComposerStore((s) => s.setModel);

  const specialist = storeSpecialist ?? getDefaultSpecialist(accountType);

  const speech = useSpeechRecognition({
    onTranscript: (transcript) =>
      setInput(`${dictationBaseRef.current}${transcript}`),
    onError: (code) => toast.error(dictationError(code)),
  });

  // Seed the store's specialist once for this audience if unset.
  useEffect(() => {
    if (!storeSpecialist) setSpecialist(getDefaultSpecialist(accountType));
  }, [storeSpecialist, accountType, setSpecialist]);

  // Auto-grow the textarea to fit content, capped.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [input]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    if (speech.listening) speech.stop();
    onSend(text);
    setInput("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const toggleDictation = () => {
    if (speech.listening) {
      speech.stop();
      return;
    }
    // Continue from the current text, with a separating space if needed.
    dictationBaseRef.current = input.trim()
      ? `${input.replace(/\s+$/, "")} `
      : "";
    speech.start();
  };

  return (
    <div className="border-border/50 bg-card/70 focus-within:border-primary/40 focus-within:ring-primary/30 dark:bg-card/55 rounded-[1.75rem] border shadow-[0_8px_30px_-12px_rgba(2,6,23,0.25)] ring-1 ring-white/15 backdrop-blur-xl transition-all ring-inset focus-within:shadow-[0_10px_40px_-12px_rgba(74,73,207,0.35)] dark:ring-white/[0.06]">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        rows={1}
        placeholder={speech.listening ? "Listening…" : "Message Jobsterr…"}
        className="placeholder:text-muted-foreground max-h-52 min-h-[3rem] w-full resize-none scrollbar-thin bg-transparent px-5 pt-4 text-[0.95rem] leading-relaxed outline-none"
      />

      <div className="flex items-center gap-2 px-3 pb-3">
        <SpecialistSelector
          accountType={accountType}
          value={specialist}
          onChange={setSpecialist}
          disabled={busy}
        />

        <div className="ml-auto flex items-center gap-1.5">
          <ModelSelector value={model} onChange={setModel} disabled={busy} />
          {speech.supported ? (
            <VoiceInputButton
              listening={speech.listening}
              disabled={busy}
              onClick={toggleDictation}
            />
          ) : null}
          {busy ? (
            <Button
              type="button"
              size="icon"
              aria-label="Stop"
              onClick={onStop}
              className={cn("rounded-full")}
            >
              <Square className="size-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              aria-label="Send"
              disabled={!input.trim()}
              onClick={submit}
              className="rounded-full"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
