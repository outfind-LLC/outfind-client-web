"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useStartJobSearch,
  type JobSearchParams,
} from "@/features/jobs/hooks/use-start-job-search";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

interface JobSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional seed values (e.g. from the worker profile). */
  defaultProfession?: string;
  defaultCity?: string;
}

/**
 * The Job Search entry modal — the app's own modal shell (same design as the
 * Account/Help modals): pick a profession and a city, submit to seed a Job
 * Finder conversation and route to its thread. The form is mounted only while
 * open so it always re-seeds from the latest defaults.
 */
export function JobSearchModal({
  open,
  onOpenChange,
  defaultProfession = "",
  defaultCity = "",
}: JobSearchModalProps) {
  const t = useT();
  const close = () => onOpenChange(false);

  // Escape closes; body scroll locks while open (matches the shared modals).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={s["modal-scrim"]}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t("chat.searchTitle")}
      >
        <div className={s["modal-head"]}>
          <div className={s["modal-title"]}>{t("chat.searchTitle")}</div>
          <button
            type="button"
            className={s["modal-close"]}
            aria-label={t("chat.cancel")}
            onClick={close}
          >
            <Ic name="close" />
          </button>
        </div>
        <JobSearchForm
          defaultProfession={defaultProfession}
          defaultCity={defaultCity}
          onClose={close}
        />
      </div>
    </div>
  );
}

function JobSearchForm({
  defaultProfession,
  defaultCity,
  onClose,
}: {
  defaultProfession: string;
  defaultCity: string;
  onClose: () => void;
}) {
  const t = useT();
  const [profession, setProfession] = useState(defaultProfession);
  const [city, setCity] = useState(defaultCity);
  const { startSearch, isPending } = useStartJobSearch();

  const canSubmit =
    profession.trim().length > 0 && city.trim().length > 0 && !isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const params: JobSearchParams = { profession, city };
    startSearch(params, (error) =>
      toast.error(
        isApiClientError(error) ? error.message : t("chat.searchError"),
      ),
    );
  };

  return (
    <form onSubmit={submit}>
      <div className={s["modal-body"]}>
        <p className={s["modal-note"]}>{t("chat.searchDesc")}</p>

        <div className={s.field}>
          <label htmlFor="job-profession">{t("chat.professionLabel")}</label>
          <input
            id="job-profession"
            value={profession}
            onChange={(event) => setProfession(event.target.value)}
            placeholder={t("chat.professionPlaceholder")}
            autoFocus
            autoComplete="off"
            maxLength={100}
          />
        </div>

        <div className={s.field}>
          <label htmlFor="job-city">{t("chat.cityLabel")}</label>
          <input
            id="job-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder={t("chat.cityPlaceholder")}
            autoComplete="off"
            maxLength={100}
          />
        </div>
      </div>

      <div className={s["modal-foot"]}>
        <button
          type="button"
          className={cn(s.btn, s["btn-ghost"], s["btn-md"])}
          onClick={onClose}
        >
          {t("chat.cancel")}
        </button>
        <button
          type="submit"
          className={cn(s.btn, s["btn-primary"], s["btn-md"])}
          disabled={!canSubmit}
        >
          <Ic name="search" />
          {isPending ? t("chat.starting") : t("chat.searchJobs")}
        </button>
      </div>
    </form>
  );
}
