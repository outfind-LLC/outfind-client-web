"use client";

import { env } from "@/lib/env";
import { ANALYTICS_EVENTS, type AnalyticsEventName } from "./events";

/**
 * Lightweight client analytics: buffer named product-funnel events and flush
 * them batched to `POST /events/track`. Fire-and-forget — a failed send is never
 * surfaced. Honors Do-Not-Track. Uses `fetch` with `keepalive` so a flush on
 * page-unload still completes (and, unlike `sendBeacon`, handles the cross-origin
 * credentialed JSON request the same way as the rest of the API layer).
 */
interface QueuedEvent {
  name: AnalyticsEventName;
  properties?: Record<string, unknown>;
}

const ENDPOINT = `${env.NEXT_PUBLIC_API_URL}/events/track`;
const ALLOWED = new Set<string>(Object.values(ANALYTICS_EVENTS));
const FLUSH_INTERVAL_MS = 5_000;
const FLUSH_THRESHOLD = 20;
const SESSION_KEY = "peoplor_anon_id";

let buffer: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

/** Respect the browser's Do-Not-Track signal. */
function doNotTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  const dnt =
    navigator.doNotTrack ??
    (window as unknown as { doNotTrack?: string }).doNotTrack;
  return dnt === "1" || dnt === "yes";
}

/** A stable anonymous id (persisted) that stitches the funnel across sign-in. */
function sessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function send(events: QueuedEvent[]): void {
  if (events.length === 0) return;
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: sessionId(), events }),
    credentials: "include",
    keepalive: true,
  }).catch(() => {
    /* analytics is best-effort — swallow */
  });
}

/** Flush the buffer immediately (also called on page hide/unload). */
export function flushAnalytics(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (buffer.length === 0) return;
  send(buffer.splice(0, buffer.length));
}

/** Queue a client event. No-op under SSR or Do-Not-Track, or for a name the
 * server would reject. Flushes on a 5s timer or when 20 events accumulate. */
export function track(
  name: AnalyticsEventName,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || doNotTrack()) return;
  if (!ALLOWED.has(name)) return;
  buffer.push(properties ? { name, properties } : { name });
  if (buffer.length >= FLUSH_THRESHOLD) {
    flushAnalytics();
    return;
  }
  if (!timer) timer = setTimeout(flushAnalytics, FLUSH_INTERVAL_MS);
}
