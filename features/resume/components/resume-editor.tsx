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
import { PreviewPanel } from "./preview-panel";
import { Ic } from "./resume-ui";
import s from "@/features/resume/styles/resume.module.css";

interface Meta {
  isPublic: boolean;
  slug: string | null;
  showContacts: boolean;
}

const snap = (r: {
  name: string;
  document: ResumeDocument;
  style: StyleConfig;
}) => JSON.stringify({ name: r.name, document: r.document, style: r.style });

/**
 * The resume editor — one screen, mobile-first. Desktop: a left-aligned split
 * (Edit/Design form on the left, live preview on the right). Mobile: a single
 * pane with a bottom tab bar (Edit / Design / Preview). Edits autosave.
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
  const [panel, setPanel] = useState<"edit" | "design">("edit");
  const [view, setView] = useState<"form" | "preview">("form");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );

  const baseline = useRef<string | null>(null);

  // Hydrate local state once from the server.
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

  // Debounced autosave whenever content/style/name change.
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

  // Sharing toggles persist immediately (independent of the content autosave).
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

  const tier = ats.score >= 80 ? "atsHi" : ats.score >= 55 ? "atsMid" : "atsLo";

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
        <button
          type="button"
          className={cn(s.atsChip, s[tier])}
          onClick={() => setView("preview")}
        >
          <span className={s.atsDot} style={{ background: "currentColor" }} />
          {ats.score}
        </button>
        <button
          type="button"
          className={s.iconBtn}
          aria-label={t("cv.generate")}
          disabled={generate.isPending}
          onClick={runGenerate}
        >
          {generate.isPending ? <span className={s.spin} /> : <Ic name="zap" />}
        </button>
      </header>

      <div className={s.split} data-view={view}>
        <div className={s.pane}>
          <div className={s.paneTabs}>
            <button
              type="button"
              aria-pressed={panel === "edit"}
              onClick={() => setPanel("edit")}
            >
              {t("cv.tabEdit")}
            </button>
            <button
              type="button"
              aria-pressed={panel === "design"}
              onClick={() => setPanel("design")}
            >
              {t("cv.tabDesign")}
            </button>
          </div>
          <div className={s.paneBody}>
            {panel === "edit" ? (
              <EditPanel document={doc} t={t} onChange={setDoc} />
            ) : (
              <DesignPanel
                document={doc}
                style={style}
                t={t}
                onChange={setStyle}
              />
            )}
          </div>
        </div>

        <div className={s.previewCol}>
          <PreviewPanel
            document={doc}
            style={style}
            name={name}
            ats={ats}
            meta={meta}
            t={t}
            onSetStyle={(patch) => setStyle({ ...style, ...patch })}
            onTogglePublic={() => patchMeta({ isPublic: !meta.isPublic })}
            onToggleContacts={() =>
              patchMeta({ showContacts: !meta.showContacts })
            }
          />
        </div>
      </div>

      <nav className={s.bottomNav}>
        <button
          type="button"
          aria-pressed={view === "form" && panel === "edit"}
          onClick={() => {
            setPanel("edit");
            setView("form");
          }}
        >
          <Ic name="pen" />
          {t("cv.tabEdit")}
        </button>
        <button
          type="button"
          aria-pressed={view === "form" && panel === "design"}
          onClick={() => {
            setPanel("design");
            setView("form");
          }}
        >
          <Ic name="sparkle" />
          {t("cv.tabDesign")}
        </button>
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
