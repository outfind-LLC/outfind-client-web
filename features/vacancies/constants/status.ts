import { VACANCY_STATUS, type VacancyStatus } from "@/interfaces/enums";

type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "brand";

interface StatusMeta {
  label: string;
  variant: BadgeVariant;
}

/** Display label + badge variant for each vacancy status. */
export const VACANCY_STATUS_META: Record<VacancyStatus, StatusMeta> = {
  [VACANCY_STATUS.ACTIVE]: { label: "Active", variant: "success" },
  [VACANCY_STATUS.PAUSED]: { label: "Paused", variant: "warning" },
  [VACANCY_STATUS.FILLED]: { label: "Filled", variant: "secondary" },
  [VACANCY_STATUS.EXPIRED]: { label: "Expired", variant: "outline" },
};

export const VACANCY_STATUS_ORDER: VacancyStatus[] = [
  VACANCY_STATUS.ACTIVE,
  VACANCY_STATUS.PAUSED,
  VACANCY_STATUS.FILLED,
  VACANCY_STATUS.EXPIRED,
];
