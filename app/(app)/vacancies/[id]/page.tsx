import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/container";
import { routes } from "@/config/routes";
import { VacancyDetail } from "@/features/vacancies/components/vacancy-detail";

/** Employer vacancy detail + management. In Next 16 route `params` are async. */
export default async function VacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Container className="py-8">
      <Link
        href={routes.vacancies}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="size-4" />
        All vacancies
      </Link>
      <VacancyDetail vacancyId={id} />
    </Container>
  );
}
