"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { routes } from "@/config/routes";
import {
  useConversations,
  useDeleteConversation,
  usePinConversation,
  useRenameConversation,
} from "@/features/chat/hooks/use-conversations";
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

const SIDEBAR_CHAT_LIMIT = 20;
const MAX_TITLE_LENGTH = 120;

/** Recent conversations, split into Pinned and Chats sections (like Claude). */
export function SidebarChats() {
  const { data, isLoading } = useConversations({ limit: SIDEBAR_CHAT_LIMIT });

  if (isLoading) {
    return (
      <div className="space-y-1 px-2 py-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const conversations = data ?? [];
  const pinned = conversations.filter((c) => c.isPinned);
  const recent = conversations.filter((c) => !c.isPinned);

  return (
    <div className="space-y-4">
      {pinned.length > 0 ? (
        <ChatGroup label="Pinned" conversations={pinned} />
      ) : null}

      {recent.length > 0 ? (
        <ChatGroup label="Chats" conversations={recent} />
      ) : null}

      {conversations.length === 0 ? (
        <div className="flex flex-col gap-0.5">
          <GroupLabel>Chats</GroupLabel>
          <p className="px-3 py-1.5 text-sm text-sidebar-foreground/50">
            No chats yet
          </p>
        </div>
      ) : null}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/50 uppercase">
      {children}
    </p>
  );
}

function ChatGroup({
  label,
  conversations,
}: {
  label: string;
  conversations: Conversation[];
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <GroupLabel>{label}</GroupLabel>
      {conversations.map((conversation) => (
        <ChatRow key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}

function ChatRow({ conversation }: { conversation: Conversation }) {
  const pathname = usePathname();
  const deleteConversation = useDeleteConversation();
  const pinConversation = usePinConversation();
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const href = routes.chatThread(conversation.id);
  const active = pathname === href;
  const title = conversation.title ?? "New chat";
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
    <div
      className={cn(
        "group/chat relative flex items-center rounded-lg transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        aria-current={active ? "page" : undefined}
        className="min-w-0 flex-1 truncate rounded-lg px-3 py-1.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/40"
      >
        {title}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Chat options"
          className="mr-1 shrink-0 rounded p-1 text-sidebar-foreground/50 opacity-0 outline-none transition-opacity hover:text-sidebar-foreground group-hover/chat:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-44">
          <DropdownMenuItem onSelect={togglePin} className="gap-2">
            {pinned ? (
              <PinOff className="size-4" />
            ) : (
              <Pin className="size-4" />
            )}
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
            <span className="font-medium text-foreground">{title}</span> and all
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
