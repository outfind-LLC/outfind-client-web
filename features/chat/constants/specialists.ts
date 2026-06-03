import {
  Compass,
  FileText,
  Globe2,
  ListChecks,
  Search,
  Sparkles,
  Target,
  UserSearch,
  type LucideIcon,
} from "lucide-react";

import {
  ACCOUNT_TYPE,
  AI_SPECIALIST,
  type AccountType,
  type AiSpecialist,
} from "@/interfaces/enums";

export interface SpecialistOption {
  value: AiSpecialist;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Worker-side specialists (first is the audience default). */
export const WORKER_SPECIALISTS: SpecialistOption[] = [
  {
    value: AI_SPECIALIST.CAREER_ASSISTANT,
    label: "Career Assistant",
    description: "General career guidance and next steps",
    icon: Compass,
  },
  {
    value: AI_SPECIALIST.CV_BUILDER,
    label: "CV Builder",
    description: "Build and tailor your CV",
    icon: FileText,
  },
  {
    value: AI_SPECIALIST.JOB_FINDER,
    label: "Job Finder",
    description: "Search and rank matching jobs",
    icon: Search,
  },
  {
    value: AI_SPECIALIST.JOB_MATCHING,
    label: "Job Matching",
    description: "Score your fit for a role",
    icon: Target,
  },
  {
    value: AI_SPECIALIST.RELOCATION_GUIDE,
    label: "Relocation Guide",
    description: "Plan working and moving abroad",
    icon: Globe2,
  },
];

/** Employer-side specialists (first is the audience default). */
export const EMPLOYER_SPECIALISTS: SpecialistOption[] = [
  {
    value: AI_SPECIALIST.RECRUITMENT_ASSISTANT,
    label: "Recruitment Assistant",
    description: "Run your hiring pipeline",
    icon: Sparkles,
  },
  {
    value: AI_SPECIALIST.VACANCY_CREATION,
    label: "Vacancy Creation",
    description: "Write sharp job posts",
    icon: ListChecks,
  },
  {
    value: AI_SPECIALIST.CANDIDATE_MATCHING,
    label: "Candidate Matching",
    description: "Rank applicants by fit",
    icon: UserSearch,
  },
];

/** Specialist options visible to a given account type. */
export function getSpecialists(accountType: AccountType): SpecialistOption[] {
  return accountType === ACCOUNT_TYPE.EMPLOYER
    ? EMPLOYER_SPECIALISTS
    : WORKER_SPECIALISTS;
}

/** The default specialist a new conversation starts on, by account type. */
export function getDefaultSpecialist(accountType: AccountType): AiSpecialist {
  return getSpecialists(accountType)[0].value;
}

/** Look up display metadata for a specialist value. */
export function findSpecialist(
  value: AiSpecialist,
): SpecialistOption | undefined {
  return [...WORKER_SPECIALISTS, ...EMPLOYER_SPECIALISTS].find(
    (option) => option.value === value,
  );
}
