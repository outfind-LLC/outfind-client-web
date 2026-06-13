"use client";

import Link from "next/link";
import {
  ChevronsUpDown,
  CircleHelp,
  House,
  LogOut,
  MoonStar,
  Repeat,
  Settings,
  UserRound,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import { routes } from "@/config/routes";
import { useMyPlan } from "@/features/billing/hooks/use-my-plan";
import {
  useLogout,
  useSwitchAccount,
} from "@/features/auth/hooks/use-auth-mutations";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/interfaces/auth.interface";
import { ACCOUNT_TYPE, PLAN_TYPE } from "@/interfaces/enums";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

interface UserMenuProps {
  user: SessionUser;
  collapsed: boolean;
}

const FREE_PLANS: string[] = [PLAN_TYPE.FREE, PLAN_TYPE.EMPLOYER_FREE];

/** Bottom-of-sidebar account control: shows the user + plan with an Upgrade
 * shortcut, and opens a full account menu. Collapses to an avatar-only trigger. */
export function UserMenu({ user, collapsed }: UserMenuProps) {
  const { plan } = useMyPlan();
  const logout = useLogout();
  const switchAccount = useSwitchAccount();
  const { resolvedTheme, setTheme } = useTheme();

  const isEmployer = user.accountType === ACCOUNT_TYPE.EMPLOYER;
  const switchTarget = isEmployer ? ACCOUNT_TYPE.WORKER : ACCOUNT_TYPE.EMPLOYER;
  const planLabel = plan?.name ?? "Free plan";
  const isFree = !plan || FREE_PLANS.includes(plan.planType);

  const handleSwitch = () => {
    switchAccount.mutate(switchTarget, {
      onSuccess: () =>
        toast.success(`Switched to ${switchTarget.toLowerCase()}`),
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : "Couldn't switch account",
        ),
    });
  };

  const menu = (
    <DropdownMenuContent
      align={collapsed ? "start" : "end"}
      side="top"
      sideOffset={8}
      className="w-60"
    >
      <DropdownMenuLabel className="flex items-center gap-2.5">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          {user.email ? (
            <p className="text-muted-foreground truncate text-xs font-normal">
              {user.email}
            </p>
          ) : null}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {isFree ? (
        <>
          <DropdownMenuItem asChild>
            <Link href={routes.upgrade} className="gap-2">
              <Zap className="text-brand-accent size-4" />
              Upgrade plan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      ) : null}

      <DropdownMenuItem asChild>
        <Link href={routes.profile} className="gap-2">
          <UserRound className="size-4" />
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={routes.settings} className="gap-2">
          <Settings className="size-4" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={routes.help} className="gap-2">
          <CircleHelp className="size-4" />
          Help &amp; feedback
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleSwitch}
        disabled={switchAccount.isPending}
        className="gap-2"
      >
        <Repeat className="size-4" />
        Switch to {switchTarget.toLowerCase()}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="gap-2"
      >
        <MoonStar className="size-4" />
        Toggle theme
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={routes.home} className="gap-2">
          <House className="size-4" />
          Homepage
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        variant="destructive"
        className="gap-2"
      >
        <LogOut className="size-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="focus-visible:ring-sidebar-ring/40 flex w-full justify-center rounded-lg p-1 outline-none focus-visible:ring-[3px]"
          aria-label="Account menu"
        >
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>
    );
  }

  return (
    <div className="border-sidebar-border bg-sidebar flex items-center gap-1.5 rounded-xl border p-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-left transition-colors outline-none",
            "hover:bg-sidebar-accent/60 focus-visible:ring-sidebar-ring/40 focus-visible:ring-[3px]",
          )}
        >
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-sidebar-foreground/60 truncate text-xs">
              {planLabel}
            </p>
          </div>
          <ChevronsUpDown className="text-sidebar-foreground/50 size-4 shrink-0" />
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>

      {isFree ? (
        <Button asChild size="sm" variant="brand" className="h-8 shrink-0 px-3">
          <Link href={routes.upgrade}>Upgrade</Link>
        </Button>
      ) : null}
    </div>
  );
}
