import { Zap } from "lucide-react";

import { Container } from "@/components/container";
import { UpgradeView } from "@/features/billing/components/upgrade-view";
import { PageHeader } from "@/features/dashboard/components/page-header";

export default function UpgradePage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Zap}
        title="Upgrade your plan"
        description="Choose the plan that fits where you are."
      />
      <UpgradeView />
    </Container>
  );
}
