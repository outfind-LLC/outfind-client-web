"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  AtSign,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatDateRange } from "@/lib/format";
import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  useUpdateJobSearchInfo,
  useUpdateProfileInfo,
  useUpsertLanguages,
  useDeleteLanguages,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
} from "@/features/profile/hooks/use-worker-profile-mutations";
import {
  WORKER_STATUS_LABELS,
  WORK_FORMAT_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  EDUCATION_LEVEL_LABELS,
  LANGUAGE_PROFICIENCY_LABELS,
  DOMAIN_LABELS,
  DRIVING_CATEGORY_LABELS,
} from "@/features/profile/constants/worker-profile.constants";
import {
  WORK_FORMAT,
  EMPLOYMENT_TYPE,
  EDUCATION_LEVEL,
  LANGUAGE_PROFICIENCY,
  DOMAIN,
  DRIVING_LICENSE_CATEGORY,
} from "@/interfaces/enums";
import type {
  WorkerProfile,
  WorkerExperience,
  WorkerEducation,
} from "@/interfaces/worker-profile.interface";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

// ─── Types ───────────────────────────────────────────────────────────────────

type ExperienceForm = {
  companyName: string;
  position: string;
  domain: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  workFormat: string;
  employmentType: string;
  skills: string[];
  description: string;
};

type EducationForm = {
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  educationLevel: string;
  description: string;
  skills: string[];
};

type LanguageRow = {
  id?: string;
  language: string;
  proficiency: string;
  removed: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function initExpForm(exp?: WorkerExperience): ExperienceForm {
  return {
    companyName: exp?.companyName ?? "",
    position: exp?.position ?? "",
    domain: exp?.domain ?? DOMAIN.TRANSPORTATION,
    startDate: toDateInput(exp?.startDate),
    endDate: toDateInput(exp?.endDate),
    isCurrent: exp ? exp.endDate === null : false,
    workFormat: exp?.workFormat ?? WORK_FORMAT.ONSITE,
    employmentType: exp?.employmentType ?? EMPLOYMENT_TYPE.FULL_TIME,
    skills: exp?.skills ?? [],
    description: exp?.description ?? "",
  };
}

function initEduForm(edu?: WorkerEducation): EducationForm {
  return {
    institutionName: edu?.institutionName ?? "",
    degree: edu?.degree ?? "",
    fieldOfStudy: edu?.fieldOfStudy ?? "",
    startDate: toDateInput(edu?.startDate),
    endDate: toDateInput(edu?.endDate),
    isCurrent: edu ? edu.endDate === null : false,
    educationLevel: edu?.educationLevel ?? "",
    description: edu?.description ?? "",
    skills: edu?.skills ?? [],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-primary text-xs font-semibold uppercase tracking-wide", className)}>
      {children}
    </p>
  );
}

function SectionHeader({
  title,
  onEdit,
  onAdd,
}: {
  title: string;
  onEdit?: () => void;
  onAdd?: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <SectionTitle>{title}</SectionTitle>
      <div className="flex items-center gap-1">
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${title}`}
            className="text-primary hover:bg-primary/10 rounded-md p-1 transition-colors"
          >
            <Plus className="size-4" />
          </button>
        ) : null}
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${title}`}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1 transition-colors"
          >
            <Pencil className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "border-input bg-background focus-visible:ring-ring/40 h-9 w-full rounded-md border px-3 py-1 text-sm outline-none transition focus-visible:ring-[3px]",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm"
            >
              {t}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== t))}
                className="hover:text-destructive ml-0.5"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Type and press Enter"}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={add}
          className="shrink-0"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function CheckboxList({
  allValues,
  selected,
  onChange,
  labels,
}: {
  allValues: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  labels: Record<string, string>;
}) {
  const toggle = (v: string) =>
    selected.includes(v)
      ? onChange(selected.filter((x) => x !== v))
      : onChange([...selected, v]);

  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {allValues.map((v) => (
        <label key={v} className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(v)}
            onChange={() => toggle(v)}
            className="size-4 rounded accent-current"
          />
          <span className="text-sm">{labels[v] ?? v}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Dialogs ─────────────────────────────────────────────────────────────────

function JobSearchDialog({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: WorkerProfile;
}) {
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [countries, setCountries] = useState<string[]>(profile.targetCountries);
  const [expYears, setExpYears] = useState(
    String(profile.experienceYears ?? 0),
  );
  const [abroad, setAbroad] = useState(profile.abroadExperience);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [salaryMin, setSalaryMin] = useState(
    String(profile.expectedSalaryRange?.min ?? 0),
  );

  const mutation = useUpdateJobSearchInfo();

  const save = () => {
    if (!profession.trim()) {
      toast.error("Profession is required");
      return;
    }
    mutation.mutate(
      {
        profession: profession.trim(),
        targetCountries: countries,
        experienceYears: Math.max(0, parseInt(expYears, 10) || 0),
        abroadExperience: abroad,
        skills,
        expectedSalaryMin: Math.max(0, parseInt(salaryMin, 10) || 0),
      },
      {
        onSuccess: () => { toast.success("Search settings updated"); onClose(); },
        onError: () => toast.error("Failed to update — please try again"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Profession *">
            <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Truck Driver" />
          </FormField>
          <FormField label="Target countries">
            <TagInput tags={countries} onChange={setCountries} placeholder="e.g. Germany" />
          </FormField>
          <FormField label="Years of experience">
            <Input type="number" min={0} max={50} value={expYears} onChange={(e) => setExpYears(e.target.value)} />
          </FormField>
          <FormField label="Skills">
            <TagInput tags={skills} onChange={setSkills} placeholder="e.g. Forklift, CNC" />
          </FormField>
          <FormField label="Expected salary (min, USD/month)">
            <Input type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
          </FormField>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <Label>Open to abroad relocation</Label>
            <Switch checked={abroad} onCheckedChange={setAbroad} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileInfoDialog({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: WorkerProfile;
}) {
  const [status, setStatus] = useState<"ACTIVE" | "PASSIVE" | "OFFLINE">(
    (profile.workerStatus === "BANNED" ? "OFFLINE" : profile.workerStatus) as
      | "ACTIVE"
      | "PASSIVE"
      | "OFFLINE",
  );
  const [country, setCountry] = useState(profile.currentCountry ?? "");
  const [city, setCity] = useState(profile.currentCity ?? "");
  const [targetCities, setTargetCities] = useState<string[]>(profile.targetCities);
  const [summary, setSummary] = useState(profile.summary ?? "");
  const [hasDriving, setHasDriving] = useState(profile.hasDrivingLicense);
  const [drivingCats, setDrivingCats] = useState<string[]>(profile.drivingCategories);
  const [domains, setDomains] = useState<string[]>(profile.domainExperience);
  const [empTypes, setEmpTypes] = useState<string[]>(profile.employmentTypes);
  const [formats, setFormats] = useState<string[]>(profile.workFormats);

  const mutation = useUpdateProfileInfo();

  const save = () => {
    mutation.mutate(
      {
        workerStatus: status,
        currentCountry: country.trim() || null,
        currentCity: city.trim() || null,
        targetCities,
        summary: summary.trim() || null,
        hasDrivingLicense: hasDriving,
        drivingCategories: hasDriving ? drivingCats : [],
        domainExperience: domains,
        employmentTypes: empTypes,
        workFormats: formats,
      },
      {
        onSuccess: () => { toast.success("Profile updated"); onClose(); },
        onError: () => toast.error("Failed to update — please try again"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Personal info</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Job search status">
            <NativeSelect
              value={status}
              onChange={(v) => setStatus(v as "ACTIVE" | "PASSIVE" | "OFFLINE")}
              options={[
                { value: "ACTIVE", label: WORKER_STATUS_LABELS.ACTIVE },
                { value: "PASSIVE", label: WORKER_STATUS_LABELS.PASSIVE },
                { value: "OFFLINE", label: WORKER_STATUS_LABELS.OFFLINE },
              ]}
            />
          </FormField>
          <FormField label="Summary / bio">
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief professional summary…"
              rows={3}
              maxLength={2000}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Country">
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Uzbekistan" />
            </FormField>
            <FormField label="City">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Tashkent" />
            </FormField>
          </div>
          <FormField label="Target cities (relocation)">
            <TagInput tags={targetCities} onChange={setTargetCities} placeholder="e.g. Berlin" />
          </FormField>
          <FormField label="Employment types">
            <CheckboxList
              allValues={Object.values(EMPLOYMENT_TYPE)}
              selected={empTypes}
              onChange={setEmpTypes}
              labels={EMPLOYMENT_TYPE_LABELS}
            />
          </FormField>
          <FormField label="Work formats">
            <CheckboxList
              allValues={Object.values(WORK_FORMAT)}
              selected={formats}
              onChange={setFormats}
              labels={WORK_FORMAT_LABELS}
            />
          </FormField>
          <FormField label="Industry domains">
            <CheckboxList
              allValues={Object.values(DOMAIN)}
              selected={domains}
              onChange={setDomains}
              labels={DOMAIN_LABELS}
            />
          </FormField>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <Label>I have a driving license</Label>
            <Switch checked={hasDriving} onCheckedChange={setHasDriving} />
          </div>
          {hasDriving ? (
            <FormField label="License categories">
              <CheckboxList
                allValues={Object.values(DRIVING_LICENSE_CATEGORY)}
                selected={drivingCats}
                onChange={setDrivingCats}
                labels={DRIVING_CATEGORY_LABELS}
              />
            </FormField>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExperienceDialog({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: WorkerExperience;
}) {
  const [form, setForm] = useState<ExperienceForm>(() => initExpForm(existing));
  const up = <K extends keyof ExperienceForm>(k: K, v: ExperienceForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const create = useCreateExperience();
  const update = useUpdateExperience();
  const busy = create.isPending || update.isPending;

  const save = () => {
    if (!form.companyName.trim() || !form.position.trim()) {
      toast.error("Company and position are required");
      return;
    }
    if (!form.startDate) {
      toast.error("Start date is required");
      return;
    }
    const dto = {
      companyName: form.companyName.trim(),
      position: form.position.trim(),
      domain: form.domain,
      startDate: form.startDate,
      endDate: form.isCurrent ? null : form.endDate || null,
      skills: form.skills,
      workFormat: form.workFormat,
      employmentType: form.employmentType,
      description: form.description.trim() || null,
    };
    if (existing) {
      update.mutate(
        { id: existing.id, dto },
        {
          onSuccess: () => { toast.success("Experience updated"); onClose(); },
          onError: () => toast.error("Failed to update"),
        },
      );
    } else {
      create.mutate(dto, {
        onSuccess: () => { toast.success("Experience added"); onClose(); },
        onError: () => toast.error("Failed to add"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit experience" : "Add experience"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Company name *">
            <Input value={form.companyName} onChange={(e) => up("companyName", e.target.value)} placeholder="e.g. ACME Corp" />
          </FormField>
          <FormField label="Position *">
            <Input value={form.position} onChange={(e) => up("position", e.target.value)} placeholder="e.g. Truck Driver" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Employment type">
              <NativeSelect
                value={form.employmentType}
                onChange={(v) => up("employmentType", v)}
                options={Object.values(EMPLOYMENT_TYPE).map((v) => ({
                  value: v,
                  label: EMPLOYMENT_TYPE_LABELS[v] ?? v,
                }))}
              />
            </FormField>
            <FormField label="Work format">
              <NativeSelect
                value={form.workFormat}
                onChange={(v) => up("workFormat", v)}
                options={Object.values(WORK_FORMAT).map((v) => ({
                  value: v,
                  label: WORK_FORMAT_LABELS[v] ?? v,
                }))}
              />
            </FormField>
          </div>
          <FormField label="Industry / domain">
            <NativeSelect
              value={form.domain}
              onChange={(v) => up("domain", v)}
              options={Object.values(DOMAIN).map((v) => ({
                value: v,
                label: DOMAIN_LABELS[v] ?? v,
              }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date *">
              <Input type="date" value={form.startDate} onChange={(e) => up("startDate", e.target.value)} />
            </FormField>
            <FormField label="End date">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => up("endDate", e.target.value)}
                disabled={form.isCurrent}
              />
            </FormField>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <Label>I currently work here</Label>
            <Switch
              checked={form.isCurrent}
              onCheckedChange={(v) => up("isCurrent", v)}
            />
          </div>
          <FormField label="Skills">
            <TagInput tags={form.skills} onChange={(v) => up("skills", v)} placeholder="e.g. Forklift" />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => up("description", e.target.value)}
              placeholder="What did you do in this role?"
              rows={3}
              maxLength={2000}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : existing ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EducationDialog({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: WorkerEducation;
}) {
  const [form, setForm] = useState<EducationForm>(() => initEduForm(existing));
  const up = <K extends keyof EducationForm>(k: K, v: EducationForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const create = useCreateEducation();
  const update = useUpdateEducation();
  const busy = create.isPending || update.isPending;

  const save = () => {
    if (!form.startDate) {
      toast.error("Start date is required");
      return;
    }
    const dto = {
      institutionName: form.institutionName.trim() || null,
      degree: form.degree.trim() || null,
      fieldOfStudy: form.fieldOfStudy.trim() || null,
      startDate: form.startDate,
      endDate: form.isCurrent ? null : form.endDate || null,
      educationLevel: form.educationLevel || null,
      description: form.description.trim() || null,
      skills: form.skills,
    };
    if (existing) {
      update.mutate(
        { id: existing.id, dto },
        {
          onSuccess: () => { toast.success("Education updated"); onClose(); },
          onError: () => toast.error("Failed to update"),
        },
      );
    } else {
      create.mutate(dto, {
        onSuccess: () => { toast.success("Education added"); onClose(); },
        onError: () => toast.error("Failed to add"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit education" : "Add education"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Institution">
            <Input value={form.institutionName} onChange={(e) => up("institutionName", e.target.value)} placeholder="e.g. State University" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Degree">
              <Input value={form.degree} onChange={(e) => up("degree", e.target.value)} placeholder="e.g. Bachelor's" />
            </FormField>
            <FormField label="Field of study">
              <Input value={form.fieldOfStudy} onChange={(e) => up("fieldOfStudy", e.target.value)} placeholder="e.g. Engineering" />
            </FormField>
          </div>
          <FormField label="Education level">
            <NativeSelect
              value={form.educationLevel}
              onChange={(v) => up("educationLevel", v)}
              options={[
                { value: "", label: "— select —" },
                ...Object.values(EDUCATION_LEVEL).map((v) => ({
                  value: v,
                  label: EDUCATION_LEVEL_LABELS[v] ?? v,
                })),
              ]}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date *">
              <Input type="date" value={form.startDate} onChange={(e) => up("startDate", e.target.value)} />
            </FormField>
            <FormField label="End date">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => up("endDate", e.target.value)}
                disabled={form.isCurrent}
              />
            </FormField>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <Label>Currently studying here</Label>
            <Switch
              checked={form.isCurrent}
              onCheckedChange={(v) => up("isCurrent", v)}
            />
          </div>
          <FormField label="Skills learned">
            <TagInput tags={form.skills} onChange={(v) => up("skills", v)} placeholder="e.g. AutoCAD" />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => up("description", e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : existing ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LanguagesDialog({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: WorkerProfile;
}) {
  const [rows, setRows] = useState<LanguageRow[]>(() =>
    profile.languages.map((l) => ({
      id: l.id,
      language: l.language,
      proficiency: l.proficiency,
      removed: false,
    })),
  );
  const [newLang, setNewLang] = useState("");
  const [newProf, setNewProf] = useState<string>(LANGUAGE_PROFICIENCY.CONVERSATIONAL);

  const upsert = useUpsertLanguages();
  const del = useDeleteLanguages();
  const busy = upsert.isPending || del.isPending;

  const addRow = () => {
    if (!newLang.trim()) return;
    setRows((r) => [
      ...r,
      { language: newLang.trim(), proficiency: newProf, removed: false },
    ]);
    setNewLang("");
    setNewProf(LANGUAGE_PROFICIENCY.CONVERSATIONAL);
  };

  const save = async () => {
    const toRemove = rows
      .filter((r) => r.removed && r.id)
      .map((r) => r.id as string);
    const toUpsert = rows.filter((r) => !r.removed);

    try {
      if (toRemove.length > 0) {
        await del.mutateAsync(toRemove);
      }
      if (toUpsert.length > 0) {
        await upsert.mutateAsync(
          toUpsert.map((r) => ({
            language: r.language,
            proficiency: r.proficiency,
          })),
        );
      }
      toast.success("Languages updated");
      onClose();
    } catch {
      toast.error("Failed to update languages");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage languages</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {rows.length > 0 ? (
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div
                  key={row.id ?? `new-${i}`}
                  className={cn(
                    "flex items-center gap-2",
                    row.removed && "opacity-40",
                  )}
                >
                  <Input
                    value={row.language}
                    onChange={(e) =>
                      setRows((r) =>
                        r.map((x, j) =>
                          j === i ? { ...x, language: e.target.value } : x,
                        ),
                      )
                    }
                    disabled={row.removed}
                    className="h-8 text-sm"
                  />
                  <NativeSelect
                    value={row.proficiency}
                    onChange={(v) =>
                      setRows((r) =>
                        r.map((x, j) => (j === i ? { ...x, proficiency: v } : x)),
                      )
                    }
                    options={Object.values(LANGUAGE_PROFICIENCY).map((v) => ({
                      value: v,
                      label: LANGUAGE_PROFICIENCY_LABELS[v] ?? v,
                    }))}
                    className={cn("h-8 w-36 shrink-0", row.removed && "pointer-events-none")}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRows((r) =>
                        r.map((x, j) =>
                          j === i ? { ...x, removed: !x.removed } : x,
                        ),
                      )
                    }
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No languages yet.</p>
          )}

          <div className="border-t pt-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Add a language
            </p>
            <div className="flex gap-2">
              <Input
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRow(); } }}
                placeholder="Language"
                className="h-8 text-sm"
              />
              <NativeSelect
                value={newProf}
                onChange={(v) => setNewProf(v)}
                options={Object.values(LANGUAGE_PROFICIENCY).map((v) => ({
                  value: v,
                  label: LANGUAGE_PROFICIENCY_LABELS[v] ?? v,
                }))}
                className="h-8 w-32 shrink-0"
              />
              <Button type="button" size="sm" variant="outline" onClick={addRow} className="shrink-0">
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkerProfileView({ profile }: { profile: WorkerProfile }) {
  const { user } = useSession();

  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<WorkerExperience | undefined>(
    undefined,
  );
  const [editingEdu, setEditingEdu] = useState<WorkerEducation | undefined>(
    undefined,
  );

  const deleteExp = useDeleteExperience();
  const deleteEdu = useDeleteEducation();

  const openAddExp = () => {
    setEditingExp(undefined);
    setExpOpen(true);
  };
  const openEditExp = (exp: WorkerExperience) => {
    setEditingExp(exp);
    setExpOpen(true);
  };
  const openAddEdu = () => {
    setEditingEdu(undefined);
    setEduOpen(true);
  };
  const openEditEdu = (edu: WorkerEducation) => {
    setEditingEdu(edu);
    setEduOpen(true);
  };

  const handleDeleteExp = (id: string) => {
    deleteExp.mutate(id, {
      onSuccess: () => toast.success("Experience removed"),
      onError: () => toast.error("Failed to remove"),
    });
  };
  const handleDeleteEdu = (id: string) => {
    deleteEdu.mutate(id, {
      onSuccess: () => toast.success("Education removed"),
      onError: () => toast.error("Failed to remove"),
    });
  };

  const firstName = user?.name?.split(" ")[0] ?? "";
  const location = [profile.currentCity, profile.currentCountry]
    .filter(Boolean)
    .join(" · ");
  const relocation = profile.targetCities.join(", ") || profile.targetCountries.join(", ");
  const statusLabel =
    WORKER_STATUS_LABELS[profile.workerStatus] ?? profile.workerStatus;
  const isActive = profile.workerStatus === "ACTIVE";

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-card">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 border-b border-border/50 p-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold leading-tight">
              {user?.name ?? "Your Name"}
            </h2>
            {profile.profession ? (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {profile.profession}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block size-2 rounded-full",
                  isActive ? "bg-green-500" : "bg-muted-foreground/50",
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
                )}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <Avatar className="size-14 rounded-xl border">
            <AvatarImage src={profile.photoUrl ?? undefined} alt={user?.name} />
            <AvatarFallback className="rounded-xl text-base">
              {firstName ? firstName[0].toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* ── Completeness ── */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
          <p className="text-muted-foreground text-xs">Profile completeness</p>
          <div className="flex items-center gap-2">
            <div className="bg-muted h-1.5 w-24 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${profile.completenessScore}%` }}
              />
            </div>
            <span className="text-primary text-xs font-semibold">
              {profile.completenessScore}%
            </span>
          </div>
        </div>

        {/* ── Contact info ── */}
        <div className="border-b border-border/50 p-4">
          <SectionHeader title="Contact info" onEdit={() => setInfoOpen(true)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {user?.email ? (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="text-muted-foreground size-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            ) : null}
            {user?.telegramUsername ? (
              <div className="flex items-center gap-2 text-sm">
                <AtSign className="text-muted-foreground size-4 shrink-0" />
                <span>@{user.telegramUsername}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Search settings ── */}
        <div className="border-b border-border/50 p-4">
          <SectionHeader title="Search settings" onEdit={() => setSearchOpen(true)} />
          <div className="space-y-2.5">
            <InfoRow label="Job searching status">
              <span className={cn("text-sm font-medium", isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                {statusLabel}
              </span>
            </InfoRow>
            {profile.profession ? (
              <InfoRow label="What's interesting">
                <span className="text-sm">{profile.profession}</span>
              </InfoRow>
            ) : null}
            {location ? (
              <InfoRow label="City of residence">
                <span className="text-sm">{location}</span>
              </InfoRow>
            ) : null}
            {relocation ? (
              <InfoRow label="Search or relocation city">
                <span className="text-sm">{relocation}</span>
              </InfoRow>
            ) : null}
            {profile.expectedSalaryRange ? (
              <InfoRow label="Expected salary">
                <span className="text-sm">
                  {profile.expectedSalaryRange.min.toLocaleString()}{" "}
                  {profile.expectedSalaryRange.currency}/mo
                </span>
              </InfoRow>
            ) : null}
          </div>
        </div>

        {/* ── Work experience ── */}
        <div className="border-b border-border/50 p-4">
          <SectionHeader title="Work experience" onAdd={openAddExp} />
          {profile.experiences.length === 0 ? (
            <EmptySection label="No experience added yet" onAdd={openAddExp} />
          ) : (
            <ul className="space-y-4">
              {profile.experiences.map((exp) => (
                <li key={exp.id} className="group flex items-start gap-3">
                  <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
                    <Briefcase className="text-muted-foreground size-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">
                        {exp.companyName}
                      </p>
                      <ItemActions
                        onEdit={() => openEditExp(exp)}
                        onDelete={() => handleDeleteExp(exp.id)}
                        deleting={deleteExp.isPending}
                      />
                    </div>
                    <p className="text-sm">{exp.position}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </p>
                    {exp.description ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                        {exp.description}
                      </p>
                    ) : null}
                    {exp.skills.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {exp.skills.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Education ── */}
        <div className="border-b border-border/50 p-4">
          <SectionHeader title="Education" onAdd={openAddEdu} />
          {profile.education.length === 0 ? (
            <EmptySection label="No education added yet" onAdd={openAddEdu} />
          ) : (
            <ul className="space-y-4">
              {profile.education.map((edu) => (
                <li key={edu.id} className="group flex items-start gap-3">
                  <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
                    <GraduationCap className="text-muted-foreground size-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">
                        {edu.institutionName ?? "Institution"}
                      </p>
                      <ItemActions
                        onEdit={() => openEditEdu(edu)}
                        onDelete={() => handleDeleteEdu(edu.id)}
                        deleting={deleteEdu.isPending}
                      />
                    </div>
                    {edu.degree || edu.fieldOfStudy ? (
                      <p className="text-sm">
                        {[edu.degree, edu.fieldOfStudy]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground text-xs">
                      {formatDateRange(edu.startDate, edu.endDate)}
                      {edu.educationLevel
                        ? ` · ${EDUCATION_LEVEL_LABELS[edu.educationLevel] ?? edu.educationLevel}`
                        : null}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Driving ── */}
        <div className="border-b border-border/50 p-4">
          <SectionHeader title="Driving experience" onEdit={() => setInfoOpen(true)} />
          {profile.hasDrivingLicense ? (
            <div className="space-y-2">
              <p className="text-sm">Has a valid driving license</p>
              {profile.drivingCategories.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.drivingCategories.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {DRIVING_CATEGORY_LABELS[cat] ?? cat}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              I do not have a personal vehicle
            </p>
          )}
        </div>

        {/* ── Languages ── */}
        <div className="p-4">
          <SectionHeader
            title="Languages"
            onEdit={() => setLangOpen(true)}
            onAdd={() => setLangOpen(true)}
          />
          {profile.languages.length === 0 ? (
            <EmptySection label="No languages added" onAdd={() => setLangOpen(true)} />
          ) : (
            <ul className="space-y-1.5">
              {profile.languages.map((lang) => (
                <li key={lang.id} className="text-sm">
                  <span className="font-medium">{lang.language}</span>
                  <span className="text-muted-foreground">
                    ,{" "}
                    {LANGUAGE_PROFICIENCY_LABELS[lang.proficiency] ??
                      lang.proficiency.toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Skills summary */}
      {profile.skills.length > 0 ? (
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle className="mb-3">Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="space-y-2.5">
        <Button variant="outline" size="lg" className="w-full" asChild>
          <Link href={routes.profileCv}>
            <FileText className="size-4" />
            View My CV
          </Link>
        </Button>
      </div>

      {/* Dialogs */}
      <JobSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        profile={profile}
      />
      <ProfileInfoDialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        profile={profile}
      />
      <ExperienceDialog
        open={expOpen}
        onClose={() => setExpOpen(false)}
        existing={editingExp}
      />
      <EducationDialog
        open={eduOpen}
        onClose={() => setEduOpen(false)}
        existing={editingEdu}
      />
      <LanguagesDialog
        open={langOpen}
        onClose={() => setLangOpen(false)}
        profile={profile}
      />
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      {children}
    </div>
  );
}

function ItemActions({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={onEdit}
        className="text-muted-foreground hover:text-foreground rounded p-1"
        aria-label="Edit"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="text-muted-foreground hover:text-destructive rounded p-1"
        aria-label="Delete"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function EmptySection({
  label,
  onAdd,
}: {
  label: string;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="text-muted-foreground hover:text-primary flex w-full items-center gap-1.5 text-sm transition-colors"
    >
      <Plus className="size-4" />
      {label}
    </button>
  );
}
