"use client";

import { useState } from "react";
import { Brain, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface ReasoningBlockProps {
  text: string;
  /** True while tokens are still streaming in — auto-expanded for live thinking. */
  streaming?: boolean;
}

/** Collapsible "thinking" disclosure for assistant reasoning parts. */
export function ReasoningBlock({ text, streaming }: ReasoningBlockProps) {
  const [open, setOpen] = useState(false);
  const expanded = open || streaming;

  return (
    <div className="border-border/60 bg-muted/30 rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-muted-foreground flex w-full items-center gap-2 px-3 py-2 text-xs font-medium"
      >
        <Brain className="size-3.5" />
        {streaming ? "Thinking…" : "Reasoning"}
        <ChevronDown
          className={cn(
            "ml-auto size-3.5 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded ? (
        <p className="text-muted-foreground px-3 pb-3 text-xs leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      ) : null}
    </div>
  );
}
