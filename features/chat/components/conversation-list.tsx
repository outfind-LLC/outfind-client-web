"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import {
  useConversations,
  useDeleteConversation,
} from "@/features/chat/hooks/use-conversations";
import { findSpecialist } from "@/features/chat/constants/specialists";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation } from "@/interfaces/chat.interface";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

/** Conversation history: searchable list of past chats with open + delete. */
export function ConversationList() {
  const { data, isLoading, isError } = useConversations({ limit: 50 });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">
        Couldn&apos;t load your conversations. Please try again.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border-border/70 bg-muted/20 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
        <MessageSquare className="text-muted-foreground size-7" />
        <div className="space-y-1">
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-muted-foreground text-sm">
            Start a new chat and it&apos;ll show up here.
          </p>
        </div>
        <Button asChild variant="brand" size="sm">
          <Link href={routes.chat}>New chat</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {data.map((conversation) => (
        <ConversationRow key={conversation.id} conversation={conversation} />
      ))}
    </ul>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const router = useRouter();
  const deleteConversation = useDeleteConversation();
  const specialist = findSpecialist(conversation.specialist);

  const remove = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    deleteConversation.mutate(conversation.id, {
      onSuccess: () => toast.success("Conversation deleted"),
      onError: () => toast.error("Couldn't delete conversation"),
    });
  };

  return (
    <li>
      <Link
        href={routes.chatThread(conversation.id)}
        onClick={() => router.prefetch(routes.chatThread(conversation.id))}
        className="group border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40 flex items-center gap-3 rounded-xl border p-3.5 transition-colors"
      >
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <MessageSquare className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {conversation.isPinned ? (
              <Pin className="text-brand-accent size-3.5 shrink-0" />
            ) : null}
            <p className="truncate text-sm font-medium">
              {conversation.title ?? "New chat"}
            </p>
          </div>
          <p className="text-muted-foreground truncate text-xs">
            {specialist?.label ?? "Assistant"} ·{" "}
            {formatRelativeTime(
              conversation.lastMessageAt ?? conversation.updatedAt,
            )}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Delete conversation"
          onClick={remove}
          disabled={deleteConversation.isPending}
          className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Trash2 className="size-4" />
        </Button>
      </Link>
    </li>
  );
}
