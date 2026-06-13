"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface ScriptLine {
  role: "user" | "assistant";
  text: string;
}

const SCRIPT: ScriptLine[] = [
  {
    role: "user",
    text: "Find me remote frontend jobs that sponsor relocation to Europe.",
  },
  {
    role: "assistant",
    text: "Found 3 strong matches. Top pick: Senior React Engineer at a Berlin fintech — full relocation + visa support. Want me to tailor your resume for it?",
  },
  { role: "user", text: "Yes, tailor it." },
  {
    role: "assistant",
    text: "Done. I highlighted your TypeScript and design-system work and rewrote your summary for the role. Ready to apply in one click.",
  },
];

const TYPING_MS = 900;
const READ_MS = 1400;

/** Scripted, auto-playing chat demo. Loops a short worker conversation with a
 * typing indicator — a lightweight stand-in for the live product. */
export function ChatPreview() {
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (shown >= SCRIPT.length) {
      const reset = setTimeout(() => {
        setShown(1);
        setTyping(false);
      }, READ_MS * 2.5);
      return () => clearTimeout(reset);
    }

    // All state updates run inside timers (never synchronously in the effect
    // body): a short beat shows the typing indicator, then the next line lands.
    const startTyping = setTimeout(() => setTyping(true), 60);
    const reveal = setTimeout(() => {
      setTyping(false);
      setShown((count) => count + 1);
    }, TYPING_MS + READ_MS);

    return () => {
      clearTimeout(startTyping);
      clearTimeout(reveal);
    };
  }, [shown]);

  const visible = SCRIPT.slice(0, shown);

  return (
    <div className="border-border/70 bg-card shadow-primary/5 overflow-hidden rounded-2xl border shadow-2xl">
      <div className="border-border/60 flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-destructive/60 size-2.5 rounded-full" />
        <span className="bg-warning/60 size-2.5 rounded-full" />
        <span className="bg-success/60 size-2.5 rounded-full" />
        <div className="text-muted-foreground ml-2 flex items-center gap-1.5 text-xs font-medium">
          <Search className="text-brand-accent size-3.5" />
          Job Finder
        </div>
      </div>

      <div className="flex min-h-80 flex-col gap-3 p-4 sm:min-h-96">
        {visible.map((line, index) => (
          <ChatBubble key={index} role={line.role} text={line.text} />
        ))}
        {typing ? <TypingBubble /> : null}
      </div>
    </div>
  );
}

function ChatBubble({ role, text }: ScriptLine) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 flex duration-500",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md",
        )}
      >
        {text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            style={{ animationDelay: `${delay}ms` }}
            className="bg-muted-foreground/50 size-2 animate-bounce rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
