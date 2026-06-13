"use client";

import { FONTS } from "@/features/settings/constants/fonts";
import { useFont } from "@/features/settings/hooks/use-font";
import { cn } from "@/lib/utils";

/** Typeface picker; each option previews itself in its own font. */
export function FontPicker() {
  const { font, setFont } = useFont();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {FONTS.map((option) => {
        const active = option.id === font;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setFont(option.id)}
            aria-pressed={active}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 transition-colors",
              active
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/50",
            )}
          >
            <span className="text-xl leading-none" style={{ fontFamily: option.stack }}>
              Ag
            </span>
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
