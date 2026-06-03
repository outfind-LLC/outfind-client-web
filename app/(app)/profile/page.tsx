import { UserRound } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { ProfileView } from "@/features/profile/components/profile-view";

export default function ProfilePage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={UserRound}
        title="Profile"
        description="How you appear across Jobsterr."
      />
      <ProfileView />
    </Container>
  );
}
