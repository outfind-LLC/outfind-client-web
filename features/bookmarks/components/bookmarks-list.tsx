"use client";

import Link from "next/link";
import { Bookmark as BookmarkIcon, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import {
  useBookmarks,
  useRemoveBookmark,
} from "@/features/bookmarks/hooks/use-bookmarks";
import { formatRelativeTime } from "@/lib/format";
import type { Bookmark } from "@/interfaces/engagement.interface";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

/** Worker's saved vacancies, with remove. */
export function BookmarksList() {
  const { data, isLoading, isError } = useBookmarks();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">
        Couldn&apos;t load your bookmarks. Please try again.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={BookmarkIcon}
        title="No saved jobs"
        description="Bookmark roles you're interested in and they'll appear here."
        action={
          <Button asChild variant="brand" size="sm">
            <Link href={routes.chat}>Find jobs</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </ul>
  );
}

function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const remove = useRemoveBookmark();
  const { vacancy } = bookmark;
  const location = [vacancy.city, vacancy.country].filter(Boolean).join(", ");

  const onRemove = () => {
    remove.mutate(vacancy.id, {
      onSuccess: () => toast.success("Bookmark removed"),
      onError: () => toast.error("Couldn't remove bookmark"),
    });
  };

  return (
    <li className="border-border/60 bg-card flex items-start justify-between gap-4 rounded-xl border p-4">
      <div className="min-w-0 space-y-1.5">
        <h3 className="truncate font-medium">{vacancy.title}</h3>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {location ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {location}
            </span>
          ) : null}
          <span>Saved {formatRelativeTime(bookmark.createdAt)}</span>
        </div>
        {bookmark.note ? (
          <p className="text-muted-foreground text-sm">{bookmark.note}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Remove bookmark"
        onClick={onRemove}
        disabled={remove.isPending}
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
