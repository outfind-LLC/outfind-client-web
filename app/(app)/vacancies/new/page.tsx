import { Briefcase } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { VacancyForm } from "@/features/vacancies/components/vacancy-form";

export default function NewVacancyPage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Briefcase}
        title="New vacancy"
        description="Post a new role for candidates to find and apply to."
      />
      <VacancyForm />
    </Container>
  );
}
