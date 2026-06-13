"use client";

import { Check, Pipette } from "lucide-react";

import {
  ACCENTS,
  isHexColor,
  readableForeground,
} from "@/features/settings/constants/accents";
import { useAccent } from "@/features/settings/hooks/use-accent";
import { cn } from "@/lib/utils";

/**
 * Accent picker: a row of curated presets plus a free-form colour picker so the
 * user can choose any colour. Selecting either recolours the whole app.
 */
export function AccentColorPicker() {
  const { accent, setAccent } = useAccent();
  const custom = isHexColor(accent);
  const customColor = custom ? accent : "#4a49cf";

  return (
    <div className="flex flex-wrap items-center gap-3">
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

      {/* Custom colour — opens the native picker; recolours live as you drag. */}
      <label
        title="Custom colour"
        className={cn(
          "ring-offset-background relative flex size-9 cursor-pointer items-center justify-center rounded-full ring-2 ring-offset-2 transition-shadow",
          custom
            ? "ring-foreground"
            : "ring-transparent hover:ring-border focus-within:ring-border",
        )}
        style={{
          backgroundColor: custom ? customColor : undefined,
          backgroundImage: custom
            ? undefined
            : "conic-gradient(#ef4444,#f59e0b,#10b981,#3b82f6,#7c3aed,#ef4444)",
        }}
      >
        {custom ? (
          <Check
            className="size-4 drop-shadow"
            style={{ color: readableForeground(customColor) }}
          />
        ) : (
          <Pipette className="size-4 text-white drop-shadow" />
        )}
        <input
          type="color"
          value={customColor}
          onChange={(event) => setAccent(event.target.value)}
          aria-label="Choose a custom accent colour"
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
