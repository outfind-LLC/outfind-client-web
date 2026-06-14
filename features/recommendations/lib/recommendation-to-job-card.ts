import type { JobCardData } from "@/features/chat/types/job";
import type {
  PublicVacancy,
  RecommendedVacancy,
} from "@/interfaces/vacancy.interface";

function joinLocation(
  city: string | null | undefined,
  country: string | null | undefined,
): string | null {
  return [city, country].filter(Boolean).join(", ") || null;
}

function formatSalary(vacancy: PublicVacancy): string | null {
  if (vacancy.salaryRaw) return vacancy.salaryRaw;
  const { salaryMin, salaryMax, currency } = vacancy;
  if (salaryMin === null && salaryMax === null) return null;
  const prefix = currency ? `${currency} ` : "";
  if (salaryMin !== null && salaryMax !== null) {
    return `${prefix}${salaryMin.toLocaleString()}–${salaryMax.toLocaleString()}`;
  }
  const value = (salaryMin ?? salaryMax) as number;
  return `${prefix}${value.toLocaleString()}`;
}

/** Compose a readable "about" block from the vacancy's structured sections. */
function buildDescription(vacancy: PublicVacancy): string | null {
  const block = (title: string, items: string[] | null): string | null =>
    items && items.length > 0
      ? `${title}:\n${items.map((item) => `• ${item}`).join("\n")}`
      : null;

  const parts = [
    block("Responsibilities", vacancy.responsibilities),
    block("Benefits", vacancy.benefits),
    block("Nice to have", vacancy.niceToHave),
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join("\n\n") : null;
}

/**
 * Map a recommended vacancy (and its full detail, once loaded) onto the shared
 * `JobCardData` shape so recommendations reuse the same detail view, AI tools,
 * and apply flow as chat results. While the full detail is still loading, the
 * thin recommendation fills the header; rich sections appear when it resolves.
 */
export function recommendationToJobCard(
  rec: RecommendedVacancy,
  full?: PublicVacancy | null,
): JobCardData {
  return {
    id: rec.id,
    title: full?.title ?? rec.title,
    company: rec.companyName ?? full?.companyName ?? null,
    location: full
      ? joinLocation(full.city, full.country)
      : joinLocation(rec.city, rec.country),
    salary: full ? formatSalary(full) : null,
    skills: full?.skillsRequired ?? [],
    isRemote: full?.isRemote ?? false,
    jobType: full?.type ?? null,
    description: full ? buildDescription(full) : null,
    requirements: full?.requirements ?? [],
    contact: {
      email: full?.hrEmail ?? null,
      phone: full?.hrPhone ?? null,
      whatsapp: full?.hrWhatsapp ?? null,
      telegram: full?.hrTelegram ?? null,
      website: null,
      contactForm: full?.applicationUrl ?? null,
    },
  };
}
