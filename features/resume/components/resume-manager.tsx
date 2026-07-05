"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/config/query-keys";
import { routes } from "@/config/routes";
import { resumeService } from "@/features/resume/services/resume.service";
import {
  useDeleteResume,
  useDuplicateResume,
  useResumes,
} from "@/features/resume/hooks/use-resumes";
import { useCvWizardStore } from "@/features/resume/store/cv-wizard.store";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useSession } from "@/features/auth/hooks/use-session";
import { formatRelativeTime } from "@/lib/format";
import { useT } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type { ResumeView } from "@/interfaces/resume.interface";
import { ResumeRender } from "@/features/resume/templates/resume-render";
import { Ic } from "./resume-ui";
import s from "@/features/resume/styles/resume.module.css";

/** Resume manager at /profile/cv — create, open, rename, duplicate, delete. */
export function ResumeManager() {
  const t = useT();
  const { isWorker } = useSession();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  const query = useResumes(Boolean(isWorker));
  const openCvWizard = useCvWizardStore((st) => st.openModal);

  const resumes = query.data ?? [];

  return (
    <div className={s.screen}>
      <header className={s.mgrTop}>
        <button
          type="button"
          className={s.iconBtn + " " + s.menu}
          aria-label={t("cv.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s.mgrTitle}>{t("cv.title")}</div>
      </header>

      <div className={s.mgrScroll}>
        <div className={s.mgrWrap}>
          <div className={s.createRow}>
            <button
              type="button"
              className={s.createCard}
              onClick={openCvWizard}
            >
              <span className={s.createIc}>
                <Ic name="plusBold" />
              </span>
              <span>
                <span className={s.createT}>{t("cv.wizardCardTitle")}</span>
                <span className={s.createD}>{t("cv.wizardCardDesc")}</span>
              </span>
            </button>
          </div>

          {query.isLoading ? (
            <div className={s.grid}>
              <div className={s.sk} />
              <div className={s.sk} />
            </div>
          ) : query.isError ? (
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
          ) : resumes.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyT}>{t("cv.empty")}</div>
              <p>{t("cv.emptyDesc")}</p>
            </div>
          ) : (
            <div className={s.grid}>
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} t={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumeCard({
  resume,
  t,
}: {
  resume: ResumeView;
  t: ReturnType<typeof useT>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const duplicate = useDuplicateResume();
  const remove = useDeleteResume();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(resume.name);
  const [confirming, setConfirming] = useState(false);

  const rename = useMutation({
    mutationFn: (value: string) =>
      resumeService.update(resume.id, { name: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.resumes }),
  });

  const open = () => router.push(routes.resumeEditor(resume.id));

  const saveName = () => {
    setRenaming(false);
    const value = name.trim();
    if (value && value !== resume.name) rename.mutate(value);
    else setName(resume.name);
  };

  return (
    <div className={s.rcard}>
      <button
        type="button"
        className={s.rthumb}
        aria-label={t("cv.open")}
        onClick={open}
      >
        {resume.isPublic ? (
          <span className={s.rpublic}>{t("cv.publicBadge")}</span>
        ) : null}
        <div className={s.rthumbInner}>
          <ResumeRender document={resume.document} style={resume.style} />
        </div>
      </button>
      <div className={s.rmeta}>
        <div className={s.rinfo}>
          {renaming ? (
            <input
              className={s.nameInput}
              value={name}
              autoFocus
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
            />
          ) : (
            <div className={s.rname}>{resume.name}</div>
          )}
          <div className={s.rwhen}>
            {confirming
              ? t("cv.deleteConfirm")
              : t("cv.updatedWhen", {
                  when: formatRelativeTime(resume.updatedAt),
                })}
          </div>
        </div>
        {confirming ? (
          <>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.delete")}
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(resume.id, {
                  onError: (error) =>
                    toast.error(
                      isApiClientError(error)
                        ? error.message
                        : t("cv.deleteError"),
                    ),
                })
              }
            >
              <Ic name="checkBold" />
            </button>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.retry")}
              onClick={() => setConfirming(false)}
            >
              <Ic name="close" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.rename")}
              onClick={() => setRenaming(true)}
            >
              <Ic name="pen" />
            </button>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.duplicate")}
              disabled={duplicate.isPending}
              onClick={() =>
                duplicate.mutate(resume.id, {
                  onError: (error) =>
                    toast.error(
                      isApiClientError(error)
                        ? error.message
                        : t("cv.duplicateError"),
                    ),
                })
              }
            >
              <Ic name="copy" />
            </button>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.delete")}
              onClick={() => setConfirming(true)}
            >
              <Ic name="trash" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
