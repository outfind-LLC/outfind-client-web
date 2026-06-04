"use client";

import { useMemo, useRef, useState, type ComponentType } from "react";
import {
  Brain,
  BrainCircuit,
  Check,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Lock,
  Maximize2,
  Minimize2,
  Search,
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
  /** Selected gateway model id. */
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => providers ?? [], [providers]);
  const query = search.trim().toLowerCase();

  const activeModel = useMemo(
    () => list.flatMap((p) => p.models).find((m) => m.id === value) ?? null,
    [list, value],
  );

  // The rail tracks whichever provider section is at the top of the scroll.
  const effectiveProviderId = activeProviderId ?? list[0]?.id ?? null;
  const activeProvider = list.find((p) => p.id === effectiveProviderId) ?? null;

  // Search spans every provider; otherwise the full catalogue scrolls as one.
  const searchResults = useMemo(() => {
    if (!query) return [];
    return list
      .flatMap((p) => p.models)
      .filter((m) =>
        `${m.name ?? ""} ${m.id} ${m.family ?? ""}`
          .toLowerCase()
          .includes(query),
      );
  }, [query, list]);

  const triggerLabel = activeModel?.name ?? value ?? "Model";

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setSearchOpen(false);
    }
  };

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  // Mark which provider section sits at the top of the viewport as we scroll.
  const handleScroll = (container: HTMLDivElement) => {
    const sections = Array.from(
      container.querySelectorAll<HTMLElement>("[data-provider-id]"),
    );
    const threshold = container.scrollTop + 16;
    let current: string | undefined;
    for (const section of sections) {
      if (section.offsetTop <= threshold) current = section.dataset.providerId;
      else break;
    }
    if (current && current !== activeProviderId) setActiveProviderId(current);
  };

  // Clicking a provider clears any search and scrolls its section to the top.
  const selectProvider = (id: string) => {
    setActiveProviderId(id);
    if (search) setSearch("");
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      const section = container?.querySelector<HTMLElement>(
        `[data-provider-id="${id}"]`,
      );
      if (container && section) {
        container.scrollTo({ top: section.offsetTop - 8, behavior: "smooth" });
      }
    });
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
          <BrainCircuit className="text-brand-accent size-4" />
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
          "flex h-[min(32rem,75vh)] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0",
          expanded ? "w-[37rem]" : "w-[24rem]",
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

          <div
            ref={scrollRef}
            onScroll={(event) => handleScroll(event.currentTarget)}
            className="relative min-h-0 flex-1 scrollbar-thin overflow-y-auto overscroll-contain"
          >
            {isLoading ? (
              <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                Loading models…
              </p>
            ) : query ? (
              <div
                className={cn("p-2", expanded ? "space-y-1.5" : "space-y-0.5")}
              >
                {searchResults.length === 0 ? (
                  <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                    No models found
                  </p>
                ) : (
                  searchResults.map((model) => (
                    <ModelEntry
                      key={model.id}
                      model={model}
                      expanded={expanded}
                      selected={value === model.id}
                      onSelect={() => select(model.id)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4 p-2">
                {list.map((provider) => (
                  <section key={provider.id} data-provider-id={provider.id}>
                    <ProviderSectionLabel provider={provider} />
                    <div
                      className={cn(
                        "mt-1.5",
                        expanded ? "space-y-1.5" : "space-y-0.5",
                      )}
                    >
                      {provider.models.map((model) => (
                        <ModelEntry
                          key={model.id}
                          model={model}
                          expanded={expanded}
                          selected={value === model.id}
                          onSelect={() => select(model.id)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
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

/** Vertical, scrollable strip of provider logos; the active one glows green. */
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
                "flex size-10 shrink-0 items-center justify-center rounded-lg transition-all",
                active
                  ? "bg-success/15 ring-success/50 ring-2"
                  : "hover:bg-muted opacity-70 hover:opacity-100",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-md border bg-white",
                  active ? "border-success/40" : "border-border/70",
                )}
              >
                <ProviderLogo provider={provider} className="size-5" />
              </span>
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
          "text-muted-foreground flex items-center justify-center text-[10px] font-semibold uppercase",
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

function ProviderSectionLabel({ provider }: { provider: ModelProvider }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="border-border/70 flex size-5 shrink-0 items-center justify-center rounded border bg-white">
        <ProviderLogo provider={provider} className="size-3.5" />
      </span>
      <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {provider.provider}
      </span>
    </div>
  );
}

/** A single model — expanded card or collapsed row, depending on the mode. */
function ModelEntry({
  model,
  expanded,
  selected,
  onSelect,
}: {
  model: AiModel;
  expanded: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return expanded ? (
    <ModelCard model={model} selected={selected} onSelect={onSelect} />
  ) : (
    <ModelRow model={model} selected={selected} onSelect={onSelect} />
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
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
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
