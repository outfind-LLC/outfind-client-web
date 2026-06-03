import { getNavItems } from "@/features/dashboard/constants/nav";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/interfaces/auth.interface";
import { SidebarChats } from "./sidebar-chats";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

interface SidebarContentProps {
  user: SessionUser;
  /** Desktop icon-rail mode. Always expanded inside the mobile drawer. */
  collapsed?: boolean;
}

/**
 * The inner sidebar layout (brand, navigation, recent chats, account), shared by
 * the desktop rail and the mobile drawer. Nav adapts to the user's account type.
 */
export function SidebarContent({
  user,
  collapsed = false,
}: SidebarContentProps) {
  const items = getNavItems(user.accountType);

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      <SidebarHeader collapsed={collapsed} />

      <div className="flex-1 scrollbar-thin overflow-y-auto px-2 py-2">
        <SidebarNav items={items} collapsed={collapsed} />
        {!collapsed ? (
          <div className="mt-5">
            <SidebarChats />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "border-sidebar-border border-t",
          collapsed ? "p-2" : "p-2.5",
        )}
      >
        <UserMenu user={user} collapsed={collapsed} />
      </div>
    </div>
  );
}
