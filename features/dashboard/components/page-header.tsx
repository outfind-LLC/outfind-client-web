import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Right-aligned actions (buttons, filters). */
  actions?: ReactNode;
}

/** Consistent feature-page header: icon, title, description, optional actions. */
export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
