"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useStartJobSearch,
  type JobSearchParams,
} from "@/features/jobs/hooks/use-start-job-search";
import { handleFeatureLockedError } from "@/features/billing/lib/feature-locked";
import { useUpgradeProStore } from "@/features/billing/store/upgrade-pro.store";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import s from "@/features/jobs/styles/job-search-modal.module.css";

interface JobSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional seed values (e.g. from the worker profile). */
  defaultProfession?: string;
  defaultCity?: string;
}

/**
 * The Job Search entry modal — the app's bottom-sheet design system (same
 * shell as the CV wizard / upgrade modals): pick a profession and a city,
 * submit to seed a Job Finder conversation and route to its thread. The form
 * is mounted only while open so it always re-seeds from the latest defaults.
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
      className={s.scrim}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t("chat.searchTitle")}
      >
        <div className={s.head}>
          <button
            type="button"
            className={s.iconBtn}
            aria-label={t("chat.cancel")}
            onClick={close}
          >
            <Ic name="close" />
          </button>
        </div>

        <div className={s.badge}>
          <Ic name="search" className={s.badgeIc} />
        </div>
        <div className={s.intro}>
          <h2 className={s.title}>{t("chat.searchTitle")}</h2>
          <p className={s.subtitle}>{t("chat.searchDesc")}</p>
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
  const openUpgrade = useUpgradeProStore((st) => st.openModal);

  const canSubmit =
    profession.trim().length > 0 && city.trim().length > 0 && !isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const params: JobSearchParams = { profession, city };
    startSearch(params, (error) => {
      // 403 FEATURE_LOCKED / LIMIT_REACHED → swap this modal for the upsell.
      if (handleFeatureLockedError(error, openUpgrade, "ai_job_search")) {
        onClose();
        return;
      }
      toast.error(
        isApiClientError(error) ? error.message : t("chat.searchError"),
      );
    });
  };

  return (
    <form onSubmit={submit} className={s.form}>
      <div className={s.body}>
        <div className={s.fields}>
          <div className={s.field}>
            <label className={s.label} htmlFor="job-profession">
              {t("chat.professionLabel")}
            </label>
            <input
              id="job-profession"
              className={s.input}
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              placeholder={t("chat.professionPlaceholder")}
              autoFocus
              autoComplete="off"
              maxLength={100}
            />
          </div>

          <div className={s.field}>
            <label className={s.label} htmlFor="job-city">
              {t("chat.cityLabel")}
            </label>
            <input
              id="job-city"
              className={s.input}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={t("chat.cityPlaceholder")}
              autoComplete="off"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      <div className={s.foot}>
        <button type="submit" className={s.cta} disabled={!canSubmit}>
          <Ic name="search" className={s.ctaIc} />
          {isPending ? t("chat.starting") : t("chat.searchJobs")}
        </button>
        <button type="button" className={s.ghost} onClick={onClose}>
          {t("chat.cancel")}
        </button>
      </div>
    </form>
  );
}
