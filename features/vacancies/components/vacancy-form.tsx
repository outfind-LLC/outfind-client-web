"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  CheckboxGroup,
  FormField,
  ListField,
  NativeSelect,
  SwitchField,
  TagInput,
} from "@/components/form/form-fields";
import { routes } from "@/config/routes";
import {
  useCreateVacancy,
  useUpdateVacancy,
} from "@/features/vacancies/hooks/use-vacancies";
import {
  DRIVING_CATEGORY_OPTIONS,
  VACANCY_DOMAIN_OPTIONS,
  VACANCY_EXPERIENCE_OPTIONS,
  VACANCY_TYPE_OPTIONS,
} from "@/features/vacancies/constants/vacancy-options";
import { isApiClientError } from "@/lib/api/error";
import type {
  CreateVacancyPayload,
  Vacancy,
} from "@/interfaces/vacancy.interface";
import type { ExperienceLevel, VacancyType } from "@/interfaces/enums";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

interface FormState {
  title: string;
  type: string;
  country: string;
  city: string;
  isRemote: boolean;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  salaryRaw: string;
  experienceRequired: string;
  minExperienceYears: string;
  vacancyDomain: string;
  languagesRequired: string[];
  drivingRequired: string[];
  skillsRequired: string[];
  housingProvided: boolean;
  visaSponsorshipAvailable: boolean;
  relocationAssistance: boolean;
  hrEmail: string;
  hrPhone: string;
  hrWhatsapp: string;
  hrLinkedin: string;
  hrTelegram: string;
  applicationUrl: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  recruitmentProcess: string[];
  expiresAt: string;
}

function initialState(vacancy?: Vacancy): FormState {
  return {
    title: vacancy?.title ?? "",
    type: vacancy?.type ?? "",
    country: vacancy?.country ?? "",
    city: vacancy?.city ?? "",
    isRemote: vacancy?.isRemote ?? false,
    salaryMin: vacancy?.salaryMin?.toString() ?? "",
    salaryMax: vacancy?.salaryMax?.toString() ?? "",
    currency: vacancy?.currency ?? "",
    salaryRaw: vacancy?.salaryRaw ?? "",
    experienceRequired: vacancy?.experienceRequired ?? "",
    minExperienceYears: vacancy?.minExperienceYears?.toString() ?? "",
    vacancyDomain: vacancy?.vacancyDomain ?? "",
    languagesRequired: vacancy?.languagesRequired ?? [],
    drivingRequired: vacancy?.drivingRequired ?? [],
    skillsRequired: vacancy?.skillsRequired ?? [],
    housingProvided: vacancy?.housingProvided ?? false,
    visaSponsorshipAvailable: vacancy?.visaSponsorshipAvailable ?? false,
    relocationAssistance: vacancy?.relocationAssistance ?? false,
    hrEmail: vacancy?.hrEmail ?? "",
    hrPhone: vacancy?.hrPhone ?? "",
    hrWhatsapp: vacancy?.hrWhatsapp ?? "",
    hrLinkedin: vacancy?.hrLinkedin ?? "",
    hrTelegram: vacancy?.hrTelegram ?? "",
    applicationUrl: vacancy?.applicationUrl ?? "",
    responsibilities: vacancy?.responsibilities ?? [],
    requirements: vacancy?.requirements ?? [],
    niceToHave: vacancy?.niceToHave ?? [],
    benefits: vacancy?.benefits ?? [],
    recruitmentProcess: vacancy?.recruitmentProcess ?? [],
    expiresAt: vacancy?.expiresAt ? vacancy.expiresAt.slice(0, 10) : "",
  };
}

const trimOrNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const numberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const cleanList = (items: string[]): string[] =>
  items.map((item) => item.trim()).filter(Boolean);

function toPayload(state: FormState): CreateVacancyPayload {
  return {
    title: state.title.trim(),
    type: (state.type || null) as VacancyType | null,
    country: state.country.trim(),
    city: trimOrNull(state.city),
    isRemote: state.isRemote,
    salaryMin: numberOrNull(state.salaryMin),
    salaryMax: numberOrNull(state.salaryMax),
    currency: trimOrNull(state.currency),
    salaryRaw: trimOrNull(state.salaryRaw),
    experienceRequired: (state.experienceRequired ||
      null) as ExperienceLevel | null,
    minExperienceYears: numberOrNull(state.minExperienceYears),
    vacancyDomain: state.vacancyDomain || null,
    languagesRequired: state.languagesRequired,
    drivingRequired: state.drivingRequired,
    skillsRequired: state.skillsRequired,
    housingProvided: state.housingProvided,
    visaSponsorshipAvailable: state.visaSponsorshipAvailable,
    relocationAssistance: state.relocationAssistance,
    hrEmail: trimOrNull(state.hrEmail),
    hrPhone: trimOrNull(state.hrPhone),
    hrWhatsapp: trimOrNull(state.hrWhatsapp),
    hrLinkedin: trimOrNull(state.hrLinkedin),
    hrTelegram: trimOrNull(state.hrTelegram),
    applicationUrl: trimOrNull(state.applicationUrl),
    responsibilities: cleanList(state.responsibilities),
    requirements: cleanList(state.requirements),
    niceToHave: cleanList(state.niceToHave),
    benefits: cleanList(state.benefits),
    recruitmentProcess: cleanList(state.recruitmentProcess),
    expiresAt: state.expiresAt
      ? new Date(`${state.expiresAt}T00:00:00`).toISOString()
      : null,
  };
}

/** Create or edit an employer vacancy. One form drives both flows. */
export function VacancyForm({ vacancy }: { vacancy?: Vacancy }) {
  const router = useRouter();
  const isEdit = Boolean(vacancy);
  const [state, setState] = useState<FormState>(() => initialState(vacancy));
  const createVacancy = useCreateVacancy();
  const updateVacancy = useUpdateVacancy();
  const pending = createVacancy.isPending || updateVacancy.isPending;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const onError = (error: unknown) =>
    toast.error(
      isApiClientError(error) ? error.message : "Couldn't save the vacancy",
    );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    if (!state.title.trim() || !state.country.trim()) {
      toast.error("Title and country are required");
      return;
    }
    const payload = toPayload(state);

    if (isEdit && vacancy) {
      updateVacancy.mutate(
        { id: vacancy.id, payload },
        {
          onSuccess: () => {
            toast.success("Vacancy updated");
            router.push(routes.vacancy(vacancy.id));
          },
          onError,
        },
      );
    } else {
      createVacancy.mutate(payload, {
        onSuccess: (created) => {
          toast.success("Vacancy created");
          router.push(routes.vacancy(created.id));
        },
        onError,
      });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Basics">
        <FormField label="Job title" htmlFor="title" required>
          <Input
            id="title"
            value={state.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="e.g. Long-haul Truck Driver"
            maxLength={200}
            autoFocus
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Employment type" htmlFor="type">
            <NativeSelect
              id="type"
              value={state.type}
              onChange={(event) => set("type", event.target.value)}
              options={VACANCY_TYPE_OPTIONS}
              placeholder="Select type"
            />
          </FormField>
          <FormField label="Domain" htmlFor="domain">
            <NativeSelect
              id="domain"
              value={state.vacancyDomain}
              onChange={(event) => set("vacancyDomain", event.target.value)}
              options={VACANCY_DOMAIN_OPTIONS}
              placeholder="Select domain"
            />
          </FormField>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Country" htmlFor="country" required>
            <Input
              id="country"
              value={state.country}
              onChange={(event) => set("country", event.target.value)}
              placeholder="e.g. Poland"
              maxLength={100}
            />
          </FormField>
          <FormField label="City" htmlFor="city">
            <Input
              id="city"
              value={state.city}
              onChange={(event) => set("city", event.target.value)}
              placeholder="e.g. Warsaw"
              maxLength={100}
            />
          </FormField>
        </div>
        <SwitchField
          label="Remote"
          description="This role can be performed remotely."
          checked={state.isRemote}
          onChange={(checked) => set("isRemote", checked)}
        />
      </Section>

      <Section title="Compensation">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Salary min" htmlFor="salaryMin">
            <Input
              id="salaryMin"
              type="number"
              min={0}
              value={state.salaryMin}
              onChange={(event) => set("salaryMin", event.target.value)}
              placeholder="0"
            />
          </FormField>
          <FormField label="Salary max" htmlFor="salaryMax">
            <Input
              id="salaryMax"
              type="number"
              min={0}
              value={state.salaryMax}
              onChange={(event) => set("salaryMax", event.target.value)}
              placeholder="0"
            />
          </FormField>
          <FormField label="Currency" htmlFor="currency" hint="Required if you set a range">
            <Input
              id="currency"
              value={state.currency}
              onChange={(event) => set("currency", event.target.value)}
              placeholder="e.g. EUR"
              maxLength={10}
            />
          </FormField>
        </div>
        <FormField
          label="Or describe the pay"
          htmlFor="salaryRaw"
          hint="Free text used when a numeric range doesn't fit."
        >
          <Input
            id="salaryRaw"
            value={state.salaryRaw}
            onChange={(event) => set("salaryRaw", event.target.value)}
            placeholder="e.g. €2,500–3,000/month + bonuses"
            maxLength={100}
          />
        </FormField>
      </Section>

      <Section title="Requirements">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Experience level" htmlFor="experience">
            <NativeSelect
              id="experience"
              value={state.experienceRequired}
              onChange={(event) =>
                set("experienceRequired", event.target.value)
              }
              options={VACANCY_EXPERIENCE_OPTIONS}
              placeholder="Any"
            />
          </FormField>
          <FormField label="Min. years of experience" htmlFor="minYears">
            <Input
              id="minYears"
              type="number"
              min={0}
              max={50}
              value={state.minExperienceYears}
              onChange={(event) =>
                set("minExperienceYears", event.target.value)
              }
              placeholder="0"
            />
          </FormField>
        </div>
        <FormField label="Skills" hint="Press Enter to add each skill.">
          <TagInput
            value={state.skillsRequired}
            onChange={(next) => set("skillsRequired", next)}
            placeholder="Add a required skill"
            max={50}
          />
        </FormField>
        <FormField label="Languages" hint="Press Enter to add each language.">
          <TagInput
            value={state.languagesRequired}
            onChange={(next) => set("languagesRequired", next)}
            placeholder="Add a required language"
            max={20}
          />
        </FormField>
        <FormField label="Driving licences">
          <CheckboxGroup
            value={state.drivingRequired}
            onChange={(next) => set("drivingRequired", next)}
            options={DRIVING_CATEGORY_OPTIONS}
          />
        </FormField>
      </Section>

      <Section title="Relocation & perks">
        <div className="grid gap-3 sm:grid-cols-3">
          <SwitchField
            label="Housing provided"
            checked={state.housingProvided}
            onChange={(checked) => set("housingProvided", checked)}
          />
          <SwitchField
            label="Visa sponsorship"
            checked={state.visaSponsorshipAvailable}
            onChange={(checked) => set("visaSponsorshipAvailable", checked)}
          />
          <SwitchField
            label="Relocation help"
            checked={state.relocationAssistance}
            onChange={(checked) => set("relocationAssistance", checked)}
          />
        </div>
      </Section>

      <Section title="Description">
        <FormField label="Responsibilities">
          <ListField
            value={state.responsibilities}
            onChange={(next) => set("responsibilities", next)}
            placeholder="What the role involves"
            addLabel="Add responsibility"
          />
        </FormField>
        <FormField label="Requirements">
          <ListField
            value={state.requirements}
            onChange={(next) => set("requirements", next)}
            placeholder="What candidates must have"
            addLabel="Add requirement"
          />
        </FormField>
        <FormField label="Nice to have">
          <ListField
            value={state.niceToHave}
            onChange={(next) => set("niceToHave", next)}
            placeholder="Bonus qualifications"
            addLabel="Add nice-to-have"
          />
        </FormField>
        <FormField label="Benefits">
          <ListField
            value={state.benefits}
            onChange={(next) => set("benefits", next)}
            placeholder="What you offer"
            addLabel="Add benefit"
          />
        </FormField>
        <FormField label="Recruitment process">
          <ListField
            value={state.recruitmentProcess}
            onChange={(next) => set("recruitmentProcess", next)}
            placeholder="A step in your hiring process"
            addLabel="Add step"
          />
        </FormField>
      </Section>

      <Section title="Contacts & schedule">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="HR email" htmlFor="hrEmail">
            <Input
              id="hrEmail"
              type="email"
              value={state.hrEmail}
              onChange={(event) => set("hrEmail", event.target.value)}
              placeholder="jobs@company.com"
              maxLength={200}
            />
          </FormField>
          <FormField label="HR phone" htmlFor="hrPhone">
            <Input
              id="hrPhone"
              value={state.hrPhone}
              onChange={(event) => set("hrPhone", event.target.value)}
              placeholder="+48 …"
              maxLength={200}
            />
          </FormField>
          <FormField label="WhatsApp" htmlFor="hrWhatsapp">
            <Input
              id="hrWhatsapp"
              value={state.hrWhatsapp}
              onChange={(event) => set("hrWhatsapp", event.target.value)}
              placeholder="+48 …"
              maxLength={200}
            />
          </FormField>
          <FormField label="Telegram" htmlFor="hrTelegram">
            <Input
              id="hrTelegram"
              value={state.hrTelegram}
              onChange={(event) => set("hrTelegram", event.target.value)}
              placeholder="@handle"
              maxLength={200}
            />
          </FormField>
          <FormField label="LinkedIn" htmlFor="hrLinkedin">
            <Input
              id="hrLinkedin"
              type="url"
              value={state.hrLinkedin}
              onChange={(event) => set("hrLinkedin", event.target.value)}
              placeholder="https://linkedin.com/…"
              maxLength={200}
            />
          </FormField>
          <FormField label="External application URL" htmlFor="applicationUrl">
            <Input
              id="applicationUrl"
              type="url"
              value={state.applicationUrl}
              onChange={(event) => set("applicationUrl", event.target.value)}
              placeholder="https://…"
              maxLength={500}
            />
          </FormField>
          <FormField label="Expires on" htmlFor="expiresAt">
            <Input
              id="expiresAt"
              type="date"
              value={state.expiresAt}
              onChange={(event) => set("expiresAt", event.target.value)}
            />
          </FormField>
        </div>
      </Section>

      <div className="bg-background/95 sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t py-3 backdrop-blur-sm">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="brand" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create vacancy"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
