"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useI18n } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/spinner";
import { VACANCY_TYPE, type VacancyType } from "@/interfaces/enums";
import type {
  EmployerProfile,
  UpdateEmployerProfilePayload,
} from "@/interfaces/employer-profile.interface";
import type { MessageKey } from "@/lib/i18n/translate";
import type { TranslateFn } from "@/providers/i18n-provider";
import {
  useCreateCompanyLocation,
  useDeleteCompanyLocation,
  useUpdateCompanyLocation,
  useUpdateEmployerProfile,
} from "@/features/profile/hooks/use-employer-profile-mutations";
import { useCreateVacancy } from "@/features/vacancies/hooks/use-vacancies";
import { Ic } from "@/features/profile/components/profile-icons";
import { ComboSelect } from "@/features/profile/components/combo-select";
import type { CompanyEditTarget } from "@/features/profile/types/company-edit-target";
import s from "@/features/profile/styles/profile.module.css";

function errMsg(e: unknown, t: TranslateFn): string {
  return isApiClientError(e) ? e.message : t("company.saved");
}

const EMP_LABEL: Record<string, MessageKey> = {
  FULL_TIME: "company.empFullTime",
  PART_TIME: "company.empPartTime",
  CONTRACT: "company.empContract",
  SEASONAL: "company.empSeasonal",
  INTERNSHIP: "company.empInternship",
};

/** Routes a {@link CompanyEditTarget} to the right editor (mirrors `ProfileEditModal`). */
export function CompanyEditModal({
  target,
  profile,
  onClose,
}: {
  target: CompanyEditTarget;
  profile: EmployerProfile;
  onClose: () => void;
}) {
  switch (target.type) {
    case "identity":
      return <IdentityEditor profile={profile} onClose={onClose} />;
    case "about":
      return <AboutEditor profile={profile} onClose={onClose} />;
    case "contact":
      return (
        <ContactEditor
          profile={profile}
          field={target.field}
          onClose={onClose}
        />
      );
    case "field":
      return (
        <FieldEditor profile={profile} field={target.field} onClose={onClose} />
      );
    case "location":
      return (
        <LocationEditor
          profile={profile}
          index={target.index}
          onClose={onClose}
        />
      );
    case "postJob":
      return <PostJobEditor onClose={onClose} />;
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
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  wide?: boolean;
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
      <div
        className={cn(s["pf-modal"], wide && s["pf-modal-wide"])}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={s["pf-modal-head"]}>
          <div className={s["pf-modal-title"]}>{title}</div>
          <button
            type="button"
            className={s["pf-modal-x"]}
            aria-label={t("company.ariaClose")}
            onClick={onClose}
          >
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
function Foot({
  onSave,
  saving,
  label,
  loading,
}: {
  onSave: () => void;
  saving: boolean;
  label: string;
  /** Spinner state — defaults to `saving`; pass explicitly when `saving` also
   * carries a can't-save-yet validation state (so the spinner doesn't show early). */
  loading?: boolean;
}) {
  const busy = loading ?? saving;
  return (
    <button
      type="button"
      className={cn(s["pf-btn"], s["pf-btn-primary"])}
      onClick={onSave}
      disabled={saving}
      aria-busy={busy || undefined}
    >
      {busy ? <Spinner /> : null}
      {label}
    </button>
  );
}
function RemoveButton({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button type="button" className={s["pf-dangerbtn"]} onClick={onRemove}>
      <Ic name="trash" />
      {label}
    </button>
  );
}

/* ---------------- editors ---------------- */
function IdentityEditor({
  profile,
  onClose,
}: {
  profile: EmployerProfile;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const update = useUpdateEmployerProfile();
  const [name, setName] = useState(profile.companyName);
  const [tagline, setTagline] = useState(profile.tagline ?? "");

  const save = async () => {
    if (update.isPending) return;
    try {
      const patch: UpdateEmployerProfilePayload = {
        tagline: tagline.trim() || null,
      };
      if (name.trim() && name.trim() !== profile.companyName)
        patch.companyName = name.trim();
      await update.mutateAsync(patch);
      toast(t("company.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal
      title={t("company.editProfile")}
      onClose={onClose}
      footer={
        <Foot
          onSave={save}
          saving={update.isPending}
          label={t("company.save")}
        />
      }
    >
      <TextField
        label={t("company.name")}
        value={name}
        onChange={setName}
        placeholder={t("company.namePh")}
      />
      <TextField
        label={t("company.tagline")}
        value={tagline}
        onChange={setTagline}
        placeholder={t("company.taglinePh")}
      />
    </Modal>
  );
}

function AboutEditor({
  profile,
  onClose,
}: {
  profile: EmployerProfile;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const update = useUpdateEmployerProfile();
  const [about, setAbout] = useState(profile.description ?? "");
  const save = async () => {
    if (update.isPending) return;
    try {
      await update.mutateAsync({ description: about.trim() || null });
      toast(t("company.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };
  return (
    <Modal
      title={t("company.editAbout")}
      onClose={onClose}
      footer={
        <Foot
          onSave={save}
          saving={update.isPending}
          label={t("company.save")}
        />
      }
    >
      <TextAreaField
        label={t("company.about")}
        value={about}
        onChange={setAbout}
        placeholder={t("company.aboutPh")}
      />
    </Modal>
  );
}

function ContactEditor({
  profile,
  field,
  onClose,
}: {
  profile: EmployerProfile;
  field: "phone" | "website";
  onClose: () => void;
}) {
  const { t } = useI18n();
  const update = useUpdateEmployerProfile();
  const [value, setValue] = useState(
    field === "phone" ? (profile.phone ?? "") : (profile.website ?? ""),
  );
  const labelKey: MessageKey =
    field === "phone" ? "company.phone" : "company.website";
  const phKey: MessageKey =
    field === "phone" ? "company.phonePh" : "company.websitePh";
  const save = async () => {
    if (update.isPending) return;
    try {
      await update.mutateAsync({ [field]: value.trim() || null });
      toast(t("company.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };
  return (
    <Modal
      title={t(labelKey)}
      onClose={onClose}
      footer={
        <Foot
          onSave={save}
          saving={update.isPending}
          label={t("company.save")}
        />
      }
    >
      <TextField
        label={t(labelKey)}
        value={value}
        onChange={setValue}
        placeholder={t(phKey)}
        type={field === "phone" ? "tel" : "text"}
      />
    </Modal>
  );
}

function FieldEditor({
  profile,
  field,
  onClose,
}: {
  profile: EmployerProfile;
  field: "industry" | "size" | "founded" | "hq";
  onClose: () => void;
}) {
  const { t } = useI18n();
  const update = useUpdateEmployerProfile();

  const [industry, setIndustry] = useState(profile.industry ?? "");
  const [size, setSize] = useState(profile.companySize ?? "");
  const [founded, setFounded] = useState(
    profile.foundedYear != null ? String(profile.foundedYear) : "",
  );
  const [country, setCountry] = useState(profile.country ?? "");
  const [city, setCity] = useState(profile.city ?? "");

  const titleKey: MessageKey =
    field === "industry"
      ? "company.industry"
      : field === "size"
        ? "company.size"
        : field === "founded"
          ? "company.founded"
          : "company.hq";

  const save = async () => {
    if (update.isPending) return;
    try {
      if (field === "industry")
        await update.mutateAsync({ industry: industry.trim() || null });
      else if (field === "size")
        await update.mutateAsync({ companySize: size.trim() || null });
      else if (field === "hq")
        await update.mutateAsync({
          country: country.trim() || null,
          city: city.trim() || null,
        });
      else {
        const year = Number.parseInt(founded.trim(), 10);
        await update.mutateAsync({
          foundedYear: Number.isFinite(year) ? year : null,
        });
      }
      toast(t("company.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal
      title={t(titleKey)}
      onClose={onClose}
      footer={
        <Foot
          onSave={save}
          saving={update.isPending}
          label={t("company.save")}
        />
      }
    >
      {field === "industry" ? (
        <TextField
          label={t("company.industry")}
          value={industry}
          onChange={setIndustry}
          placeholder={t("company.industryPh")}
        />
      ) : field === "size" ? (
        <TextField
          label={t("company.size")}
          value={size}
          onChange={setSize}
          placeholder={t("company.sizePh")}
        />
      ) : field === "founded" ? (
        <TextField
          label={t("company.founded")}
          value={founded}
          onChange={setFounded}
          placeholder={t("company.foundedPh")}
        />
      ) : (
        <>
          <TextField
            label={t("company.city")}
            value={city}
            onChange={setCity}
            placeholder={t("company.cityPh")}
          />
          <TextField
            label={t("company.country")}
            value={country}
            onChange={setCountry}
            placeholder={t("company.countryPh")}
          />
        </>
      )}
    </Modal>
  );
}

function LocationEditor({
  profile,
  index,
  onClose,
}: {
  profile: EmployerProfile;
  index: number | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const create = useCreateCompanyLocation();
  const updateLoc = useUpdateCompanyLocation();
  const del = useDeleteCompanyLocation();
  const existing = index != null ? (profile.locations[index] ?? null) : null;
  const [city, setCity] = useState(existing?.city ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");

  const saving = create.isPending || updateLoc.isPending || del.isPending;
  // The backend requires both city and address on a location.
  const canSave = Boolean(city.trim() && address.trim());

  const save = async () => {
    if (!canSave || saving) return;
    const dto = { city: city.trim(), address: address.trim() };
    try {
      if (existing) await updateLoc.mutateAsync({ id: existing.id, dto });
      else await create.mutateAsync(dto);
      toast(t("company.saved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };
  const remove = async () => {
    if (!existing || saving) return;
    try {
      await del.mutateAsync(existing.id);
      toast(t("company.locRemoved"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal
      title={existing ? t("company.editLocation") : t("company.addLocation")}
      onClose={onClose}
      footer={
        <Foot
          onSave={save}
          saving={saving || !canSave}
          loading={saving}
          label={t("company.save")}
        />
      }
    >
      <TextField
        label={t("company.city")}
        value={city}
        onChange={setCity}
        placeholder={t("company.cityPh")}
      />
      <TextField
        label={t("company.address")}
        value={address}
        onChange={setAddress}
        placeholder={t("company.addressPh")}
      />
      {existing ? (
        <RemoveButton label={t("company.removeLocation")} onRemove={remove} />
      ) : null}
    </Modal>
  );
}

function PostJobEditor({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const create = useCreateVacancy();
  const [title, setTitle] = useState("");
  const [employment, setEmployment] = useState("");
  const [domain, setDomain] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [remote, setRemote] = useState(false);
  const [salary, setSalary] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  const empOptions = Object.values(VACANCY_TYPE).map((v) => ({
    value: v,
    label: t(EMP_LABEL[v] ?? "company.empFullTime"),
  }));
  const canSave = Boolean(title.trim() && country.trim());

  const save = async () => {
    if (!canSave || create.isPending) return;
    const bullets = responsibilities
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    try {
      await create.mutateAsync({
        title: title.trim(),
        country: country.trim(),
        city: city.trim() || null,
        type: employment ? (employment as VacancyType) : null,
        isRemote: remote,
        salaryRaw: salary.trim() || null,
        vacancyDomain: domain.trim() || null,
        responsibilities: bullets.length ? bullets : null,
      });
      toast(t("company.pjCreated"));
      onClose();
    } catch (e) {
      toast.error(errMsg(e, t));
    }
  };

  return (
    <Modal
      title={t("company.pjTitle")}
      onClose={onClose}
      wide
      footer={
        <Foot
          onSave={save}
          saving={create.isPending || !canSave}
          loading={create.isPending}
          label={t("company.pjCreate")}
        />
      }
    >
      <TextField
        label={t("company.pjRole")}
        value={title}
        onChange={setTitle}
        placeholder={t("company.pjRolePh")}
      />
      <div className={s["pf-row"]}>
        <ComboSelect
          label={t("company.pjEmployment")}
          value={employment}
          onChange={setEmployment}
          options={empOptions}
          placeholder={t("company.selectPlaceholder")}
        />
        <TextField
          label={t("company.pjDomain")}
          value={domain}
          onChange={setDomain}
          placeholder={t("company.industryPh")}
        />
      </div>
      <div className={s["pf-row"]}>
        <TextField
          label={t("company.pjCountry")}
          value={country}
          onChange={setCountry}
          placeholder={t("company.countryPh")}
        />
        <TextField
          label={t("company.pjCity")}
          value={city}
          onChange={setCity}
          placeholder={t("company.cityPh")}
        />
      </div>
      <TextField
        label={t("company.pjSalary")}
        value={salary}
        onChange={setSalary}
        placeholder={t("company.pjSalaryPh")}
      />
      <label className={s["pf-check-wrap"]}>
        <span className={s["pf-check-l"]}>{t("company.pjRemote")}</span>
        <input
          type="checkbox"
          className={s["pf-check"]}
          checked={remote}
          onChange={(e) => setRemote(e.target.checked)}
        />
        <span className={s["pf-check-box"]}>
          <Ic name="check" />
        </span>
      </label>
      <TextAreaField
        label={t("company.pjResponsibilities")}
        value={responsibilities}
        onChange={setResponsibilities}
        placeholder={t("company.pjResponsibilitiesPh")}
      />
    </Modal>
  );
}
