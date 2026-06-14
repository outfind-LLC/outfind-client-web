import { Briefcase } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { NewVacancyButton } from "@/features/vacancies/components/company-profile-gate";
import { VacanciesList } from "@/features/vacancies/components/vacancies-list";

export default function VacanciesPage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Briefcase}
        title="Vacancies"
        description="Manage your open roles."
        actions={<NewVacancyButton />}
      />
      <VacanciesList />
    </Container>
  );
}
