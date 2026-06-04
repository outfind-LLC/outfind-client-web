"use client";

import { cn } from "@/lib/utils";
import { getSpecialists } from "@/features/chat/constants/specialists";
import { useComposerStore } from "@/features/chat/store/composer.store";
import type { AccountType } from "@/interfaces/enums";

interface SpecialistChipsProps {
  accountType: AccountType;
  disabled?: boolean;
}

/** Horizontal pill chips that let the user pick an AI specialist — rendered below the composer. */
export function SpecialistChips({ accountType, disabled }: SpecialistChipsProps) {
  const specialist = useComposerStore((s) => s.specialist);
  const setSpecialist = useComposerStore((s) => s.setSpecialist);
  const options = getSpecialists(accountType);

  return (
    // Outer div handles horizontal scroll; inner div uses w-max + min-w-full so
    // chips are centered when they fit but scrollable when they overflow on mobile.
    <div className="overflow-x-auto scrollbar-none">
      <div
        role="group"
        aria-label="AI specialist"
        className="flex w-max min-w-full items-center justify-center gap-2 px-1 pb-0.5"
      >
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === specialist;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            title={option.description}
            aria-pressed={active}
            onClick={() => setSpecialist(option.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
              active
                ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
