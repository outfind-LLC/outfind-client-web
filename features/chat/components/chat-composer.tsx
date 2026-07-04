"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";

import {
  getDefaultSpecialist,
  getSpecialists,
} from "@/features/chat/constants/specialists";
import { useSpeechRecognition } from "@/features/chat/hooks/use-speech-recognition";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { VoiceRecorder } from "@/features/chat/components/voice-recorder";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useT, type TranslateFn } from "@/providers/i18n-provider";
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
  /** Hide the disclaimer line (e.g. on the centered new-chat hero). */
  showFoot?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 200;
/** Hard cap on one message — mirrors the backend's CHAT_LIMITS.MAX_MESSAGE_LENGTH
 * (MVP value; raise both together when longer turns are wanted). */
const MAX_MESSAGE_LENGTH = 1200;
/** The counter turns amber once the message is this far into the cap. */
const COUNTER_WARN_AT = Math.floor(MAX_MESSAGE_LENGTH * 0.9);

/** Friendly message for a Web Speech API error code. */
function dictationError(code: string, t: TranslateFn): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return t("chat.micBlocked");
    case "no-speech":
      return t("chat.micNoSpeech");
    case "audio-capture":
      return t("chat.micNoDevice");
    case "network":
      return t("chat.micNetwork");
    default:
      return t("chat.micGeneric");
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
  placeholder,
  showFoot = true,
}: ChatComposerProps) {
  const t = useT();
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Text already in the field when dictation starts; new speech is appended to it.
  const dictationBaseRef = useRef("");
  const resolvedPlaceholder = placeholder ?? t("chat.composerPlaceholder");

  const storeSpecialist = useComposerStore((st) => st.specialist);
  const setSpecialist = useComposerStore((st) => st.setSpecialist);

  const speech = useSpeechRecognition({
    onTranscript: (transcript) =>
      setInput(
        `${dictationBaseRef.current}${transcript}`.slice(0, MAX_MESSAGE_LENGTH),
      ),
    onError: (code) => toast.error(dictationError(code, t)),
  });

  // Seed the store's specialist for this audience — and RESEED whenever the
  // stored one belongs to the other side (stale after a worker↔employer account
  // switch in the same session), so a new conversation can never be created
  // with a cross-audience specialist (backend rejects those with 403).
  useEffect(() => {
    const valid = getSpecialists(accountType).some(
      (option) => option.value === storeSpecialist,
    );
    if (!valid) setSpecialist(getDefaultSpecialist(accountType));
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

  // Tapping the mic flips the composer into the waveform recorder. Speech is
  // transcribed into the input live (hidden behind the waveform); confirm keeps
  // it, cancel restores the text from before recording.
  const startRecording = () => {
    if (recording || busy) return;
    dictationBaseRef.current = input.trim()
      ? `${input.replace(/\s+$/, "")} `
      : "";
    // The waveform always runs (Web Audio); transcription only when supported.
    if (speech.supported) speech.start();
    setRecording(true);
  };
  const stopRecording = (keep: boolean) => {
    speech.stop();
    if (!keep) setInput(dictationBaseRef.current.replace(/\s+$/, ""));
    setRecording(false);
  };

  // Esc cancels an active recording.
  useEffect(() => {
    if (!recording) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") stopRecording(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // stopRecording closes over stable setters/refs; re-bind only on toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  return (
    <div className={s["composer-wrap"]}>
      <form
        className={cn(s.composer, recording && s["is-recording"])}
        autoComplete="off"
        onSubmit={onSubmit}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) =>
            setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))
          }
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={resolvedPlaceholder}
          aria-label={resolvedPlaceholder}
        />

        <button
          type="button"
          className={s.mic}
          aria-label={t("chat.ariaUseVoice")}
          onClick={startRecording}
        >
          <Ic name="mic" />
        </button>

        {busy ? (
          <button
            type="button"
            className={s.send}
            aria-label={t("chat.ariaStop")}
            onClick={onStop}
          >
            <Ic name="stop" />
          </button>
        ) : (
          <button
            type="submit"
            className={s.send}
            aria-label={t("chat.ariaSend")}
            disabled={!input.trim()}
          >
            <Ic name="arrowUp" />
          </button>
        )}

        {recording ? (
          <VoiceRecorder
            onCancel={() => stopRecording(false)}
            onConfirm={() => stopRecording(true)}
          />
        ) : null}

        {!recording && input.length > 0 ? (
          // Badge on the pill's top-right: live countdown of characters LEFT.
          <div
            className={cn(
              s["composer-count"],
              input.length >= COUNTER_WARN_AT && s.warn,
              input.length >= MAX_MESSAGE_LENGTH && s.limit,
            )}
            aria-live="polite"
          >
            {(MAX_MESSAGE_LENGTH - input.length).toLocaleString()} /{" "}
            {MAX_MESSAGE_LENGTH.toLocaleString()}
          </div>
        ) : null}
      </form>

      {showFoot ? (
        <div className={s["composer-foot"]}>{t("chat.composerFoot")}</div>
      ) : null}
    </div>
  );
}
