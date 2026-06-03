import { FileText } from "lucide-react";

import { Container } from "@/components/container";
import { ApplicationsList } from "@/features/applications/components/applications-list";
import { PageHeader } from "@/features/dashboard/components/page-header";

export default function ApplicationsPage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={FileText}
        title="Applications"
        description="Track the jobs you've applied to."
      />
      <ApplicationsList />
    </Container>
  );
}
