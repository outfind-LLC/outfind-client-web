"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/features/auth/hooks/use-session";
import {
  useApplicationMessages,
  useMarkApplicationRead,
  useSendApplicationMessage,
} from "@/features/applications/hooks/use-application-messages";
import { formatRelativeTime } from "@/lib/format";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type {
  ApplicationMessage,
  ConversationScope,
} from "@/interfaces/application.interface";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";

interface ConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: ConversationScope;
  applicationId: string;
  title: string;
  subtitle?: string;
}

/** Application conversation between a worker and an employer. One component
 * serves both sides via `scope`; bubbles align by the caller's own user id. */
export function ConversationDialog({
  open,
  onOpenChange,
  scope,
  applicationId,
  title,
  subtitle,
}: ConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-h-[680px] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-0.5 border-b p-4 text-left">
          <DialogTitle className="truncate text-base">{title}</DialogTitle>
          <DialogDescription className="truncate text-xs">
            {subtitle ?? "Conversation about this application"}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <Conversation
            scope={scope}
            applicationId={applicationId}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Conversation({
  scope,
  applicationId,
  onClose,
}: {
  scope: ConversationScope;
  applicationId: string;
  onClose: () => void;
}) {
  const { user } = useSession();
  const { data, isLoading } = useApplicationMessages(scope, applicationId, true);
  const sendMessage = useSendApplicationMessage(scope, applicationId);
  const markRead = useMarkApplicationRead(scope, applicationId);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [data],
  );

  // Opening the conversation marks the other side's messages as read.
  const markReadMutate = markRead.mutate;
  useEffect(() => {
    markReadMutate();
  }, [applicationId, markReadMutate]);

  // Keep the latest message in view as the thread grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = () => {
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    sendMessage.mutate(content, {
      onSuccess: () => setDraft(""),
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : "Couldn't send the message",
        ),
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <>
      <div className="min-h-0 flex-1 scrollbar-thin space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet. Start the conversation below.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              mine={message.senderUserId === user?.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="space-y-2 border-t p-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a message…"
          rows={2}
          maxLength={4000}
          autoFocus
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Close
          </button>
          <Button
            type="submit"
            size="sm"
            variant="brand"
            disabled={draft.trim().length === 0 || sendMessage.isPending}
          >
            {sendMessage.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send
          </Button>
        </div>
      </form>
    </>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  message: ApplicationMessage;
  mine: boolean;
}) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] space-y-1 rounded-2xl px-3.5 py-2 text-sm",
          mine
            ? "bg-brand text-white"
            : "bg-muted text-foreground",
        )}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-[10px]",
            mine ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
