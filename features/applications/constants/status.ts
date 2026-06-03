import { APPLICATION_STATUS, type ApplicationStatus } from "@/interfaces/enums";

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

/** Display label + badge variant for each application status. */
export const APPLICATION_STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  [APPLICATION_STATUS.SAVED]: { label: "Saved", variant: "secondary" },
  [APPLICATION_STATUS.SENT]: { label: "Sent", variant: "brand" },
  [APPLICATION_STATUS.VIEWED]: { label: "Viewed", variant: "warning" },
  [APPLICATION_STATUS.REJECTED]: { label: "Rejected", variant: "destructive" },
  [APPLICATION_STATUS.ACCEPTED]: { label: "Accepted", variant: "success" },
};

/** Ordered statuses for filter tabs (plus an implicit "all"). */
export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  APPLICATION_STATUS.SENT,
  APPLICATION_STATUS.VIEWED,
  APPLICATION_STATUS.ACCEPTED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.SAVED,
];
