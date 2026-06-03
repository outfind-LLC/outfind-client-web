import { BrandLogo } from "@/components/brand-logo";
import { getNavItems } from "@/features/dashboard/constants/nav";
import type { SessionUser } from "@/interfaces/auth.interface";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

interface SidebarContentProps {
  user: SessionUser;
}

/**
 * The inner sidebar layout (logo, nav, account menu), shared by the desktop
 * rail and the mobile drawer. Nav items adapt to the user's account type.
 */
export function SidebarContent({ user }: SidebarContentProps) {
  const items = getNavItems(user.accountType);

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <BrandLogo href="/" />
      </div>

      <div className="flex-1 scrollbar-thin overflow-y-auto px-3 py-2">
        <SidebarNav items={items} />
      </div>

      <div className="border-sidebar-border border-t p-3">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
