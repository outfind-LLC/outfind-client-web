"use client";

import { useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";

import {
  CvDocument,
  type CvPerson,
} from "@/features/profile/components/cv-document";
import type { CandidateProfile } from "@/interfaces/candidate-profile.interface";
import { useI18n } from "@/providers/i18n-provider";
import { Button } from "@/ui/button";

interface CandidateCvOverlayProps {
  candidate: CandidateProfile;
  onClose: () => void;
}

/**
 * Full-screen CV viewer an employer opens for a candidate. Reuses the shared
 * `CvDocument` with the candidate's identity + structured résumé — view/download
 * only (no edit footer). The uploaded file, if any, downloads from the topbar.
 */
export function CandidateCvOverlay({
  candidate,
  onClose,
}: CandidateCvOverlayProps) {
  const { t } = useI18n();
  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const person: CvPerson = {
    name: candidate.name,
    profession: candidate.profession,
    email: candidate.contact?.email ?? null,
    city: candidate.currentCity,
    country: candidate.currentCountry,
  };

  return (
    <div
      className="bg-background fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t("candidates.cvAria", { name: candidate.name })}
    >
      <CvDocument
        person={person}
        data={candidate}
        topbar={
          <div className="bg-background sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeft className="size-4" />
              {t("candidates.backToCandidate")}
            </button>
            {candidate.uploadedCvLink ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-sm"
                asChild
              >
                <a
                  href={candidate.uploadedCvLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="size-4" />
                  <span className="hidden sm:inline">
                    {t("candidates.downloadFile")}
                  </span>
                </a>
              </Button>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
