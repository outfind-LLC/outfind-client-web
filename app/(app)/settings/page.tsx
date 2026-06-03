import { Settings } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { SettingsView } from "@/features/settings/components/settings-view";

export default function SettingsPage() {
  return (
    <Container className="max-w-3xl py-8">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Account, subscription, and appearance."
      />
      <SettingsView />
    </Container>
  );
}
