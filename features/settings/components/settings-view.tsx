"use client";

import { CreditCard, Gauge, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { AccentColorPicker } from "@/features/settings/components/accent-color-picker";
import { useSession } from "@/features/auth/hooks/use-session";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import {
  useBillingPortal,
  useSubscription,
} from "@/features/billing/hooks/use-billing";
import { useMyPlan } from "@/features/billing/hooks/use-my-plan";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AnnotatedFeature } from "@/interfaces/plan.interface";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/** Settings: account details, subscription, appearance, and sign-out. */
export function SettingsView() {
  const { user } = useSession();
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Name" value={user.name} />
          {user.email ? <Row label="Email" value={user.email} /> : null}
          <Row label="Account type" value={user.accountType.toLowerCase()} />
          <Row label="Sign-in" value={user.provider.toLowerCase()} />
          <Row label="User code" value={user.userCode} mono />
        </CardContent>
      </Card>

      <SubscriptionCard />

      <UsageCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how Peoplor looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="Theme">
            <ThemePicker />
          </Field>
          <Field
            label="Accent color"
            hint="Recolors buttons, links, and highlights across the app."
          >
            <AccentColorPicker />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sign out</CardTitle>
          <CardDescription>End your session on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-destructive hover:text-destructive gap-2"
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionCard() {
  const { data, isLoading, isError } = useSubscription();
  const portal = useBillingPortal();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="text-primary size-4" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : isError || !data ? (
          <p className="text-muted-foreground text-sm">
            You&apos;re on the free plan.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {data.planName ?? data.planType}
              </span>
              <Badge variant={data.isActive ? "success" : "secondary"}>
                {data.status.toLowerCase()}
              </Badge>
            </div>
            {data.currentPeriodEnd ? (
              <p className="text-muted-foreground text-sm">
                {data.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
                {formatRelativeTime(data.currentPeriodEnd)}
              </p>
            ) : null}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => portal.mutate()}
          disabled={portal.isPending}
        >
          Manage billing
        </Button>
      </CardContent>
    </Card>
  );
}

function UsageCard() {
  const { features, isLoading } = useMyPlan();
  const metered = features.filter(
    (feature) => feature.allowed && feature.limit !== null && feature.limit > 0,
  );

  if (!isLoading && metered.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="text-primary size-4" />
          Usage
        </CardTitle>
        <CardDescription>Your metered allowances this period.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : (
          metered.map((feature) => (
            <UsageRow key={feature.key} feature={feature} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function UsageRow({ feature }: { feature: AnnotatedFeature }) {
  const limit = feature.limit ?? 0;
  const used = feature.used ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const period = feature.period
    ? feature.period.toLowerCase().replace(/_/g, " ")
    : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate">{feature.name}</span>
        <span className="text-muted-foreground shrink-0">
          {used} / {limit}
          {period ? ` · ${period}` : ""}
        </span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="border-border/60 inline-flex gap-1 rounded-lg border p-1">
      {THEMES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
            theme === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}
