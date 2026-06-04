"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  Brain,
  Check,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Lock,
  Maximize2,
  Minimize2,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";

import { useModels } from "@/features/models/hooks/use-models";
import { cn } from "@/lib/utils";
import type { AiModel, ModelProvider } from "@/interfaces/ai-model.interface";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { ScrollArea } from "@/ui/scroll-area";

interface ModelSelectorProps {
  /** Selected gateway model id, or `null` for the specialist's default. */
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const AUTO_LABEL = "Auto";

type IconComponent = ComponentType<{ className?: string }>;
interface Capability {
  key: string;
  label: string;
  Icon: IconComponent;
}

/** Human-readable capability chips derived from a model's flags + modalities. */
function getCapabilities(model: AiModel): Capability[] {
  const caps: Capability[] = [];
  if (model.reasoning)
    caps.push({ key: "reasoning", label: "Reasoning", Icon: Brain });
  if (model.toolCall)
    caps.push({ key: "tools", label: "Tool calling", Icon: Wrench });
  const inputs = model.modalities?.input ?? [];
  if (inputs.includes("image"))
    caps.push({ key: "image", label: "Image input", Icon: ImageIcon });
  if (inputs.includes("pdf"))
    caps.push({ key: "pdf", label: "PDF input", Icon: FileText });
  return caps;
}

/** 40960 → "41K", 1000000 → "1M". */
function formatContext(tokens?: number): string | null {
  if (!tokens || tokens <= 0) return null;
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  return `${Math.round(tokens / 1000)}K`;
}

/** Per-million-token price, trimmed of float noise: 3.5999996 → "$3.6". */
function formatPrice(perMillion?: number): string | null {
  if (perMillion === undefined || perMillion === null) return null;
  return `$${Number(perMillion.toFixed(2))}`;
}

/** Model picker: provider rail + searchable, expandable/collapsible model list. */
export function ModelSelector({
  value,
  onChange,
  disabled,
}: ModelSelectorProps) {
  const { data: providers, isLoading } = useModels();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);

  const list = useMemo(() => providers ?? [], [providers]);
  const query = search.trim().toLowerCase();

  const activeModel = useMemo(
    () => list.flatMap((p) => p.models).find((m) => m.id === value) ?? null,
    [list, value],
  );

  // Rail opens on the provider that owns the current selection, unless overridden.
  const valueProviderId =
    list.find((p) => p.models.some((m) => m.id === value))?.id ?? null;
  const effectiveProviderId =
    activeProviderId ?? valueProviderId ?? list[0]?.id ?? null;
  const activeProvider = list.find((p) => p.id === effectiveProviderId) ?? null;

  // Search spans every provider; otherwise show the active provider's models.
  const results = useMemo(() => {
    if (query) {
      return list
        .flatMap((p) => p.models)
        .filter((m) =>
          `${m.name ?? ""} ${m.id} ${m.family ?? ""}`
            .toLowerCase()
            .includes(query),
        );
    }
    return activeProvider?.models ?? [];
  }, [query, list, activeProvider]);

  const triggerLabel =
    value === null ? AUTO_LABEL : (activeModel?.name ?? value);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setSearchOpen(false);
    }
  };

  const select = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  const selectProvider = (id: string) => {
    setActiveProviderId(id);
    setSearch("");
  };

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearch("");
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="gap-1.5"
        >
          <Sparkles className="text-brand-accent size-4" />
          <span className="hidden max-w-32 truncate sm:inline">
            {triggerLabel}
          </span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        className={cn(
          "flex h-[24rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0",
          expanded ? "w-[34rem]" : "w-[21rem]",
        )}
      >
        {/* Header: active provider + search / expand toggles */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {query ? (
              <span className="text-sm font-semibold">Search results</span>
            ) : activeProvider ? (
              <>
                <span className="border-border/70 flex size-6 shrink-0 items-center justify-center rounded-md border bg-white">
                  <ProviderLogo provider={activeProvider} className="size-4" />
                </span>
                <span className="truncate text-sm font-semibold">
                  {activeProvider.provider}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold">Models</span>
            )}
          </div>
          <HeaderButton
            label="Search models"
            active={searchOpen}
            onClick={toggleSearch}
          >
            <Search className="size-4" />
          </HeaderButton>
          <HeaderButton
            label={expanded ? "Collapse details" : "Expand details"}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </HeaderButton>
        </div>

        {searchOpen ? (
          <div className="border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search models…"
                className="h-8 pl-8"
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <ProviderRail
            providers={list}
            activeId={query ? null : effectiveProviderId}
            onSelect={selectProvider}
          />

          <ScrollArea className="min-h-0 flex-1">
            <div
              className={cn("p-2", expanded ? "space-y-1.5" : "space-y-0.5")}
            >
              {!query ? (
                <AutoOption
                  expanded={expanded}
                  selected={value === null}
                  onSelect={() => select(null)}
                />
              ) : null}

              {isLoading ? (
                <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                  Loading models…
                </p>
              ) : null}

              {results.map((model) =>
                expanded ? (
                  <ModelCard
                    key={model.id}
                    model={model}
                    selected={value === model.id}
                    onSelect={() => select(model.id)}
                  />
                ) : (
                  <ModelRow
                    key={model.id}
                    model={model}
                    selected={value === model.id}
                    onSelect={() => select(model.id)}
                  />
                ),
              )}

              {!isLoading && results.length === 0 ? (
                <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                  No models found
                </p>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function HeaderButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

/** Vertical, scrollable strip of provider logos. Clicking one filters the list. */
function ProviderRail({
  providers,
  activeId,
  onSelect,
}: {
  providers: ModelProvider[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (providers.length <= 1) return null;
  return (
    <ScrollArea className="border-border/70 w-14 shrink-0 border-r">
      <div className="flex flex-col items-center gap-1.5 p-2">
        {providers.map((provider) => {
          const active = provider.id === activeId;
          return (
            <button
              key={provider.id}
              type="button"
              title={provider.provider}
              aria-label={provider.provider}
              aria-pressed={active}
              onClick={() => onSelect(provider.id)}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border bg-white transition-all",
                active
                  ? "border-primary ring-primary/30 ring-2"
                  : "border-border/70 opacity-70 hover:opacity-100",
              )}
            >
              <ProviderLogo provider={provider} className="size-5" />
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/** Provider logo as a background image (works for SVGs without next/image config). */
function ProviderLogo({
  provider,
  className,
}: {
  provider: ModelProvider;
  className?: string;
}) {
  if (!provider.image) {
    return (
      <span
        aria-label={provider.provider}
        className={cn(
          "text-muted-foreground flex items-center justify-center rounded bg-transparent text-[10px] font-semibold uppercase",
          className,
        )}
      >
        {provider.provider.slice(0, 2)}
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={provider.provider}
      className={cn("bg-contain bg-center bg-no-repeat", className)}
      style={{ backgroundImage: `url("${provider.image}")` }}
    />
  );
}

/** "Auto" entry — defers to the active specialist's default model. */
function AutoOption({
  expanded,
  selected,
  onSelect,
}: {
  expanded: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
          selected ? "bg-success/10 text-success" : "hover:bg-accent",
        )}
      >
        <Sparkles className="text-brand-accent size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {AUTO_LABEL}
        </span>
        {selected ? <Check className="text-success size-4 shrink-0" /> : null}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-success/50 bg-success/10"
          : "hover:border-border hover:bg-accent/50 border-transparent",
      )}
    >
      <Sparkles className="text-brand-accent mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", selected && "text-success")}>
          {AUTO_LABEL}
        </p>
        <p className="text-muted-foreground text-xs">
          Let the specialist pick the best model for the task.
        </p>
      </div>
      {selected ? (
        <Check className="text-success mt-0.5 size-4 shrink-0" />
      ) : null}
    </button>
  );
}

/** Expanded model card: name, capabilities, description, and a stat footer. */
function ModelCard({
  model,
  selected,
  onSelect,
}: {
  model: AiModel;
  selected: boolean;
  onSelect: () => void;
}) {
  const locked = !model.isAllowed;
  const caps = getCapabilities(model);
  const ctx = formatContext(model.limit?.context);
  const inCost = formatPrice(model.cost?.input);
  const outCost = formatPrice(model.cost?.output);
  const cost = inCost && outCost ? `${inCost} · ${outCost}` : "—";

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        locked && "cursor-not-allowed opacity-55",
        selected
          ? "border-success/50 bg-success/10"
          : locked
            ? "border-transparent"
            : "hover:border-border hover:bg-accent/50 border-transparent",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {locked ? (
            <Lock className="text-muted-foreground size-3.5 shrink-0" />
          ) : null}
          <span
            className={cn(
              "truncate text-sm font-medium",
              selected && "text-success",
            )}
          >
            {model.name ?? model.id}
          </span>
          {selected ? <Check className="text-success size-4 shrink-0" /> : null}
        </div>
        {ctx ? (
          <span className="text-muted-foreground bg-muted shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium">
            {ctx} CTX
          </span>
        ) : null}
        <CapabilityIcons caps={caps} />
      </div>

      {model.description ? (
        <p className="text-muted-foreground mt-1.5 line-clamp-3 text-xs leading-relaxed">
          {model.description}
        </p>
      ) : null}

      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
        <Meta label="$/1M in·out" value={cost} />
        <Meta label="Knowledge" value={model.knowledge ?? "—"} />
        <Meta label="Released" value={model.releaseDate ?? "—"} />
        <Meta label="Updated" value={model.lastUpdated ?? "—"} />
      </div>
    </button>
  );
}

/** Collapsed model row: name + lock + capability icons only. */
function ModelRow({
  model,
  selected,
  onSelect,
}: {
  model: AiModel;
  selected: boolean;
  onSelect: () => void;
}) {
  const locked = !model.isAllowed;
  const caps = getCapabilities(model);

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        locked && "cursor-not-allowed opacity-55",
        selected
          ? "bg-success/10 text-success"
          : locked
            ? ""
            : "hover:bg-accent",
      )}
    >
      {locked ? (
        <Lock className="text-muted-foreground size-3.5 shrink-0" />
      ) : null}
      <span className="min-w-0 flex-1 truncate font-medium">
        {model.name ?? model.id}
      </span>
      {selected ? <Check className="text-success size-4 shrink-0" /> : null}
      <CapabilityIcons caps={caps} />
    </button>
  );
}

function CapabilityIcons({ caps }: { caps: Capability[] }) {
  if (caps.length === 0) return null;
  return (
    <div className="text-muted-foreground flex shrink-0 items-center gap-1">
      {caps.map(({ key, label, Icon }) => (
        <span key={key} title={label}>
          <Icon className="size-3.5" />
        </span>
      ))}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground/70 truncate text-[10px] tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground/80 truncate text-[11px]">{value}</p>
    </div>
  );
}
