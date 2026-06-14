"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  ContactActions,
  hasAnyContact,
  primaryContactHref,
} from "@/features/chat/components/contact-actions";
import { JobAiTools } from "@/features/jobs/components/job-ai-tools";
import { useJobActions, type JobActions } from "@/features/jobs/hooks/use-job-actions";
import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import { useVacancyDetail } from "@/features/recommendations/hooks/use-vacancy-detail";
import { enrichJobWithVacancy } from "@/features/jobs/lib/vacancy-to-job";
import { jobKey } from "@/features/jobs/lib/job-context";
import { useGenerateCoverLetter } from "@/features/ai-tools/hooks/use-worker-ai";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  useCreateComment,
  useDeleteComment,
  useVacancyComments,
} from "@/features/engagement/hooks/use-vacancy-engagement";
import type { JobCardData } from "@/features/chat/types/job";
import { isApiClientError } from "@/lib/api/error";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { REACTION_TYPE } from "@/interfaces/enums";
import type { VacancyComment } from "@/interfaces/engagement.interface";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

/** Lock body scroll on mobile (full-screen) only; Escape closes. */
function usePanelChrome(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onClose]);

  useEffect(() => {
    if (!active) return;
    const mobile = window.matchMedia("(max-width: 639px)");
    if (!mobile.matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

/**
 * App-wide job detail panel, mounted once in `AppShell`. A non-blocking docked
 * drawer (full-screen on mobile) — NOT a modal — so the AI-tool and apply panels
 * stack cleanly above it instead of fighting a blur overlay. Holds the full job
 * detail, company info, AI tools, comments, and the apply action. The same panel
 * serves chat results and recommendations; the worker is never shown a role's
 * source.
 */
export function JobDetailPanel() {
  const target = useJobDetailPanelStore((s) => s.target);
  if (!target) return null;
  return (
    <JobDetailContent
      key={target.vacancyId ?? jobKey(target.job)}
      initialJob={target.job}
      vacancyId={target.vacancyId}
    />
  );
}

function JobDetailContent({
  initialJob,
  vacancyId,
}: {
  initialJob: JobCardData;
  vacancyId: string | null;
}) {
  const close = useJobDetailPanelStore((s) => s.close);
  // Recommendations open thin; load the full vacancy to fill the detail in.
  const needsFetch = Boolean(vacancyId) && !initialJob.description;
  const { data: full } = useVacancyDetail(vacancyId ?? "", needsFetch);
  const job = full ? enrichJobWithVacancy(initialJob, full) : initialJob;

  return vacancyId ? (
    <InternalDetail job={job} vacancyId={vacancyId} onClose={close} />
  ) : (
    <ExternalDetail job={job} onClose={close} />
  );
}

function InternalDetail({
  job,
  vacancyId,
  onClose,
}: {
  job: JobCardData;
  vacancyId: string;
  onClose: () => void;
}) {
  const actions = useJobActions(vacancyId);
  return (
    <>
      <DetailShell
        job={job}
        vacancyId={vacancyId}
        onClose={onClose}
        engagement={<EngagementBar actions={actions} vacancyId={vacancyId} />}
        footer={<InternalFooter actions={actions} />}
      />
      <ApplyPanel
        open={actions.applyDialogOpen}
        onClose={actions.closeApplyDialog}
        job={job}
        submitting={actions.applyPending}
        onSubmit={actions.confirmApply}
      />
    </>
  );
}

function ExternalDetail({
  job,
  onClose,
}: {
  job: JobCardData;
  onClose: () => void;
}) {
  return (
    <DetailShell
      job={job}
      vacancyId={null}
      onClose={onClose}
      footer={<ExternalFooter job={job} />}
    />
  );
}

function DetailShell({
  job,
  vacancyId,
  onClose,
  engagement,
  footer,
}: {
  job: JobCardData;
  vacancyId: string | null;
  onClose: () => void;
  engagement?: React.ReactNode;
  footer: React.ReactNode;
}) {
  usePanelChrome(true, onClose);

  return (
    <div
      role="dialog"
      aria-label={`${job.title} details`}
      className="bg-background animate-in fade-in absolute inset-0 z-30 flex flex-col duration-200"
    >
      <header className="border-b">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground -ml-1.5 mb-2 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <div className="space-y-1">
            <h1 className="text-xl leading-tight font-semibold break-words">
              {job.title}
            </h1>
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
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-5 sm:px-6">
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

          {engagement}

          {vacancyId ? <CommentThread vacancyId={vacancyId} /> : null}
        </div>
      </div>

      <div className="bg-background/95 border-t backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">{footer}</div>
      </div>
    </div>
  );
}

function InternalFooter({ actions }: { actions: JobActions }) {
  return (
    <Button
      variant="brand"
      onClick={actions.applyToJob}
      disabled={actions.applyPending || actions.applied}
      className="w-full"
    >
      {actions.applyPending ? <Loader2 className="size-4 animate-spin" /> : null}
      {actions.applied ? "Applied" : "Apply"}
    </Button>
  );
}

/** Social-style action row: like / dislike / comment / save, spread evenly. */
function EngagementBar({
  actions,
  vacancyId,
}: {
  actions: JobActions;
  vacancyId: string;
}) {
  const { data } = useVacancyComments(vacancyId, true);
  const commentCount = data?.length ?? 0;

  const focusComposer = () => {
    const el = document.getElementById("job-comment-input");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLTextAreaElement | null)?.focus();
  };

  return (
    <div className="flex items-center gap-1 border-y py-1">
      <EngageButton
        icon={ThumbsUp}
        label={actions.reaction === REACTION_TYPE.LIKE ? "Liked" : "Like"}
        active={actions.reaction === REACTION_TYPE.LIKE}
        disabled={actions.reactionPending}
        onClick={() => actions.react(REACTION_TYPE.LIKE)}
      />
      <EngageButton
        icon={ThumbsDown}
        label="Dislike"
        active={actions.reaction === REACTION_TYPE.DISLIKE}
        disabled={actions.reactionPending}
        onClick={() => actions.react(REACTION_TYPE.DISLIKE)}
      />
      <EngageButton
        icon={MessageSquare}
        label={commentCount > 0 ? `Comment · ${commentCount}` : "Comment"}
        onClick={focusComposer}
      />
      <EngageButton
        icon={actions.saved ? BookmarkCheck : Bookmark}
        label={actions.saved ? "Saved" : "Save"}
        active={actions.saved}
        disabled={actions.savePending}
        onClick={actions.toggleSave}
      />
    </div>
  );
}

function EngageButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors disabled:opacity-60",
        active
          ? "text-brand bg-brand/10"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function ExternalFooter({ job }: { job: JobCardData }) {
  const href = primaryContactHref(job.contact);
  if (!href) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        No application channel was provided for this role.
      </p>
    );
  }
  return (
    <Button asChild variant="brand" className="w-full">
      <a href={href} target="_blank" rel="noreferrer">
        Apply
      </a>
    </Button>
  );
}

/** The cover-letter apply step, as a right-side panel stacked above the detail. */
function ApplyPanel({
  open,
  onClose,
  job,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  job: JobCardData;
  submitting: boolean;
  onSubmit: (coverLetter: string, shareContact: boolean) => void;
}) {
  const [draft, setDraft] = useState("");
  const [shareContact, setShareContact] = useState(false);
  const generate = useGenerateCoverLetter();
  const canGenerate = Boolean(job.description?.trim());

  usePanelChrome(open, onClose);

  if (!open) return null;

  const onGenerate = () => {
    if (generate.isPending || !canGenerate) return;
    generate.mutate(
      {
        jobDescription: job.description ?? "",
        jobTitle: job.title,
        companyName: job.company ?? undefined,
      },
      {
        onSuccess: (result) => setDraft(result.coverLetter),
        onError: (error) =>
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Couldn't generate a cover letter",
          ),
      },
    );
  };

  return (
    <aside
      role="dialog"
      aria-label={`Apply to ${job.title}`}
      className="bg-card animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l shadow-xl duration-200 sm:z-40 sm:max-w-[460px] lg:max-w-[520px]"
    >
      <header className="flex items-start gap-3 border-b p-4 sm:p-5">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="text-lg leading-tight font-semibold break-words">
            Apply to {job.title}
          </h2>
          <p className="text-muted-foreground truncate text-xs">
            {job.company
              ? `Add a cover letter for ${job.company} — or generate one with AI.`
              : "Add a cover letter — or generate one with AI."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground hover:bg-muted -mr-1 shrink-0 rounded-md p-1.5 transition-colors"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="cover-letter" className="text-sm font-medium">
            Cover letter{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={generate.isPending || !canGenerate}
          >
            {generate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generate.isPending ? "Generating…" : "Generate with AI"}
          </Button>
        </div>

        <Textarea
          id="cover-letter"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Introduce yourself and explain why you're a great fit for this role…"
          rows={10}
          maxLength={6000}
          disabled={generate.isPending}
        />
        {!canGenerate ? (
          <p className="text-muted-foreground text-xs">
            AI generation isn&apos;t available for this role — it has no
            description. You can still write your own.
          </p>
        ) : null}

        <label
          htmlFor="share-contact"
          className="bg-muted/40 flex cursor-pointer items-start gap-3 rounded-xl border p-3"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">
              Let the employer contact you directly
            </p>
            <p className="text-muted-foreground text-xs">
              Shares your email and phone with this employer so they can reach you
              outside the platform. You can leave this off and chat here instead.
            </p>
          </div>
          <Switch
            id="share-contact"
            checked={shareContact}
            onCheckedChange={setShareContact}
            disabled={generate.isPending}
            className="mt-0.5"
          />
        </label>
      </div>

      <div className="bg-background/95 flex flex-col-reverse gap-2 border-t p-4 backdrop-blur-sm sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="brand"
          onClick={() => onSubmit(draft, shareContact)}
          disabled={submitting || generate.isPending}
          className="w-full sm:w-auto"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Send application
        </Button>
      </div>
    </aside>
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

function CommentThread({ vacancyId }: { vacancyId: string }) {
  const { user } = useSession();
  const { data, isLoading } = useVacancyComments(vacancyId, true);
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
    <section className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MessageSquare className="text-muted-foreground size-4" />
        Comments
        {comments.length > 0 ? (
          <span className="text-muted-foreground font-normal">
            ({comments.length})
          </span>
        ) : null}
      </h3>

      <form onSubmit={submit} className="flex gap-2.5">
        <UserAvatar
          name={user?.name ?? "You"}
          avatarUrl={user?.avatarUrl}
          className="mt-0.5 size-8 shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <Textarea
            id="job-comment-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question or share what you know…"
            rows={2}
            maxLength={2000}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              variant="brand"
              disabled={draft.trim().length === 0 || createComment.isPending}
              className="w-full sm:w-auto"
            >
              {createComment.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Post
            </Button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          Loading comments…
        </p>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No comments yet — be the first to ask.
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
  return (
    <li className="flex gap-2.5">
      <UserAvatar
        name={comment.author.name}
        avatarUrl={comment.author.avatarUrl}
        className="size-8 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="bg-muted rounded-2xl px-3.5 py-2">
          <p className="text-sm font-semibold break-words">
            {comment.author.name}
          </p>
          <p className="text-foreground/90 text-sm break-words whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-3 px-1.5 text-xs">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          {isOwn ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="hover:text-destructive font-medium transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
