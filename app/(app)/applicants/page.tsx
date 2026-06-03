import { Users } from "lucide-react";

import { Container } from "@/components/container";
import { ApplicantVacancyPicker } from "@/features/applications/components/applicant-vacancy-picker";
import { PageHeader } from "@/features/dashboard/components/page-header";

export default function ApplicantsPage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Users}
        title="Applicants"
        description="Choose a vacancy to review and triage its candidates."
      />
      <ApplicantVacancyPicker />
    </Container>
  );
}
