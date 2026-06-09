import { Building2 } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { EmployerProfileFormLoader } from "@/features/profile/components/employer-profile-form-loader";

export default function CompanyProfilePage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Building2}
        title="Company profile"
        description="Manage how your company appears to candidates."
      />
      <EmployerProfileFormLoader />
    </Container>
  );
}
