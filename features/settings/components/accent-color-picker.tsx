"use client";

import { Check } from "lucide-react";

import { ACCENTS } from "@/features/settings/constants/accents";
import { useAccent } from "@/features/settings/hooks/use-accent";
import { cn } from "@/lib/utils";

/** Swatch grid that recolours the whole app by re-pointing the brand tokens. */
export function AccentColorPicker() {
  const { accent, setAccent } = useAccent();

  return (
    <div className="flex flex-wrap gap-3">
      {ACCENTS.map((option) => {
        const active = option.id === accent;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setAccent(option.id)}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            className={cn(
              "ring-offset-background flex size-9 items-center justify-center rounded-full ring-2 ring-offset-2 transition-shadow",
              active
                ? "ring-foreground"
                : "ring-transparent hover:ring-border focus-visible:ring-border",
            )}
            style={{ backgroundColor: option.swatch }}
          >
            {active ? (
              <Check className="size-4 text-white drop-shadow" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
