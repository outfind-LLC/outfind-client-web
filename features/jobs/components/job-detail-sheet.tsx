"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  Loader2,
  MapPin,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { ContactActions } from "@/features/chat/components/contact-actions";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  useCreateComment,
  useDeleteComment,
  useVacancyComments,
} from "@/features/engagement/hooks/use-vacancy-engagement";
import type { JobActions } from "@/features/jobs/hooks/use-job-actions";
import type { JobCardData } from "@/features/chat/types/job";
import { isApiClientError } from "@/lib/api/error";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { REACTION_TYPE } from "@/interfaces/enums";
import type { VacancyComment } from "@/interfaces/engagement.interface";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";

interface JobDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobCardData;
  vacancyId: string;
  actions: JobActions;
}

/** Full job view: details, the worker's actions, and the comment thread. */
export function JobDetailSheet({
  open,
  onOpenChange,
  job,
  vacancyId,
  actions,
}: JobDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-2 border-b p-5 text-left">
          <DialogTitle className="pr-6 text-lg leading-tight break-words">
            {job.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Job details, actions, and comments
          </DialogDescription>
          {job.company ? (
            <p className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-sm">
              <Building2 className="size-3.5 shrink-0" />
              <span className="min-w-0 break-words">{job.company}</span>
            </p>
          ) : null}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            {job.location ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                <span className="min-w-0 break-words">{job.location}</span>
              </span>
            ) : null}
            {job.salary ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <Wallet className="size-3.5 shrink-0" />
                <span className="min-w-0 break-words">{job.salary}</span>
              </span>
            ) : null}
            {job.isRemote ? <Badge variant="success">Remote</Badge> : null}
            {job.jobType ? (
              <Badge variant="outline" className="max-w-full">
                <span className="truncate">{job.jobType}</span>
              </Badge>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 scrollbar-thin space-y-5 overflow-y-auto p-5">
          {job.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="max-w-full font-normal whitespace-normal break-words"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : null}

          <ContactActions contact={job.contact} />

          <ActionRow
            actions={actions}
            onApply={() => {
              // Close the sheet first so the apply dialog (and the chat panel
              // that follows a successful apply) aren't stacked behind it.
              onOpenChange(false);
              actions.applyToJob();
            }}
          />

          <CommentThread vacancyId={vacancyId} open={open} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionRow({
  actions,
  onApply,
}: {
  actions: JobActions;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="brand"
        size="sm"
        onClick={onApply}
        disabled={actions.applyPending || actions.applied}
      >
        {actions.applyPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : null}
        {actions.applied ? "Applied" : "Apply"}
      </Button>
      <Button
        variant={actions.saved ? "secondary" : "outline"}
        size="sm"
        onClick={actions.toggleSave}
        disabled={actions.savePending}
      >
        {actions.saved ? "Saved" : "Save"}
      </Button>
      <ReactionButton
        label="Like"
        active={actions.reaction === REACTION_TYPE.LIKE}
        disabled={actions.reactionPending}
        onClick={() => actions.react(REACTION_TYPE.LIKE)}
        icon={<ThumbsUp className="size-4" />}
      />
      <ReactionButton
        label="Dislike"
        active={actions.reaction === REACTION_TYPE.DISLIKE}
        disabled={actions.reactionPending}
        onClick={() => actions.react(REACTION_TYPE.DISLIKE)}
        icon={<ThumbsDown className="size-4" />}
      />
    </div>
  );
}

function ReactionButton({
  label,
  active,
  disabled,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(active && "text-brand")}
    >
      {icon}
    </Button>
  );
}

function CommentThread({
  vacancyId,
  open,
}: {
  vacancyId: string;
  open: boolean;
}) {
  const { user } = useSession();
  const { data, isLoading } = useVacancyComments(vacancyId, open);
  const createComment = useCreateComment(vacancyId);
  const deleteComment = useDeleteComment(vacancyId);
  const [draft, setDraft] = useState("");

  const comments = data ?? [];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || createComment.isPending) return;
    createComment.mutate(content, {
      onSuccess: () => setDraft(""),
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : "Couldn't post the comment",
        ),
    });
  };

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </h3>

      <form onSubmit={submit} className="space-y-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a question or share what you know about this job…"
          rows={2}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            variant="brand"
            disabled={draft.trim().length === 0 || createComment.isPending}
          >
            {createComment.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Post
          </Button>
        </div>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          Loading comments…
        </p>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No comments yet. Be the first to ask.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              isOwn={comment.userId === user?.id}
              onDelete={() =>
                deleteComment.mutate(comment.id, {
                  onError: () => toast.error("Couldn't delete the comment"),
                })
              }
              deleting={deleteComment.isPending}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentRow({
  comment,
  isOwn,
  onDelete,
  deleting,
}: {
  comment: VacancyComment;
  isOwn: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  const initials = comment.author.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <li className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        {comment.author.avatarUrl ? (
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
        ) : null}
        <AvatarFallback className="text-xs">{initials || "?"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {comment.author.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {isOwn ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete comment"
              className="text-muted-foreground hover:text-destructive ml-auto shrink-0 rounded p-1 transition-colors disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
        <p className="text-foreground/90 text-sm break-words whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </li>
  );
}
