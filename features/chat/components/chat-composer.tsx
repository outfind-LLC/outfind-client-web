"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";

import { getDefaultSpecialist } from "@/features/chat/constants/specialists";
import { useSpeechRecognition } from "@/features/chat/hooks/use-speech-recognition";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { Ic } from "@/features/dashboard/components/app-icons";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/interfaces/enums";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

interface ChatComposerProps {
  accountType: AccountType;
  /** True while a reply is streaming — swaps send for stop and locks the input. */
  busy: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

const MAX_TEXTAREA_HEIGHT = 160;

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

/** Message composer (the prototype's rounded pill): auto-growing input, voice
 * dictation, and a send button that becomes a stop control while streaming. */
export function ChatComposer({
  accountType,
  busy,
  onSend,
  onStop,
  autoFocus,
  placeholder = "Search jobs…",
}: ChatComposerProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Text already in the field when dictation starts; new speech is appended to it.
  const dictationBaseRef = useRef("");

  const storeSpecialist = useComposerStore((st) => st.specialist);
  const setSpecialist = useComposerStore((st) => st.setSpecialist);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
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
    <div className={s["composer-wrap"]}>
      <form className={s.composer} autoComplete="off" onSubmit={onSubmit}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          rows={1}
          placeholder={speech.listening ? "Listening…" : placeholder}
          aria-label={placeholder}
        />

        {speech.supported ? (
          <button
            type="button"
            className={cn(s.mic, speech.listening && s.listening)}
            aria-label="Use voice"
            aria-pressed={speech.listening}
            onClick={toggleDictation}
          >
            <Ic name="mic" />
          </button>
        ) : null}

        {busy ? (
          <button
            type="button"
            className={s.send}
            aria-label="Stop"
            onClick={onStop}
          >
            <Ic name="stop" />
          </button>
        ) : (
          <button
            type="submit"
            className={s.send}
            aria-label="Send"
            disabled={!input.trim()}
          >
            <Ic name="arrowUp" />
          </button>
        )}
      </form>

      <div className={s["composer-foot"]}>
        Peoplor helps you find jobs and apply. It can make mistakes — always check
        job details before applying.
      </div>
    </div>
  );
}
