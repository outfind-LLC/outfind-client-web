"use client";

import { Check, ChevronDown, Sparkles } from "lucide-react";

import { useModels } from "@/features/models/hooks/use-models";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { ScrollArea } from "@/ui/scroll-area";

interface ModelSelectorProps {
  /** Selected gateway model id, or `null` for the specialist's default. */
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const AUTO_LABEL = "Auto";

/** Model picker grouped by provider. "Auto" defers to the specialist default. */
export function ModelSelector({
  value,
  onChange,
  disabled,
}: ModelSelectorProps) {
  const { data: providers, isLoading } = useModels();

  const activeLabel =
    value === null
      ? AUTO_LABEL
      : (providers
          ?.flatMap((provider) => provider.models)
          .find((model) => model.id === value)?.name ?? value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="gap-1.5"
        >
          <Sparkles className="text-brand-accent size-4" />
          <span className="hidden max-w-32 truncate sm:inline">
            {activeLabel}
          </span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-0">
        <DropdownMenuLabel className="px-3 pt-2">Model</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onChange(null)} className="mx-1 gap-2">
          <Sparkles className="text-brand-accent size-4" />
          <span className="flex-1">{AUTO_LABEL}</span>
          <Check
            className={cn(
              "size-4",
              value === null ? "opacity-100" : "opacity-0",
            )}
          />
        </DropdownMenuItem>

        <ScrollArea className="h-72">
          {isLoading ? (
            <p className="text-muted-foreground px-3 py-4 text-sm">
              Loading models…
            </p>
          ) : null}
          {providers?.map((provider) => (
            <div key={provider.id}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground px-3 text-xs">
                {provider.provider}
              </DropdownMenuLabel>
              {provider.models.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onChange(model.id)}
                  className="mx-1 gap-2"
                >
                  <span className="flex-1 truncate">
                    {model.name ?? model.id}
                  </span>
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      value === model.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
