"use client";

import { Star } from "lucide-react";

import { useRecommendations } from "@/features/recommendations/hooks/use-recommendations";
import { RecommendationCard } from "@/features/recommendations/components/recommendation-card";
import { Skeleton } from "@/ui/skeleton";

/** "Recommended for you" feed on the Job Search landing. Hides itself when the
 * worker has no matches yet. */
export function RecommendationsSection({ enabled }: { enabled: boolean }) {
  const { data, isLoading } = useRecommendations(enabled);
  const items = data ?? [];

  if (!enabled || (!isLoading && items.length === 0)) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        <Star className="size-3.5" />
        Recommended for you
      </h2>
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((vacancy) => (
            <RecommendationCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}
    </div>
  );
}
