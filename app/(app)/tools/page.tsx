import { Wand2 } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { AiToolsView } from "@/features/ai-tools/components/ai-tools-view";

export default function ToolsPage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Wand2}
        title="Career Tools"
        description="Build your resume, write tailored cover letters, and analyze your job fit."
      />
      <AiToolsView />
    </Container>
  );
}
