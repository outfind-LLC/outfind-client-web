import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

/** Derive up-to-two uppercase initials from a display name. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar with image and initials fallback, used in the sidebar and menus. */
export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-8", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
        {initialsFromName(name)}
      </AvatarFallback>
    </Avatar>
  );
}
