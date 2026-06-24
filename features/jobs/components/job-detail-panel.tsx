"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import {
  hasAnyContact,
  primaryContactHref,
} from "@/features/chat/components/contact-actions";
import { useJobActions } from "@/features/jobs/hooks/use-job-actions";
import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import { useVacancyDetail } from "@/features/recommendations/hooks/use-vacancy-detail";
import { enrichJobWithVacancy } from "@/features/jobs/lib/vacancy-to-job";
import { jobKey } from "@/features/jobs/lib/job-context";
import { useGenerateCoverLetter } from "@/features/ai-tools/hooks/use-worker-ai";
import { ChatMark, Ic } from "@/features/dashboard/components/app-icons";
import type { JobCardData } from "@/features/chat/types/job";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/**
 * App-wide job detail sheet, mounted once in `AppShell`. The prototype's
 * right-side drawer over a dimmed scrim: a source pill (platform vs found
 * online), the role, salary, facts, sections, and how-to-apply. Platform
 * vacancies apply in one tap (cover-letter step); roles found online surface the
 * employer's direct contact details. Reuses the existing apply/bookmark hooks.
 */
export function JobDetailPanel() {
  const target = useJobDetailPanelStore((st) => st.target);
  if (!target) return null;
  return (
    <JobDetailSheet
      key={target.vacancyId ?? jobKey(target.job)}
      initialJob={target.job}
      vacancyId={target.vacancyId}
    />
  );
}

function JobDetailSheet({
  initialJob,
  vacancyId,
}: {
  initialJob: JobCardData;
  vacancyId: string | null;
}) {
  const storeClose = useJobDetailPanelStore((st) => st.close);
  const [show, setShow] = useState(false);

  // Play the enter transition on mount; defer the actual unmount so the exit
  // transition can run. setShow lives in a rAF/timeout callback (not the effect
  // body), so it doesn't trip the cascading-render rule.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = useCallback(() => {
    setShow(false);
    window.setTimeout(storeClose, 240);
  }, [storeClose]);

  // Escape to close + lock the page behind the sheet while it's open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [close]);

  // Recommendations open thin; load the full vacancy to fill the detail in.
  const needsFetch = Boolean(vacancyId) && !initialJob.description;
  const { data: full } = useVacancyDetail(vacancyId ?? "", needsFetch);
  const job = full ? enrichJobWithVacancy(initialJob, full) : initialJob;

  return vacancyId ? (
    <InternalSheet job={job} vacancyId={vacancyId} show={show} onClose={close} />
  ) : (
    <ExternalSheet job={job} show={show} onClose={close} />
  );
}

function InternalSheet({
  job,
  vacancyId,
  show,
  onClose,
}: {
  job: JobCardData;
  vacancyId: string;
  show: boolean;
  onClose: () => void;
}) {
  const actions = useJobActions(vacancyId);

  const applySection = (
    <div className={s["jd-sec"]}>
      <h3>How to apply</h3>
      <p>
        This role was posted on Peoplor, so you can apply in one tap — we&apos;ll
        send your CV tailored to this job.
      </p>
    </div>
  );

  const footer = actions.applied ? (
    <button
      type="button"
      className={cn(s.btn, s["btn-primary"], s["btn-md"])}
      onClick={onClose}
    >
      Done
    </button>
  ) : (
    <>
      <button
        type="button"
        className={cn(s.btn, s["btn-ghost"], s["btn-md"])}
        onClick={actions.toggleSave}
        disabled={actions.savePending}
      >
        {actions.saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        className={cn(s.btn, s["btn-primary"], s["btn-md"])}
        onClick={actions.applyToJob}
        disabled={actions.applyPending}
      >
        Apply with my CV
      </button>
    </>
  );

  return (
    <Sheet
      job={job}
      isPlatform
      show={show}
      onClose={onClose}
      applySection={applySection}
      footer={footer}
    >
      <ApplyPanel
        open={actions.applyDialogOpen}
        onClose={actions.closeApplyDialog}
        job={job}
        submitting={actions.applyPending}
        onSubmit={actions.confirmApply}
      />
    </Sheet>
  );
}

function ExternalSheet({
  job,
  show,
  onClose,
}: {
  job: JobCardData;
  show: boolean;
  onClose: () => void;
}) {
  const { email, phone } = job.contact;
  const fallbackHref = primaryContactHref(job.contact);

  const applySection = (
    <div className={s["jd-sec"]}>
      <h3>How to apply</h3>
      <p>
        Peoplor found this role online, so you apply with the employer directly.
        {hasAnyContact(job.contact) ? " Here are their contact details:" : ""}
      </p>
      {hasAnyContact(job.contact) ? (
        <div className={s["jd-contact"]} style={{ marginTop: 13 }}>
          {job.company ? (
            <div className={s["jd-crow"]}>
              <Ic name="user" />
              <span className={s.nm}>{job.company}</span>
            </div>
          ) : null}
          {phone ? (
            <div className={s["jd-crow"]}>
              <Ic name="phone" />
              <a href={`tel:${phone}`}>{phone}</a>
            </div>
          ) : null}
          {email ? (
            <div className={s["jd-crow"]}>
              <Ic name="mail" />
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          ) : null}
        </div>
      ) : null}
      <p className={s["jd-note"]}>
        Peoplor can&apos;t apply on your behalf for roles found online. Always
        verify the employer and never pay for a job or share documents before
        you&apos;re sure.
      </p>
    </div>
  );

  const footer = (
    <>
      {email ? (
        <a
          className={cn(s.btn, s["btn-ghost"], s["btn-md"])}
          href={`mailto:${email}`}
        >
          Email
        </a>
      ) : null}
      {phone ? (
        <a
          className={cn(s.btn, s["btn-primary"], s["btn-md"])}
          href={`tel:${phone}`}
        >
          Call employer
        </a>
      ) : fallbackHref ? (
        <a
          className={cn(s.btn, s["btn-primary"], s["btn-md"])}
          href={fallbackHref}
          target="_blank"
          rel="noreferrer"
        >
          Apply
        </a>
      ) : (
        <span className={s["jd-note"]} style={{ margin: 0 }}>
          No application channel was provided for this role.
        </span>
      )}
    </>
  );

  return (
    <Sheet
      job={job}
      isPlatform={false}
      show={show}
      onClose={onClose}
      applySection={applySection}
      footer={footer}
    />
  );
}

/** Presentational sheet shell shared by the platform + external variants. */
function Sheet({
  job,
  isPlatform,
  show,
  onClose,
  applySection,
  footer,
  children,
}: {
  job: JobCardData;
  isPlatform: boolean;
  show: boolean;
  onClose: () => void;
  applySection: ReactNode;
  footer: ReactNode;
  children?: ReactNode;
}) {
  const facts: ReactNode[] = [];
  if (job.location)
    facts.push(
      <span key="loc" className={s.f}>
        <Ic name="pin" />
        {job.location}
      </span>,
    );
  if (job.jobType)
    facts.push(
      <span key="type" className={s.f}>
        <Ic name="type" />
        {job.jobType}
      </span>,
    );
  if (job.isRemote)
    facts.push(
      <span key="remote" className={s.f}>
        <Ic name="globe" />
        Remote
      </span>,
    );

  return (
    <>
      <div
        className={cn(s["jd-scrim"], show && s.show)}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className={s.jd}
          role="dialog"
          aria-modal="true"
          aria-label={`${job.title} details`}
        >
          <button
            type="button"
            className={s["jd-close"]}
            onClick={onClose}
            aria-label="Close"
          >
            <Ic name="close" />
          </button>

          <div className={s["jd-body"]}>
            <span className={s["jd-src"]}>
              {isPlatform ? (
                <>
                  <ChatMark />
                  Posted on Peoplor
                </>
              ) : (
                <>
                  <Ic name="globe" />
                  Found online by Peoplor AI
                </>
              )}
            </span>

            <div className={s["jd-title"]}>
              <span>{job.title}</span>
              {isPlatform ? (
                <Ic name="verified" title="Verified employer" />
              ) : null}
            </div>

            {job.company || job.location ? (
              <div className={s["jd-co"]}>
                {job.company ? <span>{job.company}</span> : null}
                {job.company && job.location ? (
                  <span className={s.dotsep} />
                ) : null}
                {job.location ? <span>{job.location}</span> : null}
              </div>
            ) : null}

            {job.salary ? <div className={s["jd-salary"]}>{job.salary}</div> : null}

            {facts.length > 0 ? (
              <div className={s["jd-facts"]}>{facts}</div>
            ) : null}

            {job.description ? (
              <div className={s["jd-sec"]}>
                <h3>About this role</h3>
                <p>{job.description}</p>
              </div>
            ) : null}

            {job.requirements.length > 0 ? (
              <div className={s["jd-sec"]}>
                <h3>What you&apos;ll need</h3>
                <ul className={s["jd-list"]}>
                  {job.requirements.map((item) => (
                    <li key={item}>
                      <Ic name="checkBold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.skills.length > 0 ? (
              <div className={s["jd-sec"]}>
                <h3>Skills</h3>
                <div className={s["jd-skills"]}>
                  {job.skills.map((skill) => (
                    <span key={skill} className={s.tag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {applySection}
          </div>

          <div className={s["jd-foot"]}>{footer}</div>
        </div>
      </div>
      {children}
    </>
  );
}

/** The cover-letter apply step, as a right-side panel stacked above the sheet. */
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

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
      className="bg-card animate-in slide-in-from-right fixed inset-y-0 right-0 z-[120] flex w-full flex-col border-l shadow-xl duration-200 sm:max-w-[460px] lg:max-w-[520px]"
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
