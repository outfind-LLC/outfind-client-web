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

/**
 * Fallback "about" blurb when the vacancy has no AI summary. Responsibilities and
 * requirements now have their own dedicated sheet sections, so this composes only
 * the leftover structured detail (benefits, nice-to-have).
 */
function buildDescription(vacancy: PublicVacancy): string | null {
  const block = (title: string, items: string[] | null): string | null =>
    items && items.length > 0
      ? `${title}:\n${items.map((item) => `• ${item}`).join("\n")}`
      : null;

  const parts = [
    block("Benefits", vacancy.benefits),
    block("Nice to have", vacancy.niceToHave),
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join("\n\n") : null;
}

/** A light job card from a recommendation, shown instantly while full detail loads. */
export function thinJobFromRecommendation(rec: RecommendedVacancy): JobCardData {
  return {
    id: rec.id,
    title: rec.title,
    company: rec.companyName,
    location: joinLocation(rec.city, rec.country),
    salary: null,
    skills: [],
    isRemote: false,
    jobType: null,
    description: null,
    responsibilities: [],
    requirements: [],
    contact: {
      email: null,
      phone: null,
      whatsapp: null,
      telegram: null,
      website: null,
      contactForm: null,
    },
    matchScore: rec.matchScore,
    postedAt: rec.postedAt,
  };
}

/**
 * Fill in a (possibly thin) job card with the vacancy's full detail once loaded.
 * Existing values win, so a rich chat result is never clobbered; a thin
 * recommendation gets description, skills, salary, and contact filled in.
 */
export function enrichJobWithVacancy(
  job: JobCardData,
  full: PublicVacancy,
): JobCardData {
  return {
    ...job,
    title: job.title || full.title,
    company: job.company ?? full.companyName,
    location: job.location ?? joinLocation(full.city, full.country),
    salary: job.salary ?? formatSalary(full),
    skills: job.skills.length > 0 ? job.skills : full.skillsRequired,
    isRemote: job.isRemote || full.isRemote,
    jobType: job.jobType ?? full.type,
    description: job.description ?? full.description ?? buildDescription(full),
    responsibilities:
      job.responsibilities.length > 0
        ? job.responsibilities
        : (full.responsibilities ?? []),
    requirements:
      job.requirements.length > 0 ? job.requirements : (full.requirements ?? []),
    postedAt: job.postedAt ?? full.postedAt,
    contact:
      job.contact.email ||
      job.contact.phone ||
      job.contact.whatsapp ||
      job.contact.telegram ||
      job.contact.website ||
      job.contact.contactForm
        ? job.contact
        : {
            email: full.hrEmail,
            phone: full.hrPhone,
            whatsapp: full.hrWhatsapp,
            telegram: full.hrTelegram,
            website: null,
            contactForm: full.applicationUrl,
          },
  };
}
