"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { ICONS, type IconName } from "@/components/icons";
import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import {
  useGenerateCv,
  useMyCv,
  useUpdateCv,
} from "@/features/cv/hooks/use-cv";
import { CvSetupForm, missingForCv } from "./cv-setup-form";
import { CvTemplateRender, cvTemplateStyles } from "../templates/cv-render";
import { useI18n } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import {
  CV_TEMPLATES,
  type CvTemplateId,
  type CvView,
} from "@/interfaces/cv.interface";
import type { MessageKey } from "@/lib/i18n/translate";
import s from "@/features/cv/styles/cv.module.css";

function Ic({ name }: { name: IconName }) {
  return (
    <span
      className={s.ic}
      style={{ "--i": ICONS[name] } as CSSProperties}
      aria-hidden="true"
    />
  );
}

const TEMPLATE_LABEL: Record<CvTemplateId, MessageKey> = {
  classic: "cv.templateClassic",
  modern: "cv.templateModern",
  compact: "cv.templateCompact",
};

/**
 * CV builder at /profile/cv — the full flow on one in-shell screen:
 * missing-profile gate → AI generation (in the worker's preferred language,
 * persisted server-side as data) → template preview → download (print) →
 * public link. Rendering is entirely frontend-owned.
 */
export function CvBuilderScreen() {
  const { t } = useI18n();
  const { isWorker } = useSession();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  const profileQuery = useWorkerProfile(Boolean(isWorker));
  const cvQuery = useMyCv(Boolean(isWorker));
  const generate = useGenerateCv();

  const loading = profileQuery.isLoading || cvQuery.isLoading;
  const failed = profileQuery.isError || cvQuery.isError;
  const profile = profileQuery.data;
  const cv = cvQuery.data ?? null;
  const gated = profile && Object.values(missingForCv(profile)).some(Boolean);

  const runGenerate = () => {
    if (generate.isPending) return;
    generate.mutate(undefined, {
      onSuccess: () => toast.success(t("cv.updatedFromProfile")),
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : t("cv.generateError"),
        ),
    });
  };

  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        <button
          type="button"
          className={s.menu}
          aria-label={t("cv.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s.title}>{t("cv.title")}</div>
        {cv ? (
          <button
            type="button"
            className={cn(s.btn, s.btnGhost)}
            onClick={() => window.print()}
          >
            <Ic name="download" />
            {t("cv.download")}
          </button>
        ) : null}
      </header>

      <div className={s.scroll}>
        <div className={s.panel}>
          {loading ? (
            <>
              <div className={s.sk} />
              <div className={s.sk} />
            </>
          ) : failed || !profile ? (
            <div className={s.error}>
              {t("cv.loadError")}{" "}
              <button
                type="button"
                className={cn(s.btn, s.btnGhost)}
                onClick={() => {
                  void profileQuery.refetch();
                  void cvQuery.refetch();
                }}
              >
                {t("cv.retry")}
              </button>
            </div>
          ) : gated ? (
            <CvSetupForm profile={profile} />
          ) : !cv ? (
            <div className={cn(s.card, s.hero)}>
              <div className={s.heroIc}>
                <Ic name="sparkle" />
              </div>
              <h2 className={s.cardTitle}>{t("cv.generateTitle")}</h2>
              <p className={s.cardDesc}>{t("cv.generateDesc")}</p>
              <button
                type="button"
                className={cn(s.btn, s.btnPrimary)}
                disabled={generate.isPending}
                onClick={runGenerate}
              >
                {generate.isPending ? <span className={s.spin} /> : null}
                {generate.isPending ? t("cv.generating") : t("cv.generateBtn")}
              </button>
            </div>
          ) : (
            <CvReady
              cv={cv}
              regenerating={generate.isPending}
              onRegenerate={runGenerate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CvReady({
  cv,
  regenerating,
  onRegenerate,
}: {
  cv: CvView;
  regenerating: boolean;
  onRegenerate: () => void;
}) {
  const { t } = useI18n();
  const update = useUpdateCv();
  const [copied, setCopied] = useState(false);

  const patch = (payload: Parameters<typeof update.mutate>[0]) =>
    update.mutate(payload, {
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : t("cv.updateError"),
        ),
    });

  const publicUrl = cv.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/cv/${cv.slug}`
    : null;

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      toast.success(t("cv.copied"));
    } catch {
      /* clipboard unavailable — the URL is still visible to select */
    }
  };

  return (
    <>
      <div className={cn(s.card, s.toolbar)}>
        <div className={s.tplChips} role="group" aria-label={t("cv.template")}>
          {CV_TEMPLATES.map((template) => (
            <button
              key={template}
              type="button"
              aria-pressed={cv.template === template}
              disabled={update.isPending}
              onClick={() => cv.template !== template && patch({ template })}
            >
              {t(TEMPLATE_LABEL[template])}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={cn(s.btn, s.btnGhost)}
          disabled={regenerating}
          onClick={onRegenerate}
        >
          {regenerating ? <span className={s.spin} /> : <Ic name="zap" />}
          {regenerating ? t("cv.generating") : t("cv.regenerate")}
        </button>
      </div>

      <div className={s.card}>
        <h2 className={s.cardTitle}>{t("cv.publicTitle")}</h2>
        <p className={s.cardDesc}>{t("cv.publicDesc")}</p>
        <div className={s.switchRow}>
          <span className={s.switchLabel}>{t("cv.publicToggle")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={cv.isPublic}
            aria-label={t("cv.publicToggle")}
            className={s.switch}
            disabled={update.isPending}
            onClick={() => patch({ isPublic: !cv.isPublic })}
          />
        </div>
        {cv.isPublic ? (
          <>
            <div className={s.switchRow}>
              <span className={s.switchLabel}>{t("cv.showContacts")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={cv.showContacts}
                aria-label={t("cv.showContacts")}
                className={s.switch}
                disabled={update.isPending}
                onClick={() => patch({ showContacts: !cv.showContacts })}
              />
            </div>
            {publicUrl ? (
              <div className={s.linkRow}>
                <span className={s.linkUrl}>{publicUrl}</span>
                <button
                  type="button"
                  className={cn(s.btn, s.btnGhost)}
                  onClick={() => void copyLink()}
                >
                  <Ic name={copied ? "checkBold" : "copy"} />
                  {copied ? t("cv.copied") : t("cv.copyLink")}
                </button>
                <a
                  className={cn(s.btn, s.btnGhost)}
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Ic name="externalLink" />
                  {t("cv.openLink")}
                </a>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className={cn(s.card, s.editHint)}>
        <span>{t("cv.editHint")}</span>
        <Link href={routes.profile}>{t("cv.editProfile")}</Link>
      </div>

      <div className={cvTemplateStyles.printRoot}>
        <CvTemplateRender template={cv.template} content={cv.content} />
      </div>
    </>
  );
}
