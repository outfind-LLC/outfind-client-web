"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export interface PopupPos {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

/**
 * A dropdown/popover anchored to a trigger, rendered in a portal on
 * `document.body` with `position: fixed`. This escapes any ancestor with
 * `overflow: auto/hidden` (e.g. a scrollable modal body) that would otherwise
 * clip the popup or hide it behind a sticky footer. Flips upward when there's no
 * room below and re-measures on scroll/resize.
 */
export function useAnchoredPopup() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<PopupPos | null>(null);

  const reposition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const spaceBelow = window.innerHeight - r.bottom - margin;
    const spaceAbove = r.top - margin;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const base = { left: r.left, width: r.width };
    setPos(
      openUp
        ? {
            ...base,
            bottom: window.innerHeight - r.top + gap,
            maxHeight: Math.max(160, spaceAbove),
          }
        : {
            ...base,
            top: r.bottom + gap,
            maxHeight: Math.max(160, spaceBelow),
          },
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const onChange = () => reposition();
    // capture:true so it also fires for scrolls inside a modal body.
    window.addEventListener("scroll", onChange, true);
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange, true);
      window.removeEventListener("resize", onChange);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, triggerRef, popupRef, pos };
}

/** Renders the popup shell in a portal with fixed positioning from {@link PopupPos}. */
export function AnchoredPopup({
  pos,
  popupRef,
  className,
  style,
  role = "listbox",
  children,
}: {
  pos: PopupPos | null;
  popupRef: RefObject<HTMLDivElement | null>;
  className?: string;
  style?: CSSProperties;
  role?: string;
  children: ReactNode;
}) {
  if (typeof document === "undefined" || !pos) return null;
  return createPortal(
    <div
      ref={popupRef}
      className={className}
      role={role}
      style={{
        position: "fixed",
        // Above every in-app modal (profile scrim 140, wizard overlay 1000).
        zIndex: 2000,
        left: pos.left,
        width: pos.width,
        top: pos.top,
        bottom: pos.bottom,
        maxHeight: pos.maxHeight,
        ...style,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
