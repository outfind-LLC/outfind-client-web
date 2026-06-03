"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";

import { getDefaultSpecialist } from "@/features/chat/constants/specialists";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/interfaces/enums";
import { Button } from "@/ui/button";
import { ModelSelector } from "./model-selector";
import { SpecialistSelector } from "./specialist-selector";
import { VoiceInputButton } from "./voice-input-button";

interface ChatComposerProps {
  accountType: AccountType;
  /** True while a reply is streaming — swaps send for stop and locks the input. */
  busy: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
  autoFocus?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 200;

/** Message composer: auto-growing input plus specialist/model/voice controls. */
export function ChatComposer({
  accountType,
  busy,
  onSend,
  onStop,
  autoFocus,
}: ChatComposerProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const storeSpecialist = useComposerStore((s) => s.specialist);
  const setSpecialist = useComposerStore((s) => s.setSpecialist);
  const model = useComposerStore((s) => s.model);
  const setModel = useComposerStore((s) => s.setModel);

  const specialist = storeSpecialist ?? getDefaultSpecialist(accountType);

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
    onSend(text);
    setInput("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const appendTranscript = (text: string) =>
    setInput((prev) => (prev ? `${prev} ${text}` : text));

  return (
    <div className="border-border/70 bg-card focus-within:border-primary/50 focus-within:ring-ring/15 rounded-2xl border shadow-sm focus-within:ring-[3px]">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        rows={1}
        placeholder="Message Jobsterr…"
        className="placeholder:text-muted-foreground max-h-52 w-full resize-none scrollbar-thin bg-transparent px-4 pt-3.5 text-sm leading-relaxed outline-none"
      />

      <div className="flex items-center gap-2 px-2.5 pt-1 pb-2.5">
        <SpecialistSelector
          accountType={accountType}
          value={specialist}
          onChange={setSpecialist}
          disabled={busy}
        />
        <ModelSelector value={model} onChange={setModel} disabled={busy} />

        <div className="ml-auto flex items-center gap-1">
          <VoiceInputButton onTranscript={appendTranscript} disabled={busy} />
          {busy ? (
            <Button
              type="button"
              size="icon"
              aria-label="Stop"
              onClick={onStop}
              className={cn("rounded-full")}
            >
              <Square className="size-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              aria-label="Send"
              disabled={!input.trim()}
              onClick={submit}
              className="rounded-full"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
