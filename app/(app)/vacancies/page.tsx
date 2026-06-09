import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";

import { Container } from "@/components/container";
import { routes } from "@/config/routes";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { VacanciesList } from "@/features/vacancies/components/vacancies-list";
import { Button } from "@/ui/button";

export default function VacanciesPage() {
  return (
    <Container className="py-8">
      <PageHeader
        icon={Briefcase}
        title="Vacancies"
        description="Manage your open roles."
        actions={
          <Button asChild variant="brand" size="sm">
            <Link href={routes.vacancyNew}>
              <Plus className="size-4" />
              New vacancy
            </Link>
          </Button>
        }
      />
      <VacanciesList />
    </Container>
  );
}
