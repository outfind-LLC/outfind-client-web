"use client";

import { useEffect, useRef } from "react";

import { Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/** AudioContext, including the Safari-prefixed constructor, without `any`. */
type AudioContextCtor = typeof AudioContext;
function getAudioContextCtor(): AudioContextCtor | null {
  const w = window as typeof window & { webkitAudioContext?: AudioContextCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * The inline voice recording bar (the prototype's `voice.js`): the composer
 * becomes a live, scrolling waveform with `+`, cancel (×), and confirm (✓). The
 * waveform is driven by the real microphone via a Web Audio `AnalyserNode`, with
 * a simulated voice envelope as a fallback when mic access is unavailable.
 * Transcription itself is handled by the parent (Web Speech API); this component
 * is purely the visualiser + the cancel/confirm controls.
 */
export function VoiceRecorder({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useT();
  const waveRef = useRef<HTMLDivElement>(null);

  // All audio + DOM bar mutation lives in this effect (not render), so it stays
  // React-Compiler-safe; everything is torn down on unmount.
  useEffect(() => {
    const waveEl = waveRef.current;
    if (!waveEl) return;

    let stopped = false;
    let timer: number | undefined;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let micStream: MediaStream | null = null;
    let buf: Uint8Array<ArrayBuffer> | null = null;
    let useMic = false;
    let simPhase = 0;

    // Build the bars to fit the available width.
    const width = waveEl.clientWidth || 320;
    const count = Math.max(24, Math.min(120, Math.floor(width / 5)));
    const bars: HTMLElement[] = [];
    const heights: number[] = [];
    waveEl.replaceChildren();
    for (let i = 0; i < count; i += 1) {
      const bar = document.createElement("i");
      waveEl.appendChild(bar);
      bars.push(bar);
      heights.push(0.12 + Math.random() * 0.16);
    }
    const paint = () => {
      for (let i = 0; i < bars.length; i += 1) {
        bars[i].style.transform = `scaleY(${heights[i].toFixed(3)})`;
      }
    };
    paint();

    const micLevel = () => {
      if (!analyser || !buf) return 0.1;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      return 0.08 + Math.min(1, rms * 5.2) * 0.92;
    };
    const simLevel = () => {
      simPhase += 0.35;
      const env = (Math.sin(simPhase * 0.7) + 1) / 2;
      return 0.1 + Math.min(1, env * 0.7 + Math.random() * 0.5) * 0.9;
    };
    const pushSample = () => {
      heights.shift();
      heights.push(useMic ? micLevel() : simLevel());
      paint();
    };
    timer = window.setInterval(pushSample, 90);

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (stopped) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          const AC = getAudioContextCtor();
          if (!AC) return;
          micStream = stream;
          audioCtx = new AC();
          if (audioCtx.state === "suspended") void audioCtx.resume().catch(() => {});
          const src = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 1024;
          analyser.smoothingTimeConstant = 0.55;
          buf = new Uint8Array(analyser.fftSize);
          src.connect(analyser);
          useMic = true;
          window.clearInterval(timer);
          timer = window.setInterval(pushSample, 55); // tighter cadence with real audio
        })
        .catch(() => {
          /* denied / unavailable — keep the simulated graph */
        });
    }

    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
      if (micStream) micStream.getTracks().forEach((track) => track.stop());
      if (audioCtx) void audioCtx.close().catch(() => {});
    };
  }, []);

  return (
    <div className={s["rec-bar"]}>
      <button
        type="button"
        className={cn(s["rec-btn"], s["rec-add"])}
        aria-label={t("chat.recAdd")}
      >
        <Ic name="plus" />
      </button>
      <div className={s["rec-wave"]} ref={waveRef} />
      <button
        type="button"
        className={cn(s["rec-btn"], s["rec-cancel"])}
        onClick={onCancel}
        aria-label={t("chat.recCancel")}
      >
        <Ic name="close" />
      </button>
      <button
        type="button"
        className={cn(s["rec-btn"], s["rec-confirm"])}
        onClick={onConfirm}
        aria-label={t("chat.recConfirm")}
      >
        <Ic name="checkBold" />
      </button>
    </div>
  );
}
