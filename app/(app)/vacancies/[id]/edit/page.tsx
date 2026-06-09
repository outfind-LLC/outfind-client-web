import { Briefcase } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { VacancyEditLoader } from "@/features/vacancies/components/vacancy-edit-loader";

/** Edit an owned vacancy. In Next 16 route `params` are async. */
export default async function EditVacancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Container className="py-8">
      <PageHeader
        icon={Briefcase}
        title="Edit vacancy"
        description="Update the details of this role."
      />
      <VacancyEditLoader id={id} />
    </Container>
  );
}
