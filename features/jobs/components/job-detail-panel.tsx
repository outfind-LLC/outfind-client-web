"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Sparkles, X } from "lucide-react";
import { Spinner } from "@/components/spinner";
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
import { isConciseSalary, type JobCardData } from "@/features/chat/types/job";
import { useT } from "@/providers/i18n-provider";
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
  const t = useT();
  const actions = useJobActions(vacancyId);

  const applySection = (
    <div className={s["jd-sec"]}>
      <h3>{t("chat.jdHowApply")}</h3>
      <p>{t("chat.jdPlatformApply")}</p>
    </div>
  );

  const footer = actions.applied ? (
    <button
      type="button"
      className={cn(s.btn, s["btn-primary"], s["btn-md"])}
      onClick={onClose}
    >
      {t("chat.done")}
    </button>
  ) : (
    <>
      <button
        type="button"
        className={cn(s.btn, s["btn-ghost"], s["btn-md"])}
        onClick={actions.toggleSave}
        disabled={actions.savePending}
      >
        {actions.saved ? t("chat.saved") : t("chat.save")}
      </button>
      <button
        type="button"
        className={cn(s.btn, s["btn-primary"], s["btn-md"])}
        onClick={actions.applyToJob}
        disabled={actions.applyPending}
      >
        {t("chat.applyCv")}
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
  const t = useT();
  const { email, phone } = job.contact;
  const fallbackHref = primaryContactHref(job.contact);

  const applySection = (
    <div className={s["jd-sec"]}>
      <h3>{t("chat.jdHowApply")}</h3>
      <p>
        {t("chat.jdOnlineApply")}
        {hasAnyContact(job.contact) ? t("chat.jdOnlineContacts") : ""}
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
      <p className={s["jd-note-warn"]}>{t("chat.jdOnlineNote")}</p>
    </div>
  );

  const footer = (
    <>
      {email ? (
        <a
          className={cn(s.btn, s["btn-ghost"], s["btn-md"])}
          href={`mailto:${email}`}
        >
          {t("chat.email")}
        </a>
      ) : null}
      {phone ? (
        <a
          className={cn(s.btn, s["btn-primary"], s["btn-md"])}
          href={`tel:${phone}`}
        >
          {t("chat.callEmployer")}
        </a>
      ) : fallbackHref ? (
        <a
          className={cn(s.btn, s["btn-primary"], s["btn-md"])}
          href={fallbackHref}
          target="_blank"
          rel="noreferrer"
        >
          {t("chat.applyExternal")}
        </a>
      ) : (
        <span className={s["jd-note"]} style={{ margin: 0 }}>
          {t("chat.jdNoChannel")}
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
  const t = useT();
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
        {t("chat.remote")}
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
            aria-label={t("chat.close")}
          >
            <Ic name="close" />
          </button>

          <div className={s["jd-body"]}>
            <span className={s["jd-src"]}>
              {isPlatform ? (
                <>
                  <ChatMark />
                  {t("chat.postedOn")}
                </>
              ) : (
                <>
                  <Ic name="globe" />
                  {t("chat.jdFoundOnline")}
                </>
              )}
            </span>

            <div className={s["jd-title"]}>
              <span>{job.title}</span>
              {isPlatform ? (
                <Ic name="verified" title={t("chat.verifiedEmployer")} />
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

            {isConciseSalary(job.salary) ? (
              <div className={s["jd-salary"]}>{job.salary}</div>
            ) : null}

            {facts.length > 0 ? (
              <div className={s["jd-facts"]}>{facts}</div>
            ) : null}

            {job.description ? (
              <div className={s["jd-sec"]}>
                <h3>{t("chat.jdAbout")}</h3>
                <p>{job.description}</p>
              </div>
            ) : null}

            {job.responsibilities.length > 0 ? (
              <div className={s["jd-sec"]}>
                <h3>{t("chat.jdDuties")}</h3>
                <ul className={s["jd-list"]}>
                  {job.responsibilities.map((item) => (
                    <li key={item}>
                      <Ic name="checkBold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.requirements.length > 0 ? (
              <div className={s["jd-sec"]}>
                <h3>{t("chat.jdReqs")}</h3>
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
                <h3>{t("chat.jdSkills")}</h3>
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
  const t = useT();
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
            isApiClientError(error) ? error.message : t("chat.coverGenError"),
          ),
      },
    );
  };

  return (
    <aside
      role="dialog"
      aria-label={t("chat.applyTo", { title: job.title })}
      className="bg-card animate-in slide-in-from-right fixed inset-y-0 right-0 z-[120] flex w-full flex-col border-l shadow-xl duration-200 sm:max-w-[460px] lg:max-w-[520px]"
    >
      <header className="flex items-start gap-3 border-b p-4 sm:p-5">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="text-lg leading-tight font-semibold break-words">
            {t("chat.applyTo", { title: job.title })}
          </h2>
          <p className="text-muted-foreground truncate text-xs">
            {job.company
              ? t("chat.coverFor", { company: job.company })
              : t("chat.coverGeneric")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("chat.close")}
          className="text-muted-foreground hover:text-foreground hover:bg-muted -mr-1 shrink-0 rounded-md p-1.5 transition-colors"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="cover-letter" className="text-sm font-medium">
            {t("chat.coverLetter")}{" "}
            <span className="text-muted-foreground font-normal">
              {t("chat.optional")}
            </span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={generate.isPending || !canGenerate}
          >
            {generate.isPending ? (
              <Spinner />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generate.isPending ? t("chat.generating") : t("chat.generateAi")}
          </Button>
        </div>

        <Textarea
          id="cover-letter"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("chat.coverPlaceholder")}
          rows={10}
          maxLength={6000}
          disabled={generate.isPending}
        />
        {!canGenerate ? (
          <p className="text-muted-foreground text-xs">{t("chat.noDescHint")}</p>
        ) : null}

        <label
          htmlFor="share-contact"
          className="bg-muted/40 flex cursor-pointer items-start gap-3 rounded-xl border p-3"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">{t("chat.shareContactTitle")}</p>
            <p className="text-muted-foreground text-xs">
              {t("chat.shareContactDesc")}
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
          {t("chat.cancel")}
        </Button>
        <Button
          type="button"
          variant="brand"
          onClick={() => onSubmit(draft, shareContact)}
          disabled={submitting || generate.isPending}
          className="w-full sm:w-auto"
        >
          {submitting ? <Spinner /> : null}
          {t("chat.sendApplication")}
        </Button>
      </div>
    </aside>
  );
}
