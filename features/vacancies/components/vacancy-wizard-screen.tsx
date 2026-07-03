"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { useEmployerVerify } from "@/features/vacancies/hooks/use-employer-verify";
import { VacancyWizard } from "@/features/vacancies/components/vacancy-wizard";

/**
 * `/vacancies/new` — the Create-vacancy wizard as a normal in-shell screen:
 * it fills the main content area while the app sidebar stays visible (per the
 * design). Unverified employers are bounced back to the Vacancies screen,
 * which owns the verification gate UI.
 */
export function VacancyWizardScreen() {
  const router = useRouter();
  const { status, isApproved } = useEmployerVerify();

  useEffect(() => {
    if (status !== "loading" && !isApproved) {
      router.replace(routes.vacancies);
    }
  }, [status, isApproved, router]);

  if (!isApproved) return null;
  return <VacancyWizard onClose={() => router.push(routes.vacancies)} />;
}
