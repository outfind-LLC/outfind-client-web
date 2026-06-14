import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/container";
import { routes } from "@/config/routes";
import { CandidateProfileView } from "@/features/applications/components/candidate-profile-view";
import { Button } from "@/ui/button";

/**
 * Employer's full candidate (ATS) view for one applicant. In Next 16 route
 * `params` are async. `[id]` is the vacancy id (kept from the parent segment),
 * `[applicationId]` the application. The rich profile loads client-side and
 * degrades gracefully, so nothing is fetched here.
 */
export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id, applicationId } = await params;

  return (
    <Container className="max-w-4xl py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={routes.vacancyApplicants(id)}>
          <ArrowLeft className="size-4" />
          Back to applicants
        </Link>
      </Button>

      <CandidateProfileView vacancyId={id} applicationId={applicationId} />
    </Container>
  );
}
