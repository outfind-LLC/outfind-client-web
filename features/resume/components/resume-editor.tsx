"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import {
  useResume,
  useGenerateResume,
  useUpdateResume,
} from "@/features/resume/hooks/use-resumes";
import { computeAts } from "@/features/resume/lib/ats";
import { useT } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type {
  ResumeDocument,
  StyleConfig,
} from "@/interfaces/resume.interface";
import { EditPanel } from "./edit-panel";
import { DesignPanel } from "./design-panel";
import { OptionsPanel } from "./options-panel";
import { PreviewPanel } from "./preview-panel";
import { Ic } from "./resume-ui";
import s from "@/features/resume/styles/resume.module.css";

interface Meta {
  isPublic: boolean;
  slug: string | null;
  showContacts: boolean;
}
type Tab = "edit" | "design" | "options";

const snap = (r: {
  name: string;
  document: ResumeDocument;
  style: StyleConfig;
}) => JSON.stringify({ name: r.name, document: r.document, style: r.style });

const TABS: { key: Tab; label: MsgKey; icon: "pen" | "sparkle" | "gear" }[] = [
  { key: "edit", label: "cv.tabEdit", icon: "pen" },
  { key: "design", label: "cv.tabDesign", icon: "sparkle" },
  { key: "options", label: "cv.tabOptions", icon: "gear" },
];
type MsgKey = "cv.tabEdit" | "cv.tabDesign" | "cv.tabOptions";

/**
 * The resume editor — mobile-first. Header carries the resume name at the very
 * top. Content is three tabs: Edit / Design / Options. Desktop shows the tabs
 * on the left with a live preview on the right; mobile switches panes via a
 * bottom tab bar (with a Preview entry). Edits autosave.
 */
export function ResumeEditor({ id }: { id: string }) {
  const t = useT();
  const query = useResume(id);
  const update = useUpdateResume(id);
  const generate = useGenerateResume(id);

  const [doc, setDoc] = useState<ResumeDocument | null>(null);
  const [style, setStyle] = useState<StyleConfig | null>(null);
  const [name, setName] = useState("");
  const [meta, setMeta] = useState<Meta>({
    isPublic: false,
    slug: null,
    showContacts: false,
  });
  const [tab, setTab] = useState<Tab>("edit");
  const [view, setView] = useState<"form" | "preview">("form");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [downloading, setDownloading] = useState(false);

  const baseline = useRef<string | null>(null);

  useEffect(() => {
    if (!query.data || baseline.current !== null) return;
    setDoc(query.data.document);
    setStyle(query.data.style);
    setName(query.data.name);
    setMeta({
      isPublic: query.data.isPublic,
      slug: query.data.slug,
      showContacts: query.data.showContacts,
    });
    baseline.current = snap(query.data);
  }, [query.data]);

  useEffect(() => {
    if (!doc || !style || baseline.current === null) return;
    const current = snap({ name, document: doc, style });
    if (current === baseline.current) return;
    setSaveState("saving");
    const handle = setTimeout(() => {
      update.mutate(
        { name, document: doc, style },
        {
          onSuccess: (saved) => {
            baseline.current = snap(saved);
            setSaveState("saved");
            setMeta({
              isPublic: saved.isPublic,
              slug: saved.slug,
              showContacts: saved.showContacts,
            });
          },
          onError: () => setSaveState("error"),
        },
      );
    }, 800);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, style, name]);

  const ats = useMemo(
    () => (doc && style ? computeAts(doc, style) : null),
    [doc, style],
  );

  if (query.isLoading || !doc || !style || !ats) {
    return (
      <div className={s.screen}>
        <div className={s.mgrScroll}>
          <div className={s.mgrWrap}>
            <div className={s.sk} />
            <div className={s.sk} />
          </div>
        </div>
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className={s.screen}>
        <div className={s.empty}>
          <div className={s.emptyT}>{t("cv.loadError")}</div>
          <button
            type="button"
            className={cn(s.btn, s.btnGhost)}
            onClick={() => void query.refetch()}
          >
            {t("cv.retry")}
          </button>
        </div>
      </div>
    );
  }

  const runGenerate = () => {
    if (generate.isPending) return;
    generate.mutate(undefined, {
      onSuccess: (saved) => {
        setDoc(saved.document);
        setStyle(saved.style);
        setName(saved.name);
        baseline.current = snap(saved);
        setSaveState("saved");
        toast.success(t("cv.generateDone"));
      },
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : t("cv.generateError"),
        ),
    });
  };

  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { downloadResumePdf } =
        await import("@/features/resume/lib/resume-pdf");
      await downloadResumePdf(doc, style, name);
    } catch {
      toast.error(t("cv.downloadError"));
    } finally {
      setDownloading(false);
    }
  };

  const patchMeta = (patch: { isPublic?: boolean; showContacts?: boolean }) =>
    update.mutate(patch, {
      onSuccess: (saved) =>
        setMeta({
          isPublic: saved.isPublic,
          slug: saved.slug,
          showContacts: saved.showContacts,
        }),
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : t("cv.updateError"),
        ),
    });

  const goTab = (next: Tab) => {
    setTab(next);
    setView("form");
  };

  const paneContent = (
    <div className={s.paneBody}>
      {tab === "edit" ? (
        <>
          <button
            type="button"
            className={cn(s.btn, s.btnGhost, s.fillBtn)}
            disabled={generate.isPending}
            onClick={runGenerate}
          >
            {generate.isPending ? (
              <span className={s.spin} />
            ) : (
              <Ic name="zap" />
            )}
            {generate.isPending ? t("cv.generating") : t("cv.generate")}
          </button>
          <EditPanel document={doc} t={t} onChange={setDoc} />
        </>
      ) : tab === "design" ? (
        <DesignPanel document={doc} style={style} t={t} onChange={setStyle} />
      ) : (
        <OptionsPanel
          style={style}
          ats={ats}
          meta={meta}
          t={t}
          onSetStyle={(patch) => setStyle({ ...style, ...patch })}
          onTogglePublic={() => patchMeta({ isPublic: !meta.isPublic })}
          onToggleContacts={() =>
            patchMeta({ showContacts: !meta.showContacts })
          }
        />
      )}
    </div>
  );

  return (
    <div className={s.screen}>
      <header className={s.ehead}>
        <Link
          href={routes.profileCv}
          className={s.iconBtn}
          aria-label={t("cv.back")}
        >
          <Ic name="back" />
        </Link>
        <input
          className={s.nameInput}
          value={name}
          maxLength={120}
          aria-label={t("cv.resumeName")}
          onChange={(e) => setName(e.target.value)}
        />
        <span className={s.saveState}>
          {saveState === "saving"
            ? t("cv.saving")
            : saveState === "error"
              ? t("cv.saveError")
              : t("cv.saved")}
        </span>
      </header>

      <div className={s.split} data-view={view}>
        <div className={s.pane}>
          <div className={s.paneTabs} role="tablist">
            {TABS.map((tb) => (
              <button
                key={tb.key}
                type="button"
                role="tab"
                aria-pressed={tab === tb.key}
                onClick={() => setTab(tb.key)}
              >
                {t(tb.label)}
              </button>
            ))}
          </div>
          {paneContent}
        </div>

        <div className={s.previewCol}>
          <PreviewPanel
            document={doc}
            style={style}
            downloading={downloading}
            t={t}
            onDownload={() => void download()}
          />
        </div>
      </div>

      <nav className={s.bottomNav}>
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            aria-pressed={view === "form" && tab === tb.key}
            onClick={() => goTab(tb.key)}
          >
            <Ic name={tb.icon} />
            {t(tb.label)}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={view === "preview"}
          onClick={() => setView("preview")}
        >
          <Ic name="eye" />
          {t("cv.tabPreview")}
        </button>
      </nav>
    </div>
  );
}
