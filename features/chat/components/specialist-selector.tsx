"use client";

import { Check, ChevronDown } from "lucide-react";

import {
  findSpecialist,
  getSpecialists,
} from "@/features/chat/constants/specialists";
import { cn } from "@/lib/utils";
import type { AccountType, AiSpecialist } from "@/interfaces/enums";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

interface SpecialistSelectorProps {
  accountType: AccountType;
  value: AiSpecialist;
  onChange: (value: AiSpecialist) => void;
  disabled?: boolean;
}

/** Picks the active AI specialist for the conversation, scoped to the audience. */
export function SpecialistSelector({
  accountType,
  value,
  onChange,
  disabled,
}: SpecialistSelectorProps) {
  const options = getSpecialists(accountType);
  const active = findSpecialist(value) ?? options[0];
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-1.5"
        >
          <ActiveIcon className="text-primary size-4" />
          <span className="hidden sm:inline">{active.label}</span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>AI specialist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const Icon = option.icon;
          const selected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="items-start gap-2.5"
            >
              <Icon className="text-primary mt-0.5 size-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-muted-foreground text-xs">
                  {option.description}
                </p>
              </div>
              <Check
                className={cn(
                  "text-primary mt-0.5 size-4",
                  selected ? "opacity-100" : "opacity-0",
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
