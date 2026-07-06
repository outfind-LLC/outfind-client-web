/**
 * Frontend mirror of the backend Prisma enums (`prisma/enums.prisma`).
 * Kept as `as const` objects + union types so they double as runtime values
 * (labels, selects) and compile-time types. Never redefine ad-hoc string unions
 * elsewhere — import from here.
 */

export const ACCOUNT_TYPE = {
  WORKER: "WORKER",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN",
} as const;
export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export const AUTH_PROVIDER = {
  GOOGLE: "GOOGLE",
  TELEGRAM: "TELEGRAM",
  CREDENTIALS: "CREDENTIALS",
} as const;
export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

export const APP_LANGUAGE = {
  UZ: "UZ",
  RU: "RU",
  EN: "EN",
} as const;
export type AppLanguage = (typeof APP_LANGUAGE)[keyof typeof APP_LANGUAGE];

export const PLAN_AUDIENCE = {
  WORKER: "WORKER",
  EMPLOYER: "EMPLOYER",
} as const;
export type PlanAudience = (typeof PLAN_AUDIENCE)[keyof typeof PLAN_AUDIENCE];

export const PLAN_TYPE = {
  FREE: "FREE",
  // The single paid worker plan (one-time $5). Mirrors the backend enum value.
  STANDARD: "STANDARD",
  PREMIUM: "PREMIUM",
  EMPLOYER_FREE: "EMPLOYER_FREE",
  EMPLOYER_STARTER: "EMPLOYER_STARTER",
  EMPLOYER_BUSINESS: "EMPLOYER_BUSINESS",
  EMPLOYER_ENTERPRISE: "EMPLOYER_ENTERPRISE",
} as const;
export type PlanType = (typeof PLAN_TYPE)[keyof typeof PLAN_TYPE];

export const MODEL_TIER = {
  FREE: "FREE",
  PRO: "PRO",
  PREMIUM: "PREMIUM",
} as const;
export type ModelTier = (typeof MODEL_TIER)[keyof typeof MODEL_TIER];

export const FEATURE_TYPE = {
  METERED: "METERED",
  BOOLEAN: "BOOLEAN",
  TIERED: "TIERED",
} as const;
export type FeatureType = (typeof FEATURE_TYPE)[keyof typeof FEATURE_TYPE];

export const ENTITLEMENT_PERIOD = {
  DAY: "DAY",
  MONTH: "MONTH",
  BILLING_PERIOD: "BILLING_PERIOD",
  LIFETIME: "LIFETIME",
} as const;
export type EntitlementPeriod =
  (typeof ENTITLEMENT_PERIOD)[keyof typeof ENTITLEMENT_PERIOD];

export const BILLING_INTERVAL = {
  MONTH: "MONTH",
  YEAR: "YEAR",
} as const;
export type BillingInterval =
  (typeof BILLING_INTERVAL)[keyof typeof BILLING_INTERVAL];

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  PAST_DUE: "PAST_DUE",
  TRIALING: "TRIALING",
  EXPIRED: "EXPIRED",
} as const;
export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const AI_AUDIENCE = {
  WORKER: "WORKER",
  EMPLOYER: "EMPLOYER",
} as const;
export type AiAudience = (typeof AI_AUDIENCE)[keyof typeof AI_AUDIENCE];

export const AI_SPECIALIST = {
  CAREER_ASSISTANT: "CAREER_ASSISTANT",
  CV_BUILDER: "CV_BUILDER",
  JOB_FINDER: "JOB_FINDER",
  JOB_MATCHING: "JOB_MATCHING",
  RELOCATION_GUIDE: "RELOCATION_GUIDE",
  RECRUITMENT_ASSISTANT: "RECRUITMENT_ASSISTANT",
  VACANCY_CREATION: "VACANCY_CREATION",
  CANDIDATE_MATCHING: "CANDIDATE_MATCHING",
} as const;
export type AiSpecialist = (typeof AI_SPECIALIST)[keyof typeof AI_SPECIALIST];

export const CONVERSATION_ROLE = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
  SYSTEM: "SYSTEM",
} as const;
export type ConversationRole =
  (typeof CONVERSATION_ROLE)[keyof typeof CONVERSATION_ROLE];

export const CONVERSATION_INTENT = {
  ONBOARDING: "ONBOARDING",
  JOB_SEARCH: "JOB_SEARCH",
  CV_BUILD: "CV_BUILD",
  APPLY: "APPLY",
  COMPARE: "COMPARE",
  ADVISE: "ADVISE",
  GENERAL: "GENERAL",
} as const;
export type ConversationIntent =
  (typeof CONVERSATION_INTENT)[keyof typeof CONVERSATION_INTENT];

export const REACTION_TYPE = {
  LIKE: "LIKE",
  DISLIKE: "DISLIKE",
} as const;
export type ReactionType = (typeof REACTION_TYPE)[keyof typeof REACTION_TYPE];

export const VACANCY_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  FILLED: "FILLED",
  PAUSED: "PAUSED",
} as const;
export type VacancyStatus =
  (typeof VACANCY_STATUS)[keyof typeof VACANCY_STATUS];

export const VACANCY_TYPE = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  SEASONAL: "SEASONAL",
  INTERNSHIP: "INTERNSHIP",
  SHIFT_WORK: "SHIFT_WORK",
  FREELANCE: "FREELANCE",
  TEMPORARY: "TEMPORARY",
} as const;
export type VacancyType = (typeof VACANCY_TYPE)[keyof typeof VACANCY_TYPE];

/** Regular (long-lived) vs daily (one work date) vacancy. */
export const VACANCY_KIND = {
  REGULAR: "REGULAR",
  DAILY: "DAILY",
} as const;
export type VacancyKind = (typeof VACANCY_KIND)[keyof typeof VACANCY_KIND];

export const PAYMENT_TYPE = {
  FIXED: "FIXED",
  HOURLY: "HOURLY",
  PIECEWORK: "PIECEWORK",
  OTHER: "OTHER",
} as const;
export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export const PAYMENT_FREQUENCY = {
  MONTHLY: "MONTHLY",
  TWICE_MONTHLY: "TWICE_MONTHLY",
  WEEKLY: "WEEKLY",
  PER_TASK: "PER_TASK",
} as const;
export type PaymentFrequency =
  (typeof PAYMENT_FREQUENCY)[keyof typeof PAYMENT_FREQUENCY];

export const VACANCY_VISIBILITY = {
  PUBLIC: "PUBLIC",
  BY_LINK: "BY_LINK",
} as const;
export type VacancyVisibility =
  (typeof VACANCY_VISIBILITY)[keyof typeof VACANCY_VISIBILITY];

export const APPLICATION_STATUS = {
  SAVED: "SAVED",
  SENT: "SENT",
  VIEWED: "VIEWED",
  REJECTED: "REJECTED",
  ACCEPTED: "ACCEPTED",
} as const;
export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const WORK_FORMAT = {
  ONSITE: "ONSITE",
  REMOTE: "REMOTE",
  HYBRID: "HYBRID",
} as const;
export type WorkFormat = (typeof WORK_FORMAT)[keyof typeof WORK_FORMAT];

export const EMPLOYMENT_TYPE = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  FREELANCE: "FREELANCE",
  INTERNSHIP: "INTERNSHIP",
} as const;
export type EmploymentType =
  (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];

export const EXPERIENCE_LEVEL = {
  NO_EXPERIENCE: "NO_EXPERIENCE",
  LESS_THAN_1: "LESS_THAN_1",
  ONE_TO_3: "ONE_TO_3",
  THREE_TO_5: "THREE_TO_5",
  FIVE_TO_10: "FIVE_TO_10",
  MORE_THAN_10: "MORE_THAN_10",
} as const;
export type ExperienceLevel =
  (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL];

export const EDUCATION_LEVEL = {
  NO_FORMAL_EDUCATION: "NO_FORMAL_EDUCATION",
  PRIMARY_EDUCATION: "PRIMARY_EDUCATION",
  SECONDARY_EDUCATION: "SECONDARY_EDUCATION",
  VOCATIONAL_TRAINING: "VOCATIONAL_TRAINING",
  BACHELORS_DEGREE: "BACHELORS_DEGREE",
  MASTERS_DEGREE: "MASTERS_DEGREE",
  DOCTORATE: "DOCTORATE",
} as const;
export type EducationLevel =
  (typeof EDUCATION_LEVEL)[keyof typeof EDUCATION_LEVEL];

export const MODALITY = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  FILE: "FILE",
} as const;
export type Modality = (typeof MODALITY)[keyof typeof MODALITY];

export const WORKER_STATUS = {
  ACTIVE: "ACTIVE",
  PASSIVE: "PASSIVE",
  OFFLINE: "OFFLINE",
  BANNED: "BANNED",
} as const;
export type WorkerStatus = (typeof WORKER_STATUS)[keyof typeof WORKER_STATUS];

export const APP_THEME = {
  SYSTEM: "SYSTEM",
  LIGHT: "LIGHT",
  DARK: "DARK",
} as const;
export type AppTheme = (typeof APP_THEME)[keyof typeof APP_THEME];

export const JOB_ALERT_FREQUENCY = {
  INSTANT: "INSTANT",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  OFF: "OFF",
} as const;
export type JobAlertFrequency =
  (typeof JOB_ALERT_FREQUENCY)[keyof typeof JOB_ALERT_FREQUENCY];

/** Who can find a worker's résumé in search. */
export const RESUME_VISIBILITY = {
  EVERYONE: "EVERYONE",
  APPLIED_ONLY: "APPLIED_ONLY",
  HIDDEN: "HIDDEN",
} as const;
export type ResumeVisibility =
  (typeof RESUME_VISIBILITY)[keyof typeof RESUME_VISIBILITY];

export const HIRING_STATUS = {
  ACTIVELY_HIRING: "ACTIVELY_HIRING",
  OPEN_TO_APPLICATIONS: "OPEN_TO_APPLICATIONS",
  PAUSED: "PAUSED",
} as const;
export type HiringStatus = (typeof HIRING_STATUS)[keyof typeof HIRING_STATUS];

export const EMPLOYER_VERIFICATION_STATUS = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;
export type EmployerVerificationStatus =
  (typeof EMPLOYER_VERIFICATION_STATUS)[keyof typeof EMPLOYER_VERIFICATION_STATUS];

export const LANGUAGE_PROFICIENCY = {
  BASIC: "BASIC",
  CONVERSATIONAL: "CONVERSATIONAL",
  PROFESSIONAL: "PROFESSIONAL",
  NATIVE: "NATIVE",
} as const;
export type LanguageProficiency =
  (typeof LANGUAGE_PROFICIENCY)[keyof typeof LANGUAGE_PROFICIENCY];

export const DRIVING_LICENSE_CATEGORY = {
  A: "A",
  B: "B",
  C: "C",
  CE: "CE",
  D: "D",
  DE: "DE",
} as const;
export type DrivingLicenseCategory =
  (typeof DRIVING_LICENSE_CATEGORY)[keyof typeof DRIVING_LICENSE_CATEGORY];

export const DOMAIN = {
  INSTALLATION_REPAIR: "INSTALLATION_REPAIR",
  CONSTRUCTION: "CONSTRUCTION",
  AGRICULTURE: "AGRICULTURE",
  TRANSPORTATION: "TRANSPORTATION",
  PRODUCTION: "PRODUCTION",
  PROTECTIVE_SERVICE: "PROTECTIVE_SERVICE",
  FOOD_SERVING: "FOOD_SERVING",
  GROUNDS_MAINTENANCE: "GROUNDS_MAINTENANCE",
  PERSONAL_CARE: "PERSONAL_CARE",
  HEALTHCARE_SUPPORT: "HEALTHCARE_SUPPORT",
  HEALTHCARE_PRACTITIONERS: "HEALTHCARE_PRACTITIONERS",
  MANAGEMENT: "MANAGEMENT",
  BUSINESS_FINANCE: "BUSINESS_FINANCE",
  COMPUTER_MATH: "COMPUTER_MATH",
  ARCHITECTURE_ENGINEERING: "ARCHITECTURE_ENGINEERING",
  LIFE_SOCIAL_SCIENCES: "LIFE_SOCIAL_SCIENCES",
  LEGAL: "LEGAL",
  EDUCATION_LIBRARY: "EDUCATION_LIBRARY",
  ARTS_MEDIA: "ARTS_MEDIA",
  OFFICE_ADMINISTRATIVE: "OFFICE_ADMINISTRATIVE",
  SALES: "SALES",
  SOCIAL_SERVICES: "SOCIAL_SERVICES",
} as const;
export type Domain = (typeof DOMAIN)[keyof typeof DOMAIN];
