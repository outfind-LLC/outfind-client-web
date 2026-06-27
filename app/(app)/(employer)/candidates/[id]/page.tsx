import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { Container } from "@/components/container";
import { routes } from "@/config/routes";
import { ApplicantsList } from "@/features/applications/components/applicants-list";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { serverApiFetch } from "@/lib/api/server";
import type { Vacancy } from "@/interfaces/vacancy.interface";
import { Button } from "@/ui/button";

/** Applicants for one vacancy. The title is resolved server-side; a failure
 * (e.g. not found) falls back to a generic header rather than erroring. */
export default async function VacancyApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let title = "Applicants";
  try {
    const vacancy = await serverApiFetch<Vacancy>(`/employer/vacancies/${id}`);
    title = vacancy.title;
  } catch {
    // Keep the generic title; the list below surfaces any access error.
  }

  return (
    <Container className="py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={routes.vacancies}>
          <ArrowLeft className="size-4" />
          All vacancies
        </Link>
      </Button>

      <PageHeader
        icon={Users}
        title={title}
        description="Candidates ranked by fit. Move them through your pipeline."
      />
      <ApplicantsList vacancyId={id} />
    </Container>
  );
}
