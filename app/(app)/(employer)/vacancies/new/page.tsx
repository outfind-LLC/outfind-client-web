import { Briefcase } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { RequireCompanyProfile } from "@/features/vacancies/components/company-profile-gate";
import { VacancyForm } from "@/features/vacancies/components/vacancy-form";

export default function NewVacancyPage() {
  return (
    <Container className="max-w-3xl py-8">
      <PageHeader
        icon={Briefcase}
        title="New vacancy"
        description="Post a new role for candidates to find and apply to."
      />
      <RequireCompanyProfile>
        <VacancyForm />
      </RequireCompanyProfile>
    </Container>
  );
}
