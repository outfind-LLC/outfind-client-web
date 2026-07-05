"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useStartJobSearch } from "@/features/jobs/hooks/use-start-job-search";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/translate";

import { Flag } from "@/features/visa/components/flag";
import { pickLoc } from "@/features/visa/lib/localized";
import { useVisaModalStore } from "@/features/visa/store/visa-modal.store";
import {
  useSetVisaDocumentCheck,
  useVisaChecklist,
  useVisaPreference,
} from "@/features/visa/hooks/use-visa";
import type { VisaDocTag, VisaDocument, VisaSection } from "@/features/visa/types";
import s from "@/features/visa/styles/visa-checklist.module.css";

type Locale = "en" | "ru" | "uz";
type TFn = (key: MessageKey, params?: Record<string, string | number>) => string;

const TAG_LABEL: Record<VisaDocTag, MessageKey> = {
  REQUIRED: "visa.tagRequired",
  ONSITE: "visa.tagOnsite",
  IMPORTANT_2026: "visa.tagImportant2026",
  RECOMMENDED: "visa.tagRecommended",
  PAYABLE: "visa.tagPayable",
};

/**
 * Visa work-visa checklist — the full-screen `/visa` view (worker only; the
 * (worker) group layout guards the audience and this route is full-bleed so it
 * owns its header). Reads the saved citizenship → destination → profession
 * preference, then loads that destination's localized, freemium-gated checklist.
 * With no saved destination it opens the onboarding modal over an empty state;
 * the "Change" button reopens that modal to re-pick the route.
 */
export function VisaScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const openModal = useVisaModalStore((st) => st.openModal);

  const preference = useVisaPreference(true);
  const destinationId = preference.data?.destination?.id ?? null;
  const checklist = useVisaChecklist(destinationId, Boolean(destinationId));
  const setCheck = useSetVisaDocumentCheck(destinationId ?? "");
  const startJobSearch = useStartJobSearch();

  const [expanded, setExpanded] = useState<string | null>(null);

  // Once the preference resolves without a destination, open the onboarding
  // modal over the empty state so the user can pick a route.
  useEffect(() => {
    if (!preference.isLoading && !destinationId) openModal();
  }, [preference.isLoading, destinationId, openModal]);

  // Expand the first free section by default (once per destination).
  const initDest = useRef<string | null>(null);
  useEffect(() => {
    if (!destinationId || !checklist.data) return;
    if (initDest.current === destinationId) return;
    initDest.current = destinationId;
    setExpanded(checklist.data.sections.find((sec) => !sec.locked)?.id ?? null);
  }, [destinationId, checklist.data]);

  const data = checklist.data ?? null;
  // `detail` carries the checklist-only fields (official source, lastUpdated);
  // `summary` is enough for the header title before the checklist has loaded.
  const detail = data?.destination ?? null;
  const summary = detail ?? preference.data?.destination ?? null;
  const citizenship = preference.data?.citizenship ?? null;
  const profession = preference.data?.profession ?? null;

  const headerTitle = summary
    ? t("visa.checklistTitle", { country: pickLoc(summary.name, locale) })
    : t("visa.title");

  const onFindJob = () => {
    if (!profession || !summary) return;
    startJobSearch.startSearch(
      {
        profession: profession.name.en,
        city: summary.name.en,
        visaSponsorship: true,
      },
      (err) =>
        toast.error(err instanceof Error ? err.message : t("visa.loadError")),
    );
  };

  const onToggleDoc = (doc: VisaDocument) => {
    if (!destinationId) return;
    setCheck.mutate({ documentId: doc.id, checked: !doc.checked });
  };

  const percent =
    data && data.progress.total > 0
      ? Math.round((data.progress.ready / data.progress.total) * 100)
      : 0;

  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        <button
          type="button"
          className={s.menuBtn}
          aria-label={t("visa.title")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s.title}>{headerTitle}</div>
        <button
          type="button"
          className={s.closeBtn}
          aria-label={t("visa.close")}
          onClick={() => router.push(routes.jobs)}
        >
          <Ic name="close" />
        </button>
      </header>

      <div className={s.body}>
        <div className={s.wrap}>
          {preference.isLoading ? (
            <div className={s.state}>{t("visa.loading")}</div>
          ) : !destinationId ? (
            <div className={s.empty}>{t("visa.step2Subtitle")}</div>
          ) : checklist.isLoading ? (
            <div className={s.state}>{t("visa.loading")}</div>
          ) : checklist.isError || !data || !detail ? (
            <div className={s.state}>
              <p>{t("visa.loadError")}</p>
              <button
                type="button"
                className={s.retry}
                onClick={() => checklist.refetch()}
              >
                {t("visa.retry")}
              </button>
            </div>
          ) : (
            <>
              {/* Hero: route + change */}
              <div className={s.hero}>
                <div className={s.heroTop}>
                  <span className={s.heroFlags}>
                    <Flag
                      code={citizenship?.code ?? ""}
                      emoji={citizenship?.flag}
                      size={40}
                    />
                    <Flag
                      code={detail.code}
                      emoji={detail.flag}
                      size={40}
                    />
                  </span>
                  <div className={s.heroText}>
                    <div className={s.route}>
                      {(citizenship ? pickLoc(citizenship.name, locale) : "") +
                        " → " +
                        pickLoc(detail.name, locale)}
                    </div>
                    <div className={s.routeSub}>
                      {[
                        profession ? pickLoc(profession.name, locale) : null,
                        t("visa.workVisaChecklist"),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={s.changeBtn}
                    onClick={() => openModal()}
                  >
                    {t("visa.change")}
                  </button>
                </div>

                {/* Job-offer banner */}
                <div className={s.banner}>
                  <span className={s.bannerIcon}>
                    <Ic name="briefcase" />
                  </span>
                  <div className={s.bannerMain}>
                    <div className={s.bannerTitle}>{t("visa.jobOfferTitle")}</div>
                    <p className={s.bannerDesc}>{t("visa.jobOfferDesc")}</p>
                  </div>
                  <button
                    type="button"
                    className={s.bannerBtn}
                    onClick={onFindJob}
                    disabled={startJobSearch.isPending}
                  >
                    {t("visa.findJob")}
                  </button>
                </div>

                {/* Progress */}
                <div className={s.progress}>
                  <ProgressRing percent={percent} />
                  <div className={s.progressInfo}>
                    <div className={s.progressLabel}>
                      {t("visa.docsReady", {
                        ready: data.progress.ready,
                        total: data.progress.total,
                      })}
                    </div>
                    <div className={s.progressTrack}>
                      <span
                        className={s.progressFill}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Official source */}
                {detail.officialSourceUrl ? (
                  <p className={s.verify}>
                    <Ic name="globe" />
                    <span>
                      {t("visa.verifyOfficial", {
                        country: pickLoc(detail.name, locale),
                      })}{" "}
                      <a
                        href={detail.officialSourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={s.verifyLink}
                      >
                        {detail.officialSourceName
                          ? pickLoc(detail.officialSourceName, locale)
                          : detail.officialSourceUrl.replace(
                              /^https?:\/\//,
                              "",
                            )}
                      </a>
                    </span>
                  </p>
                ) : null}
              </div>

              {/* Categories */}
              <div className={s.cats}>
                {data.sections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    t={t}
                    locale={locale}
                    expanded={expanded === section.id}
                    onToggle={() =>
                      setExpanded((cur) =>
                        cur === section.id ? null : section.id,
                      )
                    }
                    onToggleDoc={onToggleDoc}
                  />
                ))}
              </div>

              {/* Job sites */}
              {data.jobSites.length > 0 ? (
                <div className={s.jobSites}>
                  <div className={s.jobSitesTitle}>{t("visa.jobSitesTitle")}</div>
                  <div className={s.jobSitesList}>
                    {data.jobSites.map((site) => (
                      <a
                        key={site.id}
                        href={site.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={s.jobSite}
                      >
                        <span>{site.name}</span>
                        <Ic name="externalLink" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Disclaimer */}
              <p className={s.disclaimer}>
                {pickLoc(data.disclaimer, locale)}
                {detail.lastUpdated
                  ? ` ${t("visa.lastUpdated", { date: detail.lastUpdated })}`
                  : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionRow({
  section,
  t,
  locale,
  expanded,
  onToggle,
  onToggleDoc,
}: {
  section: VisaSection;
  t: TFn;
  locale: Locale;
  expanded: boolean;
  onToggle: () => void;
  onToggleDoc: (doc: VisaDocument) => void;
}) {
  const ready = section.documents.filter((d) => d.checked).length;
  const isOpen = expanded && !section.locked;

  const onHeaderClick = () => {
    if (section.locked) {
      toast.message(t("visa.lockedToast"));
      return;
    }
    onToggle();
  };

  return (
    <div className={cn(s.cat, section.locked && s.catLocked)}>
      <button type="button" className={s.catHead} onClick={onHeaderClick}>
        <span className={s.catIcon}>{section.icon ?? "📄"}</span>
        <span className={s.catMain}>
          <span className={s.catName}>{pickLoc(section.title, locale)}</span>
          <span className={s.catCount}>
            {section.locked ? (
              t("visa.documentsCount", { count: section.documentsCount })
            ) : ready > 0 ? (
              <b>
                {t("visa.sectionReady", {
                  ready,
                  total: section.documentsCount,
                })}
              </b>
            ) : (
              t("visa.documentsCount", { count: section.documentsCount })
            )}
          </span>
        </span>
        {section.locked ? (
          <span className={s.catRight}>
            <span className={s.badgeImportant}>{t("visa.importantBadge")}</span>
            <Ic name="lock" />
          </span>
        ) : (
          <span className={s.catRight}>
            {section.access === "FREE" ? (
              <span className={s.badgeFree}>{t("visa.freeBadge")}</span>
            ) : null}
            <Ic name={isOpen ? "chevronUp" : "chevronDown"} />
          </span>
        )}
      </button>

      {isOpen ? (
        <div className={s.docs}>
          {section.documents.map((doc) => (
            <div key={doc.id} className={s.doc}>
              <button
                type="button"
                className={cn(s.check, doc.checked && s.checkOn)}
                aria-pressed={doc.checked}
                aria-label={pickLoc(doc.title, locale)}
                onClick={() => onToggleDoc(doc)}
              >
                {doc.checked ? <Ic name="checkBold" /> : null}
              </button>
              <div className={s.docText}>
                <div className={s.docTitleRow}>
                  <span className={cn(s.docTitle, doc.checked && s.docDone)}>
                    {pickLoc(doc.title, locale)}
                  </span>
                  <span
                    className={cn(s.tag, s[`tag_${doc.tag}` as keyof typeof s])}
                  >
                    {t(TAG_LABEL[doc.tag])}
                  </span>
                </div>
                {doc.description ? (
                  <p className={s.docDesc}>{pickLoc(doc.description, locale)}</p>
                ) : null}
                {doc.tip ? (
                  <p className={s.docTip}>💡 {pickLoc(doc.tip, locale)}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 15;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg className={s.ring} viewBox="0 0 36 36" aria-hidden="true">
      <circle className={s.ringTrack} cx="18" cy="18" r={r} />
      <circle
        className={s.ringFill}
        cx="18"
        cy="18"
        r={r}
        style={{ strokeDasharray: circ, strokeDashoffset: offset }}
      />
      <text className={s.ringText} x="18" y="19">
        {percent}%
      </text>
    </svg>
  );
}
