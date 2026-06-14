"use client";

import { useState, type FormEvent } from "react";
import {
  Bookmark,
  BookmarkCheck,
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

import {
  ContactActions,
  hasAnyContact,
  primaryContactHref,
} from "@/features/chat/components/contact-actions";
import { JobAiTools } from "@/features/jobs/components/job-ai-tools";
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
  /** Present for platform roles the worker can act on in-app; absent otherwise. */
  vacancyId?: string;
  actions?: JobActions;
}

/**
 * The full job view: details, company, AI tools, and the apply action. Opened by
 * tapping a job card. The same layout serves every role — whether it can be
 * applied to in-app (with `actions`) or reached through the employer's own
 * channels — so the worker is never shown where a role came from.
 */
export function JobDetailSheet({
  open,
  onOpenChange,
  job,
  vacancyId,
  actions,
}: JobDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-2 border-b p-5 text-left">
          <DialogTitle className="pr-6 text-lg leading-tight break-words">
            {job.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Job and company details, tools, and how to apply
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

        <div className="min-h-0 flex-1 scrollbar-thin space-y-6 overflow-y-auto p-5">
          {job.description ? (
            <Section title="About this role">
              <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
                {job.description}
              </p>
            </Section>
          ) : null}

          {job.requirements.length > 0 ? (
            <Section title="Requirements">
              <ul className="text-foreground/90 list-disc space-y-1 pl-4 text-sm">
                {job.requirements.map((item) => (
                  <li key={item} className="break-words">
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {job.skills.length > 0 ? (
            <Section title="Skills">
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
            </Section>
          ) : null}

          <Section title="Company">
            <div className="space-y-2">
              <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                <Building2 className="text-muted-foreground size-4 shrink-0" />
                <span className="min-w-0 break-words">
                  {job.company ?? "Company"}
                </span>
              </p>
              {job.location ? (
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="break-words">{job.location}</span>
                </p>
              ) : null}
              {hasAnyContact(job.contact) ? (
                <ContactActions contact={job.contact} />
              ) : null}
            </div>
          </Section>

          <JobAiTools job={job} />

          {vacancyId ? <CommentThread vacancyId={vacancyId} open={open} /> : null}
        </div>

        <DetailFooter
          job={job}
          actions={actions}
          onApply={() => {
            // Close first so the apply dialog (and the chat panel that follows a
            // successful apply) aren't stacked behind the sheet.
            onOpenChange(false);
            actions?.applyToJob();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Sticky action bar. In-app apply when possible; otherwise apply via the
 *  employer's own channel — presented identically so the source stays hidden. */
function DetailFooter({
  job,
  actions,
  onApply,
}: {
  job: JobCardData;
  actions?: JobActions;
  onApply: () => void;
}) {
  if (actions) {
    return (
      <div className="bg-background/95 flex items-center gap-2 border-t p-4 backdrop-blur-sm">
        <Button
          variant="brand"
          onClick={onApply}
          disabled={actions.applyPending || actions.applied}
          className="flex-1"
        >
          {actions.applyPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {actions.applied ? "Applied" : "Apply"}
        </Button>
        <Button
          variant={actions.saved ? "secondary" : "outline"}
          size="icon"
          aria-label={actions.saved ? "Saved" : "Save"}
          aria-pressed={actions.saved}
          onClick={actions.toggleSave}
          disabled={actions.savePending}
        >
          {actions.saved ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <Bookmark className="size-4" />
          )}
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

  const href = primaryContactHref(job.contact);
  return (
    <div className="bg-background/95 border-t p-4 backdrop-blur-sm">
      {href ? (
        <Button asChild variant="brand" className="w-full">
          <a href={href} target="_blank" rel="noreferrer">
            Apply
          </a>
        </Button>
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          No application channel was provided for this role.
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </section>
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
      size="icon"
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
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        Questions &amp; comments{comments.length > 0 ? ` (${comments.length})` : ""}
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
