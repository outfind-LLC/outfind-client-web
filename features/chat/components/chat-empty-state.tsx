"use client";

import { Sparkles } from "lucide-react";

import { ACCOUNT_TYPE, type AccountType } from "@/interfaces/enums";

interface ChatEmptyStateProps {
  userName: string;
  accountType: AccountType;
  onPick: (prompt: string) => void;
}

const WORKER_PROMPTS = [
  "Find me remote frontend jobs that sponsor relocation",
  "Help me write a CV for a logistics role in Dubai",
  "What skills should I learn to earn more as a designer?",
  "Practice common interview questions for a sales job",
];

const EMPLOYER_PROMPTS = [
  "Write a job post for a senior backend engineer",
  "Draft screening questions for a customer support role",
  "Summarise what makes a strong applicant for this vacancy",
  "Help me compare two shortlisted candidates",
];

/** New-chat greeting with audience-aware suggestion chips. */
export function ChatEmptyState({
  userName,
  accountType,
  onPick,
}: ChatEmptyStateProps) {
  const firstName = userName.split(/\s+/)[0] || "there";
  const prompts =
    accountType === ACCOUNT_TYPE.EMPLOYER ? EMPLOYER_PROMPTS : WORKER_PROMPTS;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
      <span className="from-brand to-brand-2 shadow-primary/20 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg">
        <Sparkles className="size-7" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Hi {firstName}, how can I help?
        </h1>
        <p className="text-muted-foreground">
          Pick a starting point or just type your own message below.
        </p>
      </div>

      <div className="grid w-full gap-2.5 sm:grid-cols-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="border-border/70 bg-card hover:border-primary/40 hover:bg-muted/50 rounded-xl border p-3.5 text-left text-sm transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
