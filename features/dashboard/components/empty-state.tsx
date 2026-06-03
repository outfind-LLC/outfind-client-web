import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Dashed-border empty state for lists with no items. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border/70 bg-muted/20 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
      <Icon className="text-muted-foreground size-7" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
