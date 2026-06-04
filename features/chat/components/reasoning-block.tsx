"use client";

import { useState } from "react";
import { Brain, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface ReasoningBlockProps {
  text: string;
  /** True while tokens are still streaming in — auto-expanded for live thinking. */
  streaming?: boolean;
}

/** Collapsible "thinking" disclosure, visually distinct from the answer. */
export function ReasoningBlock({ text, streaming }: ReasoningBlockProps) {
  const [open, setOpen] = useState(false);
  const expanded = open || streaming;

  return (
    <div className="text-muted-foreground">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
      >
        <Brain className={cn("size-3.5", streaming && "animate-pulse")} />
        <span className={cn(streaming && "animate-pulse")}>
          {streaming ? "Thinking…" : "Thought process"}
        </span>
        <ChevronRight
          className={cn(
            "size-3.5 transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>

      {expanded && text ? (
        <div className="border-border/60 mt-1.5 border-l-2 pl-3">
          <p className="text-muted-foreground/80 text-xs leading-relaxed break-words whitespace-pre-wrap italic">
            {text}
          </p>
        </div>
      ) : null}
    </div>
  );
}
