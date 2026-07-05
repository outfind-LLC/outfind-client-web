"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import s from "@/features/visa/styles/flag.module.css";

/**
 * A circular country flag. Renders the real SVG asset at `public/flags/{ISO2}.svg`
 * (uppercased — backend `destination.code` is lowercase, `citizenship.code` is
 * uppercase) and falls back to the backend-supplied emoji when the file is
 * missing (e.g. Belgium) or fails to load. `size` is the pixel diameter.
 */
export function Flag({
  code,
  emoji,
  size = 34,
  className,
}: {
  code: string;
  emoji?: string;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  // A new code means a fresh attempt at its asset.
  useEffect(() => setErrored(false), [code]);

  const showEmoji = errored || !code;

  return (
    <span
      className={cn(s.flag, className)}
      style={{ width: size, height: size }}
    >
      {showEmoji ? (
        <span
          className={s.emoji}
          style={{ fontSize: Math.round(size * 0.62) }}
        >
          {emoji || "🌍"}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/flags/${code.toUpperCase()}.svg`}
          alt=""
          className={s.img}
          onError={() => setErrored(true)}
        />
      )}
    </span>
  );
}
