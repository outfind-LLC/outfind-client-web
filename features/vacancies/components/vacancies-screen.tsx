"use client";

import { type CSSProperties, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { ICONS, type IconName } from "@/components/icons";
import { useSession } from "@/features/auth/hooks/use-session";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import {
  useDeleteVacancy,
  useUpdateVacancyStatus,
  useVacancies,
} from "@/features/vacancies/hooks/use-vacancies";
import { useEmployerVerify } from "@/features/vacancies/hooks/use-employer-verify";
import { UnderReviewBanner } from "./under-review-banner";
import { VacancyWizard } from "./vacancy-wizard";
import { VerifyStatusModal } from "./verify-status-modal";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isApiClientError } from "@/lib/api/error";
import type { Vacancy } from "@/interfaces/vacancy.interface";
import { VACANCY_STATUS, type VacancyStatus } from "@/interfaces/enums";
import { useI18n } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import s from "@/features/vacancies/styles/vacancies.module.css";

/** Feature-local mask icon (applies this module's `.ic`, reads central glyphs). */
function Ic({ name, className }: { name: IconName; className?: string }) {
  return (
    <span
      className={cn(s.ic, className)}
      style={{ "--i": ICONS[name] } as CSSProperties}
      aria-hidden="true"
    />
  );
}

const BADGE_CLASS: Record<VacancyStatus, string> = {
  [VACANCY_STATUS.DRAFT]: s["badge-paused"],
  [VACANCY_STATUS.ACTIVE]: s["badge-active"],
  [VACANCY_STATUS.PAUSED]: s["badge-paused"],
  [VACANCY_STATUS.FILLED]: s["badge-filled"],
  [VACANCY_STATUS.EXPIRED]: s["badge-expired"],
};
const STATUS_LABEL: Record<VacancyStatus, MessageKey> = {
  [VACANCY_STATUS.DRAFT]: "company.statusDraft",
  [VACANCY_STATUS.ACTIVE]: "company.statusActive",
  [VACANCY_STATUS.PAUSED]: "company.statusPaused",
  [VACANCY_STATUS.FILLED]: "company.statusFilled",
  [VACANCY_STATUS.EXPIRED]: "company.statusExpired",
};

/**
 * Employer Vacancies screen (Image #10): full-bleed, "Company under review"
 * banner while pending, Active / Closed tabs, the "Find your ideal hire" empty
 * state, and the vacancy list. "Post a job" opens the Vacancy Wizard once the
 * company is approved; while pending it surfaces the verification status modal.
 */
export function VacanciesScreen() {
  const { t } = useI18n();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const { user } = useSession();
  const profileSet = Boolean(user?.isEmployerProfileSet);
  const { isApproved, isPending, approve } = useEmployerVerify();
  const { data, isLoading, isError } = useVacancies(undefined, profileSet);

  const [tab, setTab] = useState<"active" | "closed">("active");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingModal, setPendingModal] = useState(false);

  const vacancies = data ?? [];
  const active = vacancies.filter((v) => v.status === VACANCY_STATUS.ACTIVE);
  const closed = vacancies.filter((v) => v.status !== VACANCY_STATUS.ACTIVE);
  const shown = tab === "active" ? active : closed;

  const post = () => {
    if (isApproved) setWizardOpen(true);
    else setPendingModal(true);
  };

  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        <button
          type="button"
          className={s.menu}
          aria-label={t("applications.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s.title}>{t("vacancies.title")}</div>
        {vacancies.length > 0 ? (
          <button type="button" className={s.topPost} onClick={post}>
            <Ic name="plus" />
            <span>{t("vacancies.postJob")}</span>
          </button>
        ) : null}
      </header>

      <div className={s.scroll}>
        {isPending ? (
          <div className={s.banner}>
            <UnderReviewBanner />
          </div>
        ) : null}

        <div className={s.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "active"}
            className={cn(s.tab, tab === "active" && s.on)}
            onClick={() => setTab("active")}
          >
            {t("vacancies.tabActive")}
            <span className={s.tabCount}>{active.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "closed"}
            className={cn(s.tab, tab === "closed" && s.on)}
            onClick={() => setTab("closed")}
          >
            {t("vacancies.tabClosed")}
            <span className={s.tabCount}>{closed.length}</span>
          </button>
        </div>

        {isLoading ? (
          <div className={s.list}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={s.sk} />
            ))}
          </div>
        ) : isError ? (
          <p className={s.error}>{t("vacancies.loadError")}</p>
        ) : shown.length === 0 ? (
          <EmptyState onPost={post} t={t} />
        ) : (
          <div className={s.list}>
            {shown.map((v) => (
              <VacancyCard key={v.id} vacancy={v} />
            ))}
          </div>
        )}
      </div>

      {wizardOpen ? (
        <VacancyWizard onClose={() => setWizardOpen(false)} />
      ) : null}
      {pendingModal ? (
        <VerifyStatusModal
          kind="pending"
          onClose={() => setPendingModal(false)}
          onApprove={() => {
            approve();
            setPendingModal(false);
            toast.success(t("employerVerify.toastApproved"));
          }}
        />
      ) : null}
    </div>
  );
}

function EmptyState({
  onPost,
  t,
}: {
  onPost: () => void;
  t: (key: MessageKey) => string;
}) {
  return (
    <div className={s.empty}>
      <span className={s["empty-ic"]}>
        <Ic name="inbox" />
      </span>
      <div className={s["empty-t"]}>{t("vacancies.emptyTitle")}</div>
      <p className={s["empty-d"]}>{t("vacancies.emptyDesc")}</p>
      <button type="button" className={s["empty-cta"]} onClick={onPost}>
        <Ic name="rocket" />
        {t("vacancies.postJob")}
      </button>
    </div>
  );
}

function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const { t } = useI18n();
  const updateStatus = useUpdateVacancyStatus();
  const deleteVacancy = useDeleteVacancy();

  const location = vacancy.isRemote
    ? t("vacancies.remote")
    : [vacancy.city, vacancy.country].filter(Boolean).join(", ");

  const changeStatus = (status: VacancyStatus) => {
    if (status === vacancy.status) return;
    updateStatus.mutate(
      { id: vacancy.id, payload: { status } },
      {
        onSuccess: () => toast.success(t("vacancies.toastUpdated")),
        onError: () => toast.error(t("vacancies.toastUpdateError")),
      },
    );
  };

  const remove = () => {
    deleteVacancy.mutate(vacancy.id, {
      onSuccess: () => toast.success(t("vacancies.toastDeleted")),
      onError: (error) =>
        toast.error(
          isApiClientError(error)
            ? error.message
            : t("vacancies.toastDeleteError"),
        ),
    });
  };

  return (
    <div className={s.card}>
      <div className={s["card-top"]}>
        <div className={s["card-head"]}>
          <Link href={routes.vacancy(vacancy.id)} className={s["card-role"]}>
            {vacancy.title}
            <span className={cn(s.badge, BADGE_CLASS[vacancy.status])}>
              {t(STATUS_LABEL[vacancy.status])}
            </span>
          </Link>
          <div className={s["card-meta"]}>
            {location ? (
              <span className={s.m}>
                <Ic name="pin" />
                {location}
              </span>
            ) : null}
            {vacancy.salaryRaw ? (
              <span className={cn(s.m, s["card-pay"])}>
                {vacancy.salaryRaw}
              </span>
            ) : null}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={s.kebab}
              aria-label={t("vacancies.actions")}
            >
              <Ic name="dotsVertical" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href={routes.vacancyEdit(vacancy.id)} className="gap-2">
                {t("vacancies.edit")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("vacancies.changeStatus")}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => changeStatus(VACANCY_STATUS.ACTIVE)}
              disabled={
                updateStatus.isPending ||
                vacancy.status === VACANCY_STATUS.ACTIVE
              }
            >
              {vacancy.status === VACANCY_STATUS.DRAFT
                ? t("vacancies.publish")
                : t("vacancies.markActive")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeStatus(VACANCY_STATUS.PAUSED)}
              disabled={
                updateStatus.isPending ||
                vacancy.status === VACANCY_STATUS.PAUSED
              }
            >
              {t("vacancies.pause")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeStatus(VACANCY_STATUS.FILLED)}
              disabled={
                updateStatus.isPending ||
                vacancy.status === VACANCY_STATUS.FILLED
              }
            >
              {t("vacancies.markFilled")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={remove}
              disabled={deleteVacancy.isPending}
            >
              {t("vacancies.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={s["card-foot"]}>
        <span className={s["card-posted"]}>
          {t("vacancies.posted", {
            when: formatRelativeTime(vacancy.postedAt ?? vacancy.createdAt),
          })}
        </span>
        <Link
          href={routes.vacancyApplicants(vacancy.id)}
          className={s["card-link"]}
        >
          <Ic name="users" />
          {t("vacancies.viewApplicants")}
        </Link>
      </div>
    </div>
  );
}
