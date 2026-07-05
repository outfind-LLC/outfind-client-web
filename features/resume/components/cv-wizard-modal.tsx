"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/config/query-keys";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { isApiClientError } from "@/lib/api/error";
import { Ic, type IconName } from "@/features/dashboard/components/app-icons";
import { useT, type TranslateFn } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";

import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import {
  useUpdateProfileInfo,
  useUpsertLanguages,
} from "@/features/profile/hooks/use-worker-profile-mutations";
import type {
  LanguageInput,
  UpdateProfileInfoInput,
} from "@/features/profile/services/profile.service";
import { useCreateResume } from "@/features/resume/hooks/use-resumes";
import { resumeService } from "@/features/resume/services/resume.service";
import { useCvWizardStore } from "@/features/resume/store/cv-wizard.store";
import { genId, SECTION_DEFAULT_TITLE } from "@/features/resume/lib/defaults";
import {
  EDUCATION_LEVEL,
  EMPLOYMENT_TYPE,
  EXPERIENCE_LEVEL,
  LANGUAGE_PROFICIENCY,
  type EducationLevel,
  type EmploymentType,
  type ExperienceLevel,
  type LanguageProficiency,
} from "@/interfaces/enums";
import type {
  EducationItem,
  EducationSection,
  ExperienceItem,
  ExperienceSection,
  LanguageItem,
  LanguagesSection,
  ResumeBasics,
  ResumeDocument,
  ResumeSection,
  SkillsSection,
  SocialLink,
} from "@/interfaces/resume.interface";
import type {
  SalaryRange,
  WorkerLanguage,
  WorkerProfile,
} from "@/interfaces/worker-profile.interface";
import s from "@/features/resume/styles/cv-wizard.module.css";

// ─── Reference data (labels localized at render; `en`/enum values persisted) ──

interface CountryOpt {
  id: string;
  labelKey: MessageKey;
}
interface JobField {
  id: string;
  labelKey: MessageKey;
  en: string;
  icon: IconName;
}
interface EmploymentOpt {
  id: string;
  labelKey: MessageKey;
  type: EmploymentType;
}
interface ExpOpt {
  id: string;
  labelKey: MessageKey;
  level: ExperienceLevel;
}
interface EduOpt {
  id: string;
  labelKey: MessageKey;
  en: string;
  level: EducationLevel;
}
interface SkillOpt {
  value: string;
  labelKey: MessageKey;
}
interface LangOpt {
  id: string;
  labelKey: MessageKey;
  name: string;
}
interface LevelOpt {
  id: string;
  labelKey: MessageKey;
  cvLabel: string;
  proficiency: LanguageProficiency;
}

const CITIZENSHIPS: CountryOpt[] = [
  { id: "Uzbekistan", labelKey: "cv.countryUz" },
  { id: "Kyrgyzstan", labelKey: "cv.countryKg" },
  { id: "Tajikistan", labelKey: "cv.countryTj" },
  { id: "Kazakhstan", labelKey: "cv.countryKz" },
  { id: "Turkmenistan", labelKey: "cv.countryTm" },
];

const JOB_FIELDS: JobField[] = [
  { id: "construction", labelKey: "cv.jobConstruction", en: "Construction", icon: "hardHat" },
  { id: "restaurant", labelKey: "cv.jobRestaurant", en: "Restaurant", icon: "utensils" },
  { id: "factory", labelKey: "cv.jobFactory", en: "Factory", icon: "factory" },
  { id: "driver", labelKey: "cv.jobDriver", en: "Driver", icon: "truck" },
  { id: "cleaning", labelKey: "cv.jobCleaning", en: "Cleaning", icon: "spray" },
  { id: "it", labelKey: "cv.jobIt", en: "IT", icon: "code" },
  { id: "agriculture", labelKey: "cv.jobAgriculture", en: "Agriculture", icon: "plant" },
  { id: "healthcare", labelKey: "cv.jobHealthcare", en: "Healthcare", icon: "health" },
  { id: "other", labelKey: "cv.jobOther", en: "Other", icon: "grid" },
];

const EMPLOYMENTS: EmploymentOpt[] = [
  { id: "full", labelKey: "cv.employFull", type: EMPLOYMENT_TYPE.FULL_TIME },
  { id: "part", labelKey: "cv.employPart", type: EMPLOYMENT_TYPE.PART_TIME },
  // No SEASONAL in EmploymentType — CONTRACT is the closest persisted value.
  { id: "seasonal", labelKey: "cv.employSeasonal", type: EMPLOYMENT_TYPE.CONTRACT },
];

const EXPERIENCES: ExpOpt[] = [
  { id: "none", labelKey: "cv.expNone", level: EXPERIENCE_LEVEL.NO_EXPERIENCE },
  { id: "lt1", labelKey: "cv.expLt1", level: EXPERIENCE_LEVEL.LESS_THAN_1 },
  { id: "1-3", labelKey: "cv.exp13", level: EXPERIENCE_LEVEL.ONE_TO_3 },
  { id: "3-5", labelKey: "cv.exp35", level: EXPERIENCE_LEVEL.THREE_TO_5 },
  { id: "5+", labelKey: "cv.exp5", level: EXPERIENCE_LEVEL.FIVE_TO_10 },
];

const EDUCATIONS: EduOpt[] = [
  { id: "school", labelKey: "cv.eduSchool", en: "School", level: EDUCATION_LEVEL.SECONDARY_EDUCATION },
  { id: "vocational", labelKey: "cv.eduVocational", en: "Vocational college", level: EDUCATION_LEVEL.VOCATIONAL_TRAINING },
  { id: "university", labelKey: "cv.eduUniversity", en: "University", level: EDUCATION_LEVEL.BACHELORS_DEGREE },
  { id: "none", labelKey: "cv.eduNone", en: "No formal education", level: EDUCATION_LEVEL.NO_FORMAL_EDUCATION },
];

const SKILL_OPTIONS: SkillOpt[] = [
  { value: "Driving licence B", labelKey: "cv.skillLicenceB" },
  { value: "Driving licence C / C+E", labelKey: "cv.skillLicenceC" },
  { value: "Forklift", labelKey: "cv.skillForklift" },
  { value: "Welding", labelKey: "cv.skillWelding" },
  { value: "Electrical work", labelKey: "cv.skillElectrical" },
  { value: "Plumbing", labelKey: "cv.skillPlumbing" },
  { value: "Painting & finishing", labelKey: "cv.skillPainting" },
  { value: "Bricklaying", labelKey: "cv.skillBricklaying" },
  { value: "Machine operation", labelKey: "cv.skillMachine" },
  { value: "Food prep / kitchen", labelKey: "cv.skillFood" },
  { value: "Cleaning & housekeeping", labelKey: "cv.skillCleaning" },
  { value: "Warehouse & picking", labelKey: "cv.skillWarehouse" },
  { value: "Care / support work", labelKey: "cv.skillCare" },
  { value: "Sewing", labelKey: "cv.skillSewing" },
  { value: "Team leadership", labelKey: "cv.skillLeadership" },
];

const LANGUAGES: LangOpt[] = [
  { id: "uz", labelKey: "cv.langUz", name: "Uzbek" },
  { id: "ru", labelKey: "cv.langRu", name: "Russian" },
  { id: "en", labelKey: "cv.langEn", name: "English" },
  { id: "de", labelKey: "cv.langDe", name: "German" },
  { id: "pl", labelKey: "cv.langPl", name: "Polish" },
  { id: "tr", labelKey: "cv.langTr", name: "Turkish" },
];

const LEVELS: LevelOpt[] = [
  { id: "basic", labelKey: "cv.levelBasic", cvLabel: "Basic", proficiency: LANGUAGE_PROFICIENCY.BASIC },
  { id: "good", labelKey: "cv.levelGood", cvLabel: "Good", proficiency: LANGUAGE_PROFICIENCY.CONVERSATIONAL },
  { id: "fluent", labelKey: "cv.levelFluent", cvLabel: "Fluent", proficiency: LANGUAGE_PROFICIENCY.PROFESSIONAL },
  { id: "native", labelKey: "cv.levelNative", cvLabel: "Native", proficiency: LANGUAGE_PROFICIENCY.NATIVE },
];

const TOTAL_STEPS = 6;
type StepIndex = 1 | 2 | 3 | 4 | 5 | 6;

interface JobEntry {
  role: string;
  company: string;
  years: string;
}

interface CvWizardData {
  firstName: string;
  surname: string;
  phone: string;
  city: string;
  citizenship: string;
  birthYear: string;
  /** Local preview only — never persisted (see photoUrl TODO in `buildDocument`). */
  photo: string | null;
  job: string;
  title: string;
  employment: string;
  salary: string;
  exp: string;
  jobs: JobEntry[];
  edu: string;
  eduOrg: string;
  skills: string[];
  customSkill: string;
  langs: Record<string, string>;
  email: string;
  telegram: string;
}

const EMPTY_DATA: CvWizardData = {
  firstName: "",
  surname: "",
  phone: "",
  city: "",
  citizenship: "Uzbekistan",
  birthYear: "",
  photo: null,
  job: "",
  title: "",
  employment: "full",
  salary: "",
  exp: "",
  jobs: [],
  edu: "",
  eduOrg: "",
  skills: [],
  customSkill: "",
  langs: {},
  email: "",
  telegram: "",
};

// ─── Pure mapping helpers ─────────────────────────────────────────────────────

function parseSalary(text: string): number | null {
  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseYear(text: string): string | null {
  const m = text.match(/(?:19|20)\d{2}/);
  return m ? m[0] : null;
}

function yearOf(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
}

function formatPeriod(start: string, end: string | null): string {
  const startY = yearOf(start);
  const endY = end ? yearOf(end) : "";
  if (startY && endY) return `${startY} — ${endY}`;
  if (startY) return `${startY} — Present`;
  return "";
}

function formatSalary(range: SalaryRange): string {
  const amount = range.min.toLocaleString("en-US");
  return range.currency ? `${amount} ${range.currency}` : amount;
}

function matchCitizenship(country: string | null | undefined): string | null {
  if (!country) return null;
  const hit = CITIZENSHIPS.find(
    (c) => c.id.toLowerCase() === country.toLowerCase(),
  );
  return hit ? hit.id : null;
}

function matchJobField(profession: string | null | undefined): string {
  if (!profession) return "";
  const lower = profession.toLowerCase();
  const hit = JOB_FIELDS.find((j) => lower.includes(j.en.toLowerCase()));
  return hit ? hit.id : "";
}

function reverseEmployment(type: EmploymentType | undefined): string {
  const hit = EMPLOYMENTS.find((e) => e.type === type);
  return hit ? hit.id : "full";
}

function reverseExperience(level: ExperienceLevel | null | undefined): string {
  if (!level) return "";
  if (level === EXPERIENCE_LEVEL.MORE_THAN_10) return "5+";
  const hit = EXPERIENCES.find((e) => e.level === level);
  return hit ? hit.id : "";
}

function reverseEducation(level: EducationLevel | null | undefined): string {
  if (!level) return "";
  const direct = EDUCATIONS.find((e) => e.level === level);
  if (direct) return direct.id;
  // Fold the remaining backend levels onto the four wizard buckets.
  if (
    level === EDUCATION_LEVEL.PRIMARY_EDUCATION ||
    level === EDUCATION_LEVEL.NO_FORMAL_EDUCATION
  ) {
    return level === EDUCATION_LEVEL.PRIMARY_EDUCATION ? "school" : "none";
  }
  if (
    level === EDUCATION_LEVEL.MASTERS_DEGREE ||
    level === EDUCATION_LEVEL.DOCTORATE
  ) {
    return "university";
  }
  return "";
}

function reverseLevel(proficiency: string): string {
  const p = proficiency.toLowerCase();
  if (p.includes("basic")) return "basic";
  if (p.includes("native")) return "native";
  if (p.includes("fluent") || p.includes("professional")) return "fluent";
  return "good";
}

function buildLangs(languages: WorkerLanguage[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const wl of languages ?? []) {
    const key = wl.language.toLowerCase();
    const hit = LANGUAGES.find(
      (l) => l.name.toLowerCase() === key || l.id === key,
    );
    if (hit) out[hit.id] = reverseLevel(wl.proficiency);
  }
  return out;
}

/** Build wizard state pre-filled from the stored worker profile (or defaults). */
function buildInitialData(profile: WorkerProfile | undefined): CvWizardData {
  if (!profile) return { ...EMPTY_DATA };
  const experiences: JobEntry[] = (profile.experiences ?? []).map((e) => ({
    role: e.position ?? "",
    company: e.companyName ?? "",
    years: formatPeriod(e.startDate, e.endDate),
  }));
  return {
    firstName: profile.firstName ?? "",
    surname: profile.lastName ?? "",
    phone: profile.contactPhone ?? "",
    city: profile.currentCity ?? "",
    citizenship: matchCitizenship(profile.citizenship?.primaryCountry) ?? "Uzbekistan",
    birthYear: yearOf(profile.dateOfBirth),
    photo: null,
    job: matchJobField(profile.profession),
    title: profile.profession ?? "",
    employment: reverseEmployment(profile.employmentTypes?.[0]),
    salary: profile.expectedSalaryRange ? formatSalary(profile.expectedSalaryRange) : "",
    exp: reverseExperience(profile.experienceLevel),
    jobs: experiences,
    edu: reverseEducation(profile.education?.[0]?.educationLevel),
    eduOrg: profile.education?.[0]?.institutionName ?? "",
    skills: [...(profile.skills ?? [])],
    customSkill: "",
    langs: buildLangs(profile.languages),
    email: profile.contactEmail ?? "",
    telegram: profile.contactTelegram ?? "",
  };
}

/** Wizard state → a valid `ResumeDocument` (shapes mirror `newSection`/`newItem`). */
function buildDocument(data: CvWizardData): ResumeDocument {
  const fullName = `${data.firstName} ${data.surname}`.trim();
  const jobField = JOB_FIELDS.find((j) => j.id === data.job);
  const headline = data.title.trim() || jobField?.en || "";

  const socials: SocialLink[] = [];
  const telegram = data.telegram.trim();
  if (telegram) socials.push({ label: "Telegram", url: telegram });

  const basics: ResumeBasics = {
    fullName: fullName || "Your name",
    headline,
    email: data.email.trim(),
    phone: data.phone.trim(),
    location: data.city.trim(),
    website: "",
    // TODO: upload photo — `basics.photoUrl` is capped ~600 chars so a base64
    // dataURL won't fit; wire an upload endpoint and store the returned URL.
    photoUrl: null,
    summary: "",
    socials,
  };

  const sections: ResumeSection[] = [];

  const jobs = data.jobs.filter(
    (j) => j.role.trim() || j.company.trim() || j.years.trim(),
  );
  if (data.exp !== "none" && jobs.length) {
    const items: ExperienceItem[] = jobs.map((j) => ({
      company: j.company.trim(),
      position: j.role.trim(),
      location: "",
      // Free-text duration can't be parsed to dates — keep it as the start-date
      // display string so nothing is lost.
      startDate: j.years.trim(),
      endDate: "",
      current: false,
      description: "",
      highlights: [],
    }));
    const section: ExperienceSection = {
      id: genId(),
      title: SECTION_DEFAULT_TITLE.experience,
      type: "experience",
      visible: true,
      items,
    };
    sections.push(section);
  }

  if (data.edu && data.edu !== "none") {
    const eduField = EDUCATIONS.find((e) => e.id === data.edu);
    const item: EducationItem = {
      institution: data.eduOrg.trim(),
      degree: eduField?.en ?? "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    const section: EducationSection = {
      id: genId(),
      title: SECTION_DEFAULT_TITLE.education,
      type: "education",
      visible: true,
      items: [item],
    };
    sections.push(section);
  }

  if (data.skills.length) {
    const section: SkillsSection = {
      id: genId(),
      title: SECTION_DEFAULT_TITLE.skills,
      type: "skills",
      visible: true,
      items: [...data.skills],
    };
    sections.push(section);
  }

  const langIds = Object.keys(data.langs);
  if (langIds.length) {
    const items: LanguageItem[] = langIds.map((id) => {
      const lang = LANGUAGES.find((l) => l.id === id);
      const level = LEVELS.find((lv) => lv.id === data.langs[id]);
      return {
        language: lang?.name ?? id,
        proficiency: level?.cvLabel ?? "",
      };
    });
    const section: LanguagesSection = {
      id: genId(),
      title: SECTION_DEFAULT_TITLE.languages,
      type: "languages",
      visible: true,
      items,
    };
    sections.push(section);
  }

  return { basics, sections };
}

/** Flat profile write-back so the wizard's data stays consistent everywhere. */
function buildProfilePatch(data: CvWizardData): UpdateProfileInfoInput {
  const patch: UpdateProfileInfoInput = {};
  if (data.firstName.trim()) patch.firstName = data.firstName.trim();
  if (data.surname.trim()) patch.lastName = data.surname.trim();
  if (data.phone.trim()) patch.contactPhone = data.phone.trim();
  if (data.city.trim()) patch.currentCity = data.city.trim();
  if (data.citizenship) patch.citizenship = { primaryCountry: data.citizenship };
  const jobField = JOB_FIELDS.find((j) => j.id === data.job);
  const profession = data.title.trim() || jobField?.en;
  if (profession) patch.profession = profession;
  if (data.skills.length) patch.skills = [...data.skills];
  const employment = EMPLOYMENTS.find((e) => e.id === data.employment);
  if (employment) patch.employmentTypes = [employment.type];
  const salaryMin = parseSalary(data.salary);
  if (salaryMin != null) {
    patch.expectedSalaryRange = { min: salaryMin, currency: "UZS" };
  }
  if (data.email.trim()) patch.contactEmail = data.email.trim();
  if (data.telegram.trim()) patch.contactTelegram = data.telegram.trim();
  const year = parseYear(data.birthYear);
  if (year) patch.dateOfBirth = `${year}-01-01`;
  return patch;
}

function buildLanguageInputs(data: CvWizardData): LanguageInput[] {
  return Object.keys(data.langs).map((id) => {
    const lang = LANGUAGES.find((l) => l.id === id);
    const level = LEVELS.find((lv) => lv.id === data.langs[id]);
    return {
      language: lang?.name ?? id,
      proficiency: level?.proficiency ?? LANGUAGE_PROFICIENCY.CONVERSATIONAL,
    };
  });
}

function isStepValid(step: StepIndex, data: CvWizardData): boolean {
  switch (step) {
    case 1:
      return (
        data.firstName.trim().length > 1 &&
        data.surname.trim().length > 1 &&
        data.phone.trim().length > 6
      );
    case 2:
      return Boolean(data.job);
    case 3:
      return Boolean(data.exp);
    case 4:
      return Boolean(data.edu);
    case 5:
      return Object.keys(data.langs).length > 0;
    default:
      return true;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Guided "Create CV" wizard — a six-step bottom sheet (mobile) / centered card
 * (desktop) mounted once in the app shell and opened via `useCvWizardStore`.
 * It pre-fills from the worker profile, produces a valid `ResumeDocument`,
 * creates the CV (POST blank name → PATCH document), writes the flat fields back
 * to the profile, then lands in the existing editor.
 */
export function CvWizardModal() {
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isWorker } = useSession();

  const open = useCvWizardStore((st) => st.open);
  const close = useCvWizardStore((st) => st.close);

  const profile = useWorkerProfile(open && Boolean(isWorker));
  const createResume = useCreateResume();
  const updateProfile = useUpdateProfileInfo();
  const upsertLanguages = useUpsertLanguages();

  const [step, setStep] = useState<StepIndex>(1);
  const [data, setData] = useState<CvWizardData>(EMPTY_DATA);
  const [submitting, setSubmitting] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  // Prefill once per open, waiting for the profile fetch (a worker may have one).
  const prefilled = useRef(false);
  useEffect(() => {
    if (!open) {
      prefilled.current = false;
      return;
    }
    if (prefilled.current) return;
    if (isWorker && profile.isLoading) return;
    prefilled.current = true;
    setData(buildInitialData(profile.data));
    setStep(1);
  }, [open, isWorker, profile.isLoading, profile.data]);

  // Esc to close + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  if (!open) return null;

  const patch = (next: Partial<CvWizardData>) =>
    setData((d) => ({ ...d, ...next }));

  const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ photo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const toggleSkill = (value: string) => {
    setData((d) =>
      d.skills.includes(value)
        ? { ...d, skills: d.skills.filter((x) => x !== value) }
        : { ...d, skills: [...d.skills, value] },
    );
  };

  const addCustomSkill = () => {
    const value = data.customSkill.trim();
    if (!value || data.skills.includes(value)) {
      patch({ customSkill: "" });
      return;
    }
    patch({ skills: [...data.skills, value], customSkill: "" });
  };

  const toggleLang = (id: string) => {
    setData((d) => {
      const next = { ...d.langs };
      if (next[id]) delete next[id];
      else next[id] = "good";
      return { ...d, langs: next };
    });
  };

  const setLangLevel = (id: string, level: string) =>
    setData((d) => ({ ...d, langs: { ...d.langs, [id]: level } }));

  const addJob = () =>
    patch({ jobs: [...data.jobs, { role: "", company: "", years: "" }] });

  const removeJob = (index: number) =>
    patch({ jobs: data.jobs.filter((_, i) => i !== index) });

  const setJob = (index: number, field: keyof JobEntry, value: string) =>
    patch({
      jobs: data.jobs.map((j, i) => (i === index ? { ...j, [field]: value } : j)),
    });

  const pickExp = (id: string) => {
    // Reveal a first blank job card when the worker has experience.
    if (id !== "none" && data.jobs.length === 0) {
      patch({ exp: id, jobs: [{ role: "", company: "", years: "" }] });
    } else {
      patch({ exp: id });
    }
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const firstName = data.firstName.trim();
      const name = firstName
        ? t("cv.defaultName", { name: firstName })
        : t("cv.wizTitle");
      const view = await createResume.mutateAsync({ name });
      const updated = await resumeService.update(view.id, {
        document: buildDocument(data),
      });
      queryClient.setQueryData(qk.resume(view.id), updated);
      queryClient.invalidateQueries({ queryKey: qk.resumes });

      // Best-effort profile write-back — never blocks the CV flow.
      if (isWorker) {
        await Promise.allSettled([
          updateProfile.mutateAsync(buildProfilePatch(data)),
          buildLanguageInputs(data).length > 0
            ? upsertLanguages.mutateAsync(buildLanguageInputs(data))
            : Promise.resolve(),
        ]);
      }

      close();
      router.push(routes.resumeEditor(view.id));
    } catch (error) {
      toast.error(
        isApiClientError(error) ? error.message : t("cv.wizCreateError"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = () => {
    if (!isStepValid(step, data)) return;
    if (step < TOTAL_STEPS) setStep((x) => ((x + 1) as StepIndex));
    else void submit();
  };

  const meta = STEP_META[step];
  const valid = isStepValid(step, data);

  return (
    <div
      className={s.scrim}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t("cv.wizTitle")}
      >
        <div className={s.head}>
          {step > 1 ? (
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.wizBack")}
              onClick={() => setStep((x) => (x > 1 ? ((x - 1) as StepIndex) : x))}
            >
              <Ic name="back" />
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={s.iconBtn}
            aria-label={t("cv.wizClose")}
            onClick={close}
          >
            <Ic name="close" />
          </button>
        </div>

        <div className={s.progress} aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={cn(s.progressBar, step >= i + 1 && s.progressOn)}
            />
          ))}
        </div>

        <div className={s.intro}>
          <h2 className={s.title}>{t(meta.title)}</h2>
          <p className={s.subtitle}>{t(meta.subtitle)}</p>
        </div>

        <div className={s.body}>
          {step === 1 && (
            <Step1
              t={t}
              data={data}
              patch={patch}
              photoInput={photoInput}
              onPickPhoto={onPickPhoto}
            />
          )}
          {step === 2 && <Step2 t={t} data={data} patch={patch} />}
          {step === 3 && (
            <Step3
              t={t}
              data={data}
              pickExp={pickExp}
              addJob={addJob}
              removeJob={removeJob}
              setJob={setJob}
            />
          )}
          {step === 4 && (
            <Step4
              t={t}
              data={data}
              patch={patch}
              toggleSkill={toggleSkill}
              addCustomSkill={addCustomSkill}
            />
          )}
          {step === 5 && (
            <Step5
              t={t}
              data={data}
              toggleLang={toggleLang}
              setLangLevel={setLangLevel}
            />
          )}
          {step === 6 && <Step6 t={t} data={data} patch={patch} />}
        </div>

        <div className={s.foot}>
          <button
            type="button"
            className={s.cta}
            disabled={!valid || submitting}
            onClick={onNext}
          >
            {step < TOTAL_STEPS ? t("cv.continue") : t("cv.createCta")}
            <Ic name="arrowRight" />
          </button>
        </div>
      </div>
    </div>
  );
}

const STEP_META: Record<StepIndex, { title: MessageKey; subtitle: MessageKey }> = {
  1: { title: "cv.step1Title", subtitle: "cv.step1Sub" },
  2: { title: "cv.step2Title", subtitle: "cv.step2Sub" },
  3: { title: "cv.step3Title", subtitle: "cv.step3Sub" },
  4: { title: "cv.step4Title", subtitle: "cv.step4Sub" },
  5: { title: "cv.step5Title", subtitle: "cv.step5Sub" },
  6: { title: "cv.step6Title", subtitle: "cv.step6Sub" },
};

// ─── Shared field controls ────────────────────────────────────────────────────

type Patch = (next: Partial<CvWizardData>) => void;

function Field({
  label,
  optional,
  required,
  children,
}: {
  label: string;
  optional?: boolean;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={s.field}>
      <span className={s.label}>
        {label}
        {required ? <span className={s.req}> *</span> : null}
        {optional ? <span className={s.opt}> (optional)</span> : null}
      </span>
      {children}
    </label>
  );
}

function TextInput(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  maxLength?: number;
  autoComplete?: string;
  onEnter?: () => void;
}) {
  return (
    <input
      className={s.input}
      type={props.type ?? "text"}
      value={props.value}
      inputMode={props.inputMode}
      maxLength={props.maxLength}
      autoComplete={props.autoComplete}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && props.onEnter) {
          e.preventDefault();
          props.onEnter();
        }
      }}
    />
  );
}

function Segmented({
  options,
  value,
  onChange,
  small,
  equal,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  small?: boolean;
  /** Equal-width cells (grid) so a longer label doesn't balloon the button. */
  equal?: boolean;
}) {
  return (
    <div className={cn(s.seg, small && s.segSm, equal && s.segEqual)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          className={cn(s.segBtn, value === o.id && s.segOn)}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({
  t,
  data,
  patch,
  photoInput,
  onPickPhoto,
}: {
  t: TranslateFn;
  data: CvWizardData;
  patch: Patch;
  photoInput: RefObject<HTMLInputElement | null>;
  onPickPhoto: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={s.fields}>
      <div className={s.photoRow}>
        <button
          type="button"
          className={s.photoBtn}
          aria-label={t("cv.photoAdd")}
          onClick={() => photoInput.current?.click()}
        >
          {data.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.photoImg} src={data.photo} alt="" />
          ) : (
            <Ic name="plus" />
          )}
        </button>
        <div className={s.photoText}>
          <div className={s.photoTitle}>
            {t("cv.photoTitle")}
            <span className={s.opt}> (optional)</span>
          </div>
          <div className={s.photoDesc}>{t("cv.photoDesc")}</div>
          {data.photo ? (
            <button
              type="button"
              className={s.photoRemove}
              onClick={() => patch({ photo: null })}
            >
              {t("cv.photoRemove")}
            </button>
          ) : null}
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onPickPhoto}
        />
      </div>

      <div className={s.grid2}>
        <Field label={t("cv.firstName")} required>
          <TextInput
            value={data.firstName}
            onChange={(v) => patch({ firstName: v })}
            placeholder={t("cv.firstNamePh")}
            autoComplete="given-name"
          />
        </Field>
        <Field label={t("cv.surname")} required>
          <TextInput
            value={data.surname}
            onChange={(v) => patch({ surname: v })}
            placeholder={t("cv.surnamePh")}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label={t("cv.phone")} required>
        <TextInput
          value={data.phone}
          onChange={(v) => patch({ phone: v })}
          placeholder={t("cv.phonePh")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>

      <div className={s.grid2}>
        <Field label={t("cv.cityLabel")} optional>
          <TextInput
            value={data.city}
            onChange={(v) => patch({ city: v })}
            placeholder={t("cv.cityPh")}
          />
        </Field>
        <Field label={t("cv.birthYear")} optional>
          <TextInput
            value={data.birthYear}
            onChange={(v) => patch({ birthYear: v })}
            placeholder={t("cv.birthYearPh")}
            inputMode="numeric"
            maxLength={4}
          />
        </Field>
      </div>

      <div className={s.field}>
        <span className={s.label}>{t("cv.citizenship")}</span>
        <Segmented
          equal
          options={CITIZENSHIPS.map((c) => ({ id: c.id, label: t(c.labelKey) }))}
          value={data.citizenship}
          onChange={(id) => patch({ citizenship: id })}
        />
      </div>
    </div>
  );
}

function Step2({
  t,
  data,
  patch,
}: {
  t: TranslateFn;
  data: CvWizardData;
  patch: Patch;
}) {
  return (
    <>
      <div className={s.jobs}>
        {JOB_FIELDS.map((j) => (
          <button
            key={j.id}
            type="button"
            aria-pressed={data.job === j.id}
            className={cn(s.job, data.job === j.id && s.jobOn)}
            onClick={() => patch({ job: j.id })}
          >
            <span className={s.jobIc}>
              <Ic name={j.icon} />
            </span>
            <span className={s.jobName}>{t(j.labelKey)}</span>
            <span className={s.jobRadio} aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className={s.fields} style={{ marginTop: 22 }}>
        <Field label={t("cv.titleLabel")} optional>
          <TextInput
            value={data.title}
            onChange={(v) => patch({ title: v })}
            placeholder={t("cv.titlePh")}
          />
        </Field>
        <div className={s.field}>
          <span className={s.label}>{t("cv.employmentLabel")}</span>
          <Segmented
            options={EMPLOYMENTS.map((e) => ({ id: e.id, label: t(e.labelKey) }))}
            value={data.employment}
            onChange={(id) => patch({ employment: id })}
          />
        </div>
        <Field label={t("cv.salaryLabel")} optional>
          <TextInput
            value={data.salary}
            onChange={(v) => patch({ salary: v })}
            placeholder={t("cv.salaryPh")}
          />
        </Field>
      </div>
    </>
  );
}

function Step3({
  t,
  data,
  pickExp,
  addJob,
  removeJob,
  setJob,
}: {
  t: TranslateFn;
  data: CvWizardData;
  pickExp: (id: string) => void;
  addJob: () => void;
  removeJob: (index: number) => void;
  setJob: (index: number, field: keyof JobEntry, value: string) => void;
}) {
  const hasExp = Boolean(data.exp) && data.exp !== "none";
  return (
    <>
      <Segmented
        options={EXPERIENCES.map((e) => ({ id: e.id, label: t(e.labelKey) }))}
        value={data.exp}
        onChange={pickExp}
      />

      {hasExp ? (
        <>
          <p className={s.blockLabel}>{t("cv.expListTitle")}</p>
          <div className={s.xpList}>
            {data.jobs.map((job, i) => (
              <div key={i} className={s.xp}>
                <div className={s.xpHead}>
                  <span className={s.xpTitle}>
                    {t("cv.jobEntry", { n: i + 1 })}
                  </span>
                  <button
                    type="button"
                    className={s.xpDel}
                    aria-label={t("cv.expRemove")}
                    onClick={() => removeJob(i)}
                  >
                    <Ic name="trash" />
                  </button>
                </div>
                <div className={s.fields}>
                  <div className={s.grid2}>
                    <Field label={t("cv.expRole")}>
                      <TextInput
                        value={job.role}
                        onChange={(v) => setJob(i, "role", v)}
                        placeholder={t("cv.expRolePh")}
                      />
                    </Field>
                    <Field label={t("cv.expCompany")}>
                      <TextInput
                        value={job.company}
                        onChange={(v) => setJob(i, "company", v)}
                        placeholder={t("cv.expCompanyPh")}
                      />
                    </Field>
                  </div>
                  <Field label={t("cv.expHowLong")}>
                    <TextInput
                      value={job.years}
                      onChange={(v) => setJob(i, "years", v)}
                      placeholder={t("cv.expHowLongPh")}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className={s.addBtn} onClick={addJob}>
            <Ic name="plus" />
            {data.jobs.length ? t("cv.expAdd") : t("cv.expAddFirst")}
          </button>
        </>
      ) : data.exp === "none" ? (
        <p className={s.hint}>{t("cv.expNoneHint")}</p>
      ) : null}
    </>
  );
}

function Step4({
  t,
  data,
  patch,
  toggleSkill,
  addCustomSkill,
}: {
  t: TranslateFn;
  data: CvWizardData;
  patch: Patch;
  toggleSkill: (value: string) => void;
  addCustomSkill: () => void;
}) {
  const predefined = new Set(SKILL_OPTIONS.map((o) => o.value));
  const customSkills = data.skills.filter((v) => !predefined.has(v));
  return (
    <>
      <Segmented
        options={EDUCATIONS.map((e) => ({ id: e.id, label: t(e.labelKey) }))}
        value={data.edu}
        onChange={(id) => patch({ edu: id })}
      />

      {data.edu && data.edu !== "none" ? (
        <div className={s.fields} style={{ marginTop: 16 }}>
          <Field label={t("cv.eduWhere")} optional>
            <TextInput
              value={data.eduOrg}
              onChange={(v) => patch({ eduOrg: v })}
              placeholder={t("cv.eduWherePh")}
            />
          </Field>
        </div>
      ) : null}

      <p className={s.blockLabel}>{t("cv.skillsTitle")}</p>
      <div className={s.chips}>
        {SKILL_OPTIONS.map((skill) => (
          <button
            key={skill.value}
            type="button"
            aria-pressed={data.skills.includes(skill.value)}
            className={cn(s.chip, data.skills.includes(skill.value) && s.chipOn)}
            onClick={() => toggleSkill(skill.value)}
          >
            {t(skill.labelKey)}
            {data.skills.includes(skill.value) ? (
              <span className={s.chipX} aria-hidden="true">
                ×
              </span>
            ) : null}
          </button>
        ))}
        {customSkills.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed
            className={cn(s.chip, s.chipOn)}
            onClick={() => toggleSkill(value)}
          >
            {value}
            <span className={s.chipX} aria-hidden="true">
              ×
            </span>
          </button>
        ))}
      </div>

      <div className={s.addSkill}>
        <TextInput
          value={data.customSkill}
          onChange={(v) => patch({ customSkill: v })}
          placeholder={t("cv.skillCustomPh")}
          onEnter={addCustomSkill}
        />
        <button type="button" className={s.addSkillBtn} onClick={addCustomSkill}>
          <Ic name="plus" />
          {t("cv.skillAdd")}
        </button>
      </div>
    </>
  );
}

function Step5({
  t,
  data,
  toggleLang,
  setLangLevel,
}: {
  t: TranslateFn;
  data: CvWizardData;
  toggleLang: (id: string) => void;
  setLangLevel: (id: string, level: string) => void;
}) {
  return (
    <div className={s.langs}>
      {LANGUAGES.map((lang) => {
        const level = data.langs[lang.id];
        const on = Boolean(level);
        return (
          <div key={lang.id} className={s.lang}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              className={cn(s.check, on && s.checkOn)}
              onClick={() => toggleLang(lang.id)}
            >
              <span className={s.checkBox}>{on ? <Ic name="checkThin" /> : null}</span>
              <span className={s.checkText}>{t(lang.labelKey)}</span>
            </button>
            {on ? (
              <div className={s.lvl}>
                <Segmented
                  small
                  options={LEVELS.map((lv) => ({ id: lv.id, label: t(lv.labelKey) }))}
                  value={level}
                  onChange={(id) => setLangLevel(lang.id, id)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Step6({
  t,
  data,
  patch,
}: {
  t: TranslateFn;
  data: CvWizardData;
  patch: Patch;
}) {
  const dash = "—";
  const fullName = `${data.firstName} ${data.surname}`.trim();
  const jobField = JOB_FIELDS.find((j) => j.id === data.job);
  const employment = EMPLOYMENTS.find((e) => e.id === data.employment);
  const workLabel = data.title.trim() || (jobField ? t(jobField.labelKey) : "");
  const work = workLabel
    ? workLabel + (employment ? ` · ${t(employment.labelKey)}` : "")
    : dash;
  const expOpt = EXPERIENCES.find((e) => e.id === data.exp);
  const langNames = LANGUAGES.filter((l) => data.langs[l.id]).map((l) =>
    t(l.labelKey),
  );
  const skillLabel = (value: string) => {
    const opt = SKILL_OPTIONS.find((o) => o.value === value);
    return opt ? t(opt.labelKey) : value;
  };
  const skills =
    data.skills.length > 0
      ? data.skills.slice(0, 4).map(skillLabel).join(", ") +
        (data.skills.length > 4 ? ` +${data.skills.length - 4}` : "")
      : dash;

  const rows: { label: string; value: string }[] = [
    { label: t("cv.revName"), value: fullName || dash },
    { label: t("cv.revPhone"), value: data.phone.trim() || dash },
    { label: t("cv.revWork"), value: work },
    { label: t("cv.revExperience"), value: expOpt ? t(expOpt.labelKey) : dash },
    { label: t("cv.revSkills"), value: skills },
    {
      label: t("cv.revLanguages"),
      value: langNames.length ? langNames.join(", ") : dash,
    },
  ];

  return (
    <>
      <div className={s.grid2}>
        <Field label={t("cv.email")} optional>
          <TextInput
            value={data.email}
            onChange={(v) => patch({ email: v })}
            placeholder={t("cv.emailPh")}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
        </Field>
        <Field label={t("cv.telegram")} optional>
          <TextInput
            value={data.telegram}
            onChange={(v) => patch({ telegram: v })}
            placeholder={t("cv.telegramPh")}
          />
        </Field>
      </div>

      <p className={s.blockLabel}>{t("cv.reviewTitle")}</p>
      <div className={s.review}>
        {rows.map((r) => (
          <div key={r.label} className={s.revRow}>
            <span className={s.revLabel}>{r.label}</span>
            <span className={s.revVal}>{r.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
