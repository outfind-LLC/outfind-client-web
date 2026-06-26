"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useI18n } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import {
  DOMAIN,
  DRIVING_LICENSE_CATEGORY,
  EDUCATION_LEVEL,
  EMPLOYMENT_TYPE,
  LANGUAGE_PROFICIENCY,
  WORK_FORMAT,
} from "@/interfaces/enums";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import type { MessageKey } from "@/lib/i18n/translate";
import type { TranslateFn } from "@/providers/i18n-provider";
import {
  useCreateEducation,
  useCreateExperience,
  useDeleteEducation,
  useDeleteExperience,
  useDeleteLanguages,
  useUpdateEducation,
  useUpdateExperience,
  useUpdateProfileInfo,
  useUpsertLanguages,
} from "@/features/profile/hooks/use-worker-profile-mutations";
import { Ic } from "@/features/profile/components/profile-icons";
import type { EditTarget } from "@/features/profile/types/edit-target";
import s from "@/features/profile/styles/profile.module.css";

function titleCase(v: string): string {
  return v.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function categoryLabel(c: string): string {
  return c === "CE" ? "C+E" : c;
}
function errMsg(e: unknown, t: TranslateFn): string {
  return isApiClientError(e) ? e.message : t("profile.saveError");
}
const PROFICIENCY_KEY: Record<string, MessageKey> = {
  NATIVE: "profile.native",
  PROFESSIONAL: "profile.langProfessional",
  CONVERSATIONAL: "profile.langConversational",
  BASIC: "profile.langBasic",
};
const EMPLOYMENT_KEY: Record<string, MessageKey> = {
  FULL_TIME: "profile.empFullTime",
  PART_TIME: "profile.empPartTime",
  CONTRACT: "profile.empContract",
  FREELANCE: "profile.empFreelance",
  INTERNSHIP: "profile.empInternship",
};
const WORK_FORMAT_KEY: Record<string, MessageKey> = {
  ONSITE: "profile.workOnsite",
  REMOTE: "profile.workRemote",
  HYBRID: "profile.workHybrid",
};

/** Renders the editor for the requested section (existing-CRUD sections only). */
export function ProfileEditModal({
  target,
  profile,
  onClose,
}: {
  target: EditTarget;
  profile: WorkerProfile;
  onClose: () => void;
}) {
  switch (target.type) {
    case "education":
      return <EducationEditor item={target.item} onClose={onClose} />;
    case "language":
      return <LanguageEditor item={target.item} profile={profile} onClose={onClose} />;
    case "experience":
      return <WorkplaceEditor item={target.item} onClose={onClose} />;
    case "searchLocation":
      return <SearchLocationEditor profile={profile} onClose={onClose} />;
    case "searchArea":
      return <SearchAreaEditor profile={profile} onClose={onClose} />;
    case "driving":
      return <DrivingEditor profile={profile} onClose={onClose} />;
    default:
      return null;
  }
}

/* ---------------- shell + primitives ---------------- */
function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className={s["pf-modal-scrim"]}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s["pf-modal"]} role="dialog" aria-modal="true" aria-label={title}>
        <div className={s["pf-modal-head"]}>
          <div className={s["pf-modal-title"]}>{title}</div>
          <button type="button" className={s["pf-modal-x"]} aria-label={t("profile.ariaClose")} onClick={onClose}>
            <Ic name="close" />
          </button>
        </div>
        <div className={s["pf-modal-body"]}>{children}</div>
        <div className={s["pf-modal-foot"]}>{footer}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={s["pf-field"]}>
      <span className={s["pf-field-l"]}>{label}</span>
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input
        className={s["pf-control"]}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <Field label={label}>
      <span className={s["pf-selectwrap"]}>
        <select
          className={cn(s["pf-control"], s["pf-select"])}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Ic name="chev" />
      </span>
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <textarea
        className={cn(s["pf-control"], s["pf-textarea"])}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={s["pf-check-wrap"]}>
      <input
        type="checkbox"
        className={s["pf-check"]}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={s["pf-check-box"]}>
        <Ic name="check" />
      </span>
      <span className={s["pf-check-l"]}>{label}</span>
    </label>
  );
}

function Foot({
  onClose,
  onSave,
  saving,
  t,
}: {
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  t: TranslateFn;
}) {
  return (
    <>
      <button type="button" className={cn(s["pf-btn"], s["pf-btn-ghost"])} onClick={onClose}>
        {t("profile.cancel")}
      </button>
      <button type="button" className={cn(s["pf-btn"], s["pf-btn-primary"])} onClick={onSave} disabled={saving}>
        {t("profile.save")}
      </button>
    </>
  );
}

function RemoveButton({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button type="button" className={s["pf-dangerbtn"]} onClick={onRemove}>
      <Ic name="trash" />
      {label}
    </button>
  );
}

/* ---------------- editors ---------------- */
function EducationEditor({
  item,
  onClose,
}: {
  item: import("@/interfaces/worker-profile.interface").WorkerEducation | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const create = useCreateEducation();
  const update = useUpdateEducation();
  const del = useDeleteEducation();

  const initYear = item ? new Date(item.endDate ?? item.startDate).getFullYear() : null;
  const [org, setOrg] = useState(item?.institutionName ?? "");
  const [field, setField] = useState(item?.fieldOfStudy ?? "");
  const [year, setYear] = useState(initYear ? String(initYear) : "");
  const [level, setLevel] = useState(item?.educationLevel ?? "");

  const saving = create.isPending || update.isPending || del.isPending;
  const levelOptions = Object.values(EDUCATION_LEVEL).map((v) => ({ value: v, label: titleCase(v) }));

  const save = async () => {
    if (!org.trim() || saving) return;
    const date = year.trim() ? `${year.trim()}-01-01` : new Date().toISOString().slice(0, 10);
    const dto = {
      institutionName: org.trim(),
      fieldOfStudy: field.trim() || null,
      educationLevel: level || null,
      startDate: date,
      endDate: date,
    };
    try {
      if (item) await update.mutateAsync({ id: item.id, dto });
      else await create.mutateAsync(dto);
      toast(t("profile.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };
  const remove = async () => {
    if (!item) return;
    try {
      await del.mutateAsync(item.id);
      toast(t("profile.removed"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal
      title={item ? t("profile.eduEditTitle") : t("profile.eduAddTitle")}
      onClose={onClose}
      footer={<Foot onClose={onClose} onSave={save} saving={saving} t={t} />}
    >
      <TextField label={t("profile.eduOrg")} value={org} onChange={setOrg} placeholder={t("profile.eduOrgPh")} />
      <TextField label={t("profile.eduField")} value={field} onChange={setField} placeholder={t("profile.eduFieldPh")} />
      <TextField label={t("profile.eduYear")} value={year} onChange={setYear} placeholder={t("profile.eduYearPh")} type="number" />
      <SelectField label={t("profile.eduLevel")} value={level} onChange={setLevel} options={levelOptions} placeholder={t("profile.eduLevelPh")} />
      {item ? <RemoveButton label={t("profile.eduRemove")} onRemove={remove} /> : null}
    </Modal>
  );
}

function LanguageEditor({
  item,
  profile,
  onClose,
}: {
  item: import("@/interfaces/worker-profile.interface").WorkerLanguage | null;
  profile: WorkerProfile;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const upsert = useUpsertLanguages();
  const del = useDeleteLanguages();

  const [language, setLanguage] = useState(item?.language ?? "");
  const [proficiency, setProficiency] = useState(item?.proficiency ?? "");

  const saving = upsert.isPending || del.isPending;
  const levelOptions = Object.values(LANGUAGE_PROFICIENCY).map((v) => ({
    value: v,
    label: t(PROFICIENCY_KEY[v] ?? "profile.native"),
  }));

  const save = async () => {
    if (!language.trim() || !proficiency || saving) return;
    try {
      await upsert.mutateAsync([{ language: language.trim(), proficiency }]);
      // Renamed an existing language → drop the old row.
      if (item && item.language !== language.trim()) await del.mutateAsync([item.id]);
      toast(t("profile.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };
  const remove = async () => {
    if (!item) return;
    try {
      await del.mutateAsync([item.id]);
      toast(t("profile.removed"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  void profile;
  return (
    <Modal
      title={item ? t("profile.langEditTitle") : t("profile.langAddTitle")}
      onClose={onClose}
      footer={<Foot onClose={onClose} onSave={save} saving={saving} t={t} />}
    >
      <TextField label={t("profile.langName")} value={language} onChange={setLanguage} placeholder={t("profile.langNamePh")} />
      <SelectField label={t("profile.langLevel")} value={proficiency} onChange={setProficiency} options={levelOptions} placeholder={t("profile.langLevelPh")} />
      {item ? <RemoveButton label={t("profile.langRemove")} onRemove={remove} /> : null}
    </Modal>
  );
}

function WorkplaceEditor({
  item,
  onClose,
}: {
  item: import("@/interfaces/worker-profile.interface").WorkerExperience | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const create = useCreateExperience();
  const update = useUpdateExperience();
  const del = useDeleteExperience();

  const [company, setCompany] = useState(item?.companyName ?? "");
  const [role, setRole] = useState(item?.position ?? "");
  const [employment, setEmployment] = useState(item?.employmentType ?? "");
  const [workFormat, setWorkFormat] = useState(item?.workFormat ?? "");
  const [domain, setDomain] = useState(item?.domain ?? "");
  const [start, setStart] = useState(item ? item.startDate.slice(0, 7) : "");
  const [present, setPresent] = useState(item ? item.endDate === null : false);
  const [end, setEnd] = useState(item?.endDate ? item.endDate.slice(0, 7) : "");
  const [bullets, setBullets] = useState(item?.description ?? "");

  const saving = create.isPending || update.isPending || del.isPending;
  const empOptions = Object.values(EMPLOYMENT_TYPE).map((v) => ({
    value: v,
    label: t(EMPLOYMENT_KEY[v] ?? "profile.empFullTime"),
  }));
  const workOptions = Object.values(WORK_FORMAT).map((v) => ({
    value: v,
    label: t(WORK_FORMAT_KEY[v] ?? "profile.workOnsite"),
  }));
  const domainOptions = Object.values(DOMAIN).map((v) => ({ value: v, label: titleCase(v) }));
  const canSave = Boolean(company.trim() && role.trim() && employment && workFormat && domain && start);

  const save = async () => {
    if (!canSave || saving) return;
    const dto = {
      companyName: company.trim(),
      position: role.trim(),
      domain,
      employmentType: employment,
      workFormat,
      startDate: `${start}-01`,
      endDate: present ? null : end ? `${end}-01` : null,
      description: bullets.trim() || null,
    };
    try {
      if (item) await update.mutateAsync({ id: item.id, dto });
      else await create.mutateAsync(dto);
      toast(t("profile.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };
  const remove = async () => {
    if (!item) return;
    try {
      await del.mutateAsync(item.id);
      toast(t("profile.removed"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal
      title={item ? t("profile.wpEditTitle") : t("profile.wpAddTitle")}
      onClose={onClose}
      footer={<Foot onClose={onClose} onSave={save} saving={saving} t={t} />}
    >
      <TextField label={t("profile.wpCompany")} value={company} onChange={setCompany} />
      <TextField label={t("profile.wpRole")} value={role} onChange={setRole} />
      <div className={s["pf-row"]}>
        <SelectField label={t("profile.wpEmployment")} value={employment} onChange={setEmployment} options={empOptions} placeholder={t("profile.selectPlaceholder")} />
        <SelectField label={t("profile.wpWorkFormat")} value={workFormat} onChange={setWorkFormat} options={workOptions} placeholder={t("profile.selectPlaceholder")} />
      </div>
      <SelectField label={t("profile.wpDomain")} value={domain} onChange={setDomain} options={domainOptions} placeholder={t("profile.selectPlaceholder")} />
      <div className={s["pf-row"]}>
        <TextField label={t("profile.wpStart")} value={start} onChange={setStart} type="month" />
        {!present ? <TextField label={t("profile.wpEnd")} value={end} onChange={setEnd} type="month" /> : null}
      </div>
      <CheckRow label={t("profile.wpPresent")} checked={present} onChange={setPresent} />
      <TextAreaField label={t("profile.wpBullets")} value={bullets} onChange={setBullets} placeholder={t("profile.wpBulletsPh")} />
      {item ? <RemoveButton label={t("profile.wpRemove")} onRemove={remove} /> : null}
    </Modal>
  );
}

function SearchLocationEditor({ profile, onClose }: { profile: WorkerProfile; onClose: () => void }) {
  const { t } = useI18n();
  const update = useUpdateProfileInfo();
  const [city, setCity] = useState(profile.currentCity ?? "");
  const [country, setCountry] = useState(profile.currentCountry ?? "");

  const save = async () => {
    if (update.isPending) return;
    try {
      await update.mutateAsync({ currentCity: city.trim() || null, currentCountry: country.trim() || null });
      toast(t("profile.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal title={t("profile.fldLocTitle")} onClose={onClose} footer={<Foot onClose={onClose} onSave={save} saving={update.isPending} t={t} />}>
      <TextField label={t("profile.fldCity")} value={city} onChange={setCity} placeholder={t("profile.fldCityPh")} />
      <TextField label={t("profile.fldCountry")} value={country} onChange={setCountry} placeholder={t("profile.fldCountryPh")} />
    </Modal>
  );
}

function SearchAreaEditor({ profile, onClose }: { profile: WorkerProfile; onClose: () => void }) {
  const { t } = useI18n();
  const update = useUpdateProfileInfo();
  const [cities, setCities] = useState(profile.targetCities.join(", "));

  const save = async () => {
    if (update.isPending) return;
    const list = cities.split(",").map((c) => c.trim()).filter(Boolean);
    try {
      await update.mutateAsync({ targetCities: list });
      toast(t("profile.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal title={t("profile.fldAreaTitle")} onClose={onClose} footer={<Foot onClose={onClose} onSave={save} saving={update.isPending} t={t} />}>
      <TextField label={t("profile.fldAreaTitle")} value={cities} onChange={setCities} placeholder={t("profile.fldAreaPh")} />
    </Modal>
  );
}

function DrivingEditor({ profile, onClose }: { profile: WorkerProfile; onClose: () => void }) {
  const { t } = useI18n();
  const update = useUpdateProfileInfo();
  const [selected, setSelected] = useState<string[]>(profile.drivingCategories);

  const toggle = (cat: string) =>
    setSelected((cur) => (cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat]));

  const save = async () => {
    if (update.isPending) return;
    try {
      await update.mutateAsync({ hasDrivingLicense: selected.length > 0, drivingCategories: selected });
      toast(t("profile.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal title={t("profile.drvTitle")} onClose={onClose} footer={<Foot onClose={onClose} onSave={save} saving={update.isPending} t={t} />}>
      <Field label={t("profile.drvCats")}>
        <span className={s["pf-seg"]}>
          {Object.values(DRIVING_LICENSE_CATEGORY).map((cat) => (
            <button
              key={cat}
              type="button"
              className={cn(s["pf-seg-btn"], selected.includes(cat) && s.on)}
              onClick={() => toggle(cat)}
              aria-pressed={selected.includes(cat)}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </span>
      </Field>
    </Modal>
  );
}
