"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";
import type { CompanyVerifyForm } from "@/features/vacancies/hooks/use-employer-verify";
import { EvChev, EvLock, EvTick } from "./verify-icons";
import s from "@/features/vacancies/styles/employer-verify.module.css";

type FieldType = "text" | "email" | "tel" | "number" | "select" | "textarea";

type FieldKey = keyof CompanyVerifyForm;

interface FieldDef {
  key: FieldKey;
  label: string;
  ph?: string;
  type: FieldType;
  req?: boolean;
  wide?: boolean;
  min?: number;
  optionKeys?: string[];
}
type Row = { sec: string } | FieldDef;

const INDUSTRY_KEYS = [
  "indLogistics",
  "indManufacturing",
  "indRetail",
  "indConstruction",
  "indHospitality",
  "indIT",
  "indHealthcare",
  "indAgriculture",
  "indOther",
];
const SIZE_KEYS = ["size1", "size2", "size3", "size4", "size5"];

/** Mirrors the prototype's `FIELDS` (employer-verify.js). */
const ROWS: Row[] = [
  { sec: "secDetails" },
  { key: "name", label: "fName", ph: "fNamePh", type: "text", req: true, wide: true },
  { key: "regId", label: "fRegId", ph: "fRegIdPh", type: "text", req: true },
  { key: "industry", label: "fIndustry", type: "select", optionKeys: INDUSTRY_KEYS, req: true },
  { key: "size", label: "fSize", type: "select", optionKeys: SIZE_KEYS, req: true },
  { key: "founded", label: "fFounded", ph: "fFoundedPh", type: "number", req: true },
  { key: "website", label: "fWebsite", ph: "fWebsitePh", type: "text" },
  { sec: "secLocation" },
  { key: "country", label: "fCountry", ph: "fCountryPh", type: "text", req: true },
  { key: "city", label: "fCity", ph: "fCityPh", type: "text", req: true },
  { key: "address", label: "fAddress", ph: "fAddressPh", type: "text", req: true, wide: true },
  { sec: "secContact" },
  { key: "contactName", label: "fContactName", ph: "fContactNamePh", type: "text", req: true },
  { key: "email", label: "fEmail", ph: "fEmailPh", type: "email", req: true },
  { key: "phone", label: "fPhone", ph: "fPhonePh", type: "tel", req: true },
  { sec: "secAbout" },
  { key: "about", label: "fAbout", ph: "fAboutPh", type: "textarea", req: true, wide: true, min: 40 },
];

const FIELDS = ROWS.filter((r): r is FieldDef => "key" in r);

const EMPTY: CompanyVerifyForm = {
  name: "",
  regId: "",
  industry: "",
  size: "",
  founded: "",
  website: "",
  country: "",
  city: "",
  address: "",
  contactName: "",
  email: "",
  phone: "",
  about: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const YEAR_RE = /^(19|20)\d{2}$/;

/**
 * Forced first-time employer onboarding. Collects the company profile the design
 * requires before hiring; submission goes to admins for approval. The scrim is
 * non-dismissible by design — the employer can't reach the app until it's filled.
 */
export function CompanySetupModal({
  onSubmit,
  submitting,
}: {
  onSubmit: (form: CompanyVerifyForm) => void | Promise<void>;
  submitting: boolean;
}) {
  const { t } = useI18n();
  const tv = (k: string, params?: Record<string, string | number>) =>
    t(`employerVerify.${k}` as MessageKey, params);

  const [values, setValues] = useState<CompanyVerifyForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
    };
  }, []);

  const fieldError = (f: FieldDef, value: string): string => {
    const v = value.trim();
    if (f.req && !v) return tv("errRequired");
    if (!v) return "";
    if (f.type === "email" && !EMAIL_RE.test(v)) return tv("errEmail");
    if (f.key === "founded" && !YEAR_RE.test(v)) return tv("errYear");
    if (f.min && v.length < f.min)
      return tv("errMin", { n: f.min, len: v.length });
    return "";
  };

  const allValid = FIELDS.every((f) => !fieldError(f, values[f.key]));

  const setField = (f: FieldDef, value: string) => {
    setValues((prev) => ({ ...prev, [f.key]: value }));
    if (errors[f.key] && !fieldError(f, value)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[f.key];
        return next;
      });
    }
  };

  const handleSubmit = () => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    for (const f of FIELDS) {
      const err = fieldError(f, values[f.key]);
      if (err) nextErrors[f.key] = err;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) void onSubmit(values);
  };

  return (
    <div
      className={cn(s["ev-scrim"], shown && s.show)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ev-ob-title"
    >
      <div className={s["ev-modal"]}>
        <div className={s["ev-scroll"]}>
          <div className={s["ev-kicker"]}>{tv("kicker")}</div>
          <h2 className={s["ev-h2"]} id="ev-ob-title">
            {tv("setupTitle")}
          </h2>
          <p className={s["ev-card-sub"]}>{tv("setupSub")}</p>
          <div className={s["ev-body"]}>
            {ROWS.map((row, i) =>
              "sec" in row ? (
                <div key={`sec-${i}`} className={s["ev-sec"]}>
                  {tv(row.sec)}
                </div>
              ) : (
                <Field
                  key={row.key}
                  def={row}
                  value={values[row.key]}
                  error={errors[row.key]}
                  onChange={(v) => setField(row, v)}
                  tv={tv}
                />
              ),
            )}
          </div>
        </div>
        <div className={s["ev-foot"]}>
          <div className={s["ev-foot-note"]}>
            <EvLock />
            <span>{tv("footNote")}</span>
          </div>
          <button
            type="button"
            className={cn(s["ev-btn"], s["ev-btn-prim"])}
            disabled={!allValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? tv("submitting") : tv("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  def,
  value,
  error,
  onChange,
  tv,
}: {
  def: FieldDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  tv: (k: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div
      className={cn(
        s["ev-field"],
        def.wide && s["ev-field-wide"],
        error && s["has-err"],
      )}
    >
      <label className={s["ev-flabel"]}>
        {tv(def.label)}
        {def.req ? (
          <span className={s["ev-req"]}>*</span>
        ) : (
          <span className={s["ev-opt"]}>{tv("optional")}</span>
        )}
      </label>
      {def.type === "select" ? (
        <EvDropdown
          value={value}
          placeholder={tv("selectPh")}
          options={(def.optionKeys ?? []).map((k) => tv(k))}
          onChange={onChange}
        />
      ) : def.type === "textarea" ? (
        <textarea
          className={s["ev-ta"]}
          rows={4}
          placeholder={def.ph ? tv(def.ph) : ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={s["ev-inp"]}
          type={def.type}
          placeholder={def.ph ? tv(def.ph) : ""}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <div className={s["ev-err"]}>{error}</div>
    </div>
  );
}

/** Custom dropdown matching the wizard's `.dd` (option value === its label). */
function EvDropdown({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className={cn(s["ev-dd"], open && s.open)} ref={ref}>
      <button
        type="button"
        className={s["ev-dd-btn"]}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={cn(s["ev-dd-val"], !value && s.ph)}>
          {value || placeholder}
        </span>
        <span className={s["ev-dd-chev"]}>
          <EvChev />
        </span>
      </button>
      <div className={s["ev-dd-menu"]} role="listbox">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={cn(s["ev-dd-opt"], opt === value && s.sel)}
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
          >
            <span>{opt}</span>
            <span className={s["ev-dd-tick"]}>
              <EvTick />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
