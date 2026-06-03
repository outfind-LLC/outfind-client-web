"use client";

import Link from "next/link";
import {
  ChevronsUpDown,
  CircleHelp,
  LogOut,
  Repeat,
  Settings,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import { routes } from "@/config/routes";
import { useMyPlan } from "@/features/billing/hooks/use-my-plan";
import {
  useLogout,
  useSwitchAccount,
} from "@/features/auth/hooks/use-auth-mutations";
import { isApiClientError } from "@/lib/api/error";
import type { SessionUser } from "@/interfaces/auth.interface";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
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
}

/**
 * Bottom-of-sidebar account control: shows the user + current plan, and opens a
 * menu for profile, settings, help, account switching, and logout.
 */
export function UserMenu({ user }: UserMenuProps) {
  const { plan } = useMyPlan();
  const logout = useLogout();
  const switchAccount = useSwitchAccount();

  const isEmployer = user.accountType === ACCOUNT_TYPE.EMPLOYER;
  const switchTarget = isEmployer ? ACCOUNT_TYPE.WORKER : ACCOUNT_TYPE.EMPLOYER;
  const planLabel = plan?.name ?? "Free plan";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-border/60 bg-card hover:bg-muted focus-visible:ring-ring/40 flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors outline-none focus-visible:ring-[3px]">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-muted-foreground truncate text-xs">{planLabel}</p>
        </div>
        <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{user.name}</span>
          {user.email ? (
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user.email}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

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
    </DropdownMenu>
  );
}
