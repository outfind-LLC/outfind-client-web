"use client";

import { Play } from "lucide-react";

import {
  SOUND_EVENTS,
  SOUND_OPTIONS,
  type SoundId,
  type SoundSettings,
} from "@/features/settings/constants/sounds";
import { useSoundSettings } from "@/features/settings/hooks/use-sound-settings";
import { playSoundId } from "@/features/settings/lib/play-sound";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";

/** Notification-sound controls: a master toggle plus a sound per event, each
 * with an instant preview. */
export function SoundSettings() {
  const { settings, update } = useSoundSettings();

  return (
    <div className="space-y-4">
      <div className="border-border/60 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-medium">Notification sounds</p>
          <p className="text-muted-foreground text-xs">
            Play a sound for key events.
          </p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(value) => update({ enabled: value })}
          aria-label="Enable notification sounds"
        />
      </div>

      {settings.enabled ? (
        <div className="space-y-3">
          {SOUND_EVENTS.map((event) => {
            const value = settings[event.id];
            return (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {event.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <select
                    value={value}
                    onChange={(e) => {
                      const id = e.target.value as SoundId;
                      update({ [event.id]: id } as Partial<SoundSettings>);
                      playSoundId(id);
                    }}
                    aria-label={`Sound for ${event.label}`}
                    className="border-input bg-background focus-visible:ring-ring/40 h-9 w-28 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]"
                  >
                    {SOUND_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Preview ${event.label} sound`}
                    disabled={value === "none"}
                    onClick={() => playSoundId(value)}
                  >
                    <Play className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
