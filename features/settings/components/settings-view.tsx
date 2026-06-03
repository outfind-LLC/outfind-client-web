"use client";

import { CreditCard, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useSession } from "@/features/auth/hooks/use-session";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import {
  useBillingPortal,
  useSubscription,
} from "@/features/billing/hooks/use-billing";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how Jobsterr looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemePicker />
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
