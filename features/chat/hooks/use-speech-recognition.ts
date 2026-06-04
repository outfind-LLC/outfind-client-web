"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal typings for the Web Speech API (not in the DOM lib). Only the surface
 * we use is declared — enough to stay fully typed without `any`.
 */
interface SpeechAlternative {
  transcript: string;
}
interface SpeechResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechAlternative;
}
interface SpeechResultList {
  readonly length: number;
  [index: number]: SpeechResult;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechResultList;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface UseSpeechRecognitionOptions {
  /** The full live transcript for the current dictation session (interim
   * included), emitted on every update so the caller can mirror it live. */
  onTranscript: (transcript: string) => void;
  /** Called with the Web Speech error code (e.g. "not-allowed", "no-speech"). */
  onError?: (code: string) => void;
  /** BCP-47 language tag; defaults to the browser's language. */
  lang?: string;
}

function defaultLang(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return "en-US";
}

/**
 * Speech-to-text via the browser's Web Speech API. Listens continuously and
 * streams the whole session transcript (interim + final) so the composer can
 * type it out live. `supported` is false where the API is unavailable so the UI
 * can hide the mic. Auto-stops on unmount.
 */
export function useSpeechRecognition({
  onTranscript,
  onError,
  lang,
}: UseSpeechRecognitionOptions) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  // Keep the latest callbacks without rebuilding the recognition instance.
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onError]);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    // Feature detection must run after mount to avoid a hydration mismatch on
    // the mic button's visibility.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);
    const recognition = new Ctor();
    recognition.lang = defaultLang(lang);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const parts: string[] = [];
      for (let i = 0; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript.trim();
        if (chunk) parts.push(chunk);
      }
      onTranscriptRef.current(parts.join(" "));
    };
    recognition.onerror = (event) => {
      setListening(false);
      onErrorRef.current?.(event.error);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || listening) return;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
