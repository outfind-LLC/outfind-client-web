"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  useConversations,
  useDeleteConversation,
  usePinConversation,
  useRenameConversation,
} from "@/features/chat/hooks/use-conversations";
import {
  conversationHref,
  tabForConversation,
  tabForPath,
} from "@/features/chat/lib/conversation-route";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/interfaces/chat.interface";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

// Aligned with the Job Search landing query so both share one cached fetch.
const SIDEBAR_CHAT_LIMIT = 50;
const MAX_TITLE_LENGTH = 120;

/**
 * Recent conversations for the active tab, rendered as the prototype's plain
 * `.conv` rows under the "Recent" heading. Pinned chats float to the top. The
 * history is contextual: Job Search shows past searches, the AI Assistant shows
 * everything else (partitioned client-side — there's no server specialist filter).
 */
export function SidebarChats() {
  const pathname = usePathname();
  const tab = tabForPath(pathname);
  const { data, isLoading } = useConversations({ limit: SIDEBAR_CHAT_LIMIT });

  if (isLoading) {
    return (
      <div className={s["conv-list"]}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="mx-2.5 h-7 rounded-lg" />
        ))}
      </div>
    );
  }

  const conversations = (data ?? []).filter(
    (c) => tabForConversation(c) === tab,
  );
  const ordered = [
    ...conversations.filter((c) => c.isPinned),
    ...conversations.filter((c) => !c.isPinned),
  ];

  if (ordered.length === 0) {
    return (
      <p className="text-muted-foreground px-2.5 py-1.5 text-sm">
        {tab === "jobs" ? "No searches yet" : "No chats yet"}
      </p>
    );
  }

  return (
    <div className={s["conv-list"]}>
      {ordered.map((conversation) => (
        <ChatRow key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}

function ChatRow({ conversation }: { conversation: Conversation }) {
  const pathname = usePathname();
  const deleteConversation = useDeleteConversation();
  const pinConversation = usePinConversation();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const href = conversationHref(conversation);
  const active = pathname === href;
  const title =
    conversation.title ??
    (tabForConversation(conversation) === "jobs" ? "Job search" : "New chat");
  const pinned = conversation.isPinned;

  const togglePin = () =>
    pinConversation.mutate(
      { id: conversation.id, isPinned: !pinned },
      { onError: () => toast.error("Couldn't update pin") },
    );

  const confirmDelete = () =>
    deleteConversation.mutate(conversation.id, {
      onSuccess: () => setDeleteOpen(false),
      onError: () => toast.error("Couldn't delete chat"),
    });

  return (
    <div className="group/chat relative">
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn(s.conv, active && s.active, "pr-8")}
      >
        <span className={s.txt}>{title}</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Chat options"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 opacity-0 outline-none transition-opacity group-hover/chat:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-44">
          <DropdownMenuItem onSelect={togglePin} className="gap-2">
            {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => requestAnimationFrame(() => setRenameOpen(true))}
            className="gap-2"
          >
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => requestAnimationFrame(() => setDeleteOpen(true))}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameChatDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        conversation={conversation}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete chat?"
        description={
          <>
            <span className="text-foreground font-medium">{title}</span> and all
            of its messages will be permanently deleted. This can&apos;t be
            undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        loading={deleteConversation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function RenameChatDialog({
  open,
  onOpenChange,
  conversation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
}) {
  const rename = useRenameConversation();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = String(new FormData(event.currentTarget).get("title") ?? "")
      .trim()
      .slice(0, MAX_TITLE_LENGTH);
    if (!title) return;

    rename.mutate(
      { id: conversation.id, title },
      {
        onSuccess: () => onOpenChange(false),
        onError: () => toast.error("Couldn't rename chat"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename chat</DialogTitle>
          <DialogDescription>
            Give this conversation a clear name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {/* Remounts on open so the field always reflects the latest title. */}
          <Input
            key={open ? "open" : "closed"}
            name="title"
            defaultValue={conversation.title ?? ""}
            placeholder="Chat name"
            autoFocus
            maxLength={MAX_TITLE_LENGTH}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={rename.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
