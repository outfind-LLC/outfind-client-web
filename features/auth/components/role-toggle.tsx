"use client";

import { Briefcase, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import type { RegistrationAccountType } from "@/features/auth/services/auth.service";

interface RoleOption {
  value: RegistrationAccountType;
  label: string;
  hint: string;
  icon: typeof UserRound;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: ACCOUNT_TYPE.WORKER,
    label: "Find work",
    hint: "Search jobs, build your CV, prep interviews",
    icon: UserRound,
  },
  {
    value: ACCOUNT_TYPE.EMPLOYER,
    label: "Hire talent",
    hint: "Post vacancies, screen candidates with AI",
    icon: Briefcase,
  },
];

interface RoleToggleProps {
  value: RegistrationAccountType;
  onChange: (value: RegistrationAccountType) => void;
}

/** Segmented control that sets the sign-up audience (worker vs. employer). */
export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="I want to"
      className="grid grid-cols-2 gap-3"
    >
      {ROLE_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all outline-none",
              "focus-visible:ring-ring/40 focus-visible:ring-[3px]",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-semibold">{option.label}</span>
            <span className="text-muted-foreground text-xs leading-snug">
              {option.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
