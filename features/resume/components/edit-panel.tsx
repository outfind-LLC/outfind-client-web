"use client";

import { useState } from "react";

import type {
  AwardItem,
  CertificationItem,
  CustomItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  ReferenceItem,
  ResumeDocument,
  ResumeSection,
  SectionType,
} from "@/interfaces/resume.interface";
import { SECTION_TYPES } from "@/interfaces/resume.interface";
import { newItem, newSection } from "@/features/resume/lib/defaults";
import type { TranslateFn } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";
import { AreaField, Ic, TextField } from "./resume-ui";
import s from "@/features/resume/styles/resume.module.css";

/** English field placeholders (chrome; the resume OUTPUT is localized). */
const PH = {
  fullName: "Full name",
  headline: "Headline — e.g. Senior Nurse",
  email: "Email",
  phone: "Phone",
  location: "City, Country",
  website: "Website",
  summary: "2–4 sentences about your experience and strengths…",
  company: "Company",
  position: "Position",
  loc: "Location",
  start: "Start — e.g. 2021",
  end: "End — e.g. 2024",
  desc: "Short description",
  highlight: "Achievement — use numbers where you can",
  institution: "Institution",
  degree: "Degree",
  field: "Field of study",
  skill: "Skill",
  project: "Project name",
  role: "Your role",
  url: "URL",
  cert: "Certificate name",
  issuer: "Issuer",
  date: "Date",
  language: "Language",
  proficiency: "Level — e.g. Fluent",
  award: "Award title",
  refName: "Name",
  relation: "Relationship",
  contact: "Contact (email / phone)",
  title: "Title",
  subtitle: "Subtitle",
  linkLabel: "Label — e.g. LinkedIn",
  linkUrl: "URL",
};

const SECTION_LABEL: Record<SectionType, MessageKey> = {
  experience: "cv.typeExperience",
  education: "cv.typeEducation",
  skills: "cv.typeSkills",
  projects: "cv.typeProjects",
  certifications: "cv.typeCertifications",
  languages: "cv.typeLanguages",
  awards: "cv.typeAwards",
  references: "cv.typeReferences",
  custom: "cv.typeCustom",
};

export function EditPanel({
  document,
  t,
  onChange,
}: {
  document: ResumeDocument;
  t: TranslateFn;
  onChange: (document: ResumeDocument) => void;
}) {
  const [adding, setAdding] = useState(false);
  const b = document.basics;

  const setBasics = (patch: Partial<typeof b>) =>
    onChange({ ...document, basics: { ...b, ...patch } });
  const setSections = (sections: ResumeSection[]) =>
    onChange({ ...document, sections });
  const updateSection = (id: string, next: ResumeSection) =>
    setSections(document.sections.map((sec) => (sec.id === id ? next : sec)));
  const moveSection = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= document.sections.length) return;
    const next = [...document.sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  return (
    <div>
      {/* Personal info */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <span className={s.cardTitle}>{t("cv.personalInfo")}</span>
        </div>
        <TextField
          value={b.fullName}
          placeholder={PH.fullName}
          maxLength={120}
          onChange={(v) => setBasics({ fullName: v })}
        />
        <TextField
          value={b.headline}
          placeholder={PH.headline}
          maxLength={160}
          onChange={(v) => setBasics({ headline: v })}
        />
        <div className={s.grid2}>
          <TextField
            value={b.email}
            placeholder={PH.email}
            type="email"
            onChange={(v) => setBasics({ email: v })}
          />
          <TextField
            value={b.phone}
            placeholder={PH.phone}
            type="tel"
            onChange={(v) => setBasics({ phone: v })}
          />
          <TextField
            value={b.location}
            placeholder={PH.location}
            onChange={(v) => setBasics({ location: v })}
          />
          <TextField
            value={b.website}
            placeholder={PH.website}
            onChange={(v) => setBasics({ website: v })}
          />
        </div>
      </div>

      {/* Summary */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <span className={s.cardTitle}>{t("cv.summaryLabel")}</span>
        </div>
        <AreaField
          value={b.summary}
          placeholder={PH.summary}
          maxLength={4000}
          rows={4}
          onChange={(v) => setBasics({ summary: v })}
        />
      </div>

      {/* Social links */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <span className={s.cardTitle}>{t("cv.socialLinks")}</span>
        </div>
        {b.socials.map((link, i) => (
          <div key={i} className={s.grid2}>
            <TextField
              value={link.label}
              placeholder={PH.linkLabel}
              maxLength={60}
              onChange={(v) =>
                setBasics({
                  socials: b.socials.map((l, j) =>
                    j === i ? { ...l, label: v } : l,
                  ),
                })
              }
            />
            <div className={s.bulletRow}>
              <TextField
                value={link.url}
                placeholder={PH.linkUrl}
                maxLength={300}
                onChange={(v) =>
                  setBasics({
                    socials: b.socials.map((l, j) =>
                      j === i ? { ...l, url: v } : l,
                    ),
                  })
                }
              />
              <button
                type="button"
                className={s.iconBtn}
                aria-label={t("cv.removeItem")}
                onClick={() =>
                  setBasics({ socials: b.socials.filter((_, j) => j !== i) })
                }
              >
                <Ic name="close" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className={s.addBtn}
          onClick={() =>
            setBasics({ socials: [...b.socials, { label: "", url: "" }] })
          }
        >
          <Ic name="plus" />
          {t("cv.addLink")}
        </button>
      </div>

      {/* Sections */}
      {document.sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          index={index}
          total={document.sections.length}
          t={t}
          onChange={(next) => updateSection(section.id, next)}
          onMove={(dir) => moveSection(index, dir)}
          onRemove={() =>
            setSections(document.sections.filter((s) => s.id !== section.id))
          }
        />
      ))}

      {/* Add section */}
      <div className={s.card}>
        <button
          type="button"
          className={s.addBtn}
          onClick={() => setAdding((v) => !v)}
        >
          <Ic name="plus" />
          {t("cv.addSection")}
        </button>
        {adding ? (
          <div className={s.chooser}>
            {SECTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSections([...document.sections, newSection(type)]);
                  setAdding(false);
                }}
              >
                <Ic name="plusBold" />
                {t(SECTION_LABEL[type])}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  index,
  total,
  t,
  onChange,
  onMove,
  onRemove,
}: {
  section: ResumeSection;
  index: number;
  total: number;
  t: TranslateFn;
  onChange: (section: ResumeSection) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <input
          className={s.cardTitleInput}
          value={section.title}
          maxLength={80}
          aria-label={t("cv.sectionTitle")}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
        <button
          type="button"
          className={s.iconBtn}
          aria-label={section.visible ? t("cv.hide") : t("cv.show")}
          onClick={() => onChange({ ...section, visible: !section.visible })}
        >
          <Ic name={section.visible ? "eye" : "eyeOff"} />
        </button>
        <button
          type="button"
          className={s.iconBtn}
          aria-label={t("cv.moveUp")}
          disabled={index === 0}
          onClick={() => onMove(-1)}
        >
          <Ic name="chevronUp" />
        </button>
        <button
          type="button"
          className={s.iconBtn}
          aria-label={t("cv.moveDown")}
          disabled={index === total - 1}
          onClick={() => onMove(1)}
        >
          <Ic name="chevronDown" />
        </button>
        <button
          type="button"
          className={s.iconBtn}
          aria-label={t("cv.removeItem")}
          onClick={onRemove}
        >
          <Ic name="trash" />
        </button>
      </div>
      <SectionEditor section={section} t={t} onChange={onChange} />
    </div>
  );
}

function SectionEditor({
  section,
  t,
  onChange,
}: {
  section: ResumeSection;
  t: TranslateFn;
  onChange: (section: ResumeSection) => void;
}) {
  switch (section.type) {
    case "skills":
      return (
        <SkillsEditor
          items={section.items}
          t={t}
          onItems={(items) => onChange({ ...section, items })}
        />
      );
    case "experience":
      return (
        <ListEditor
          items={section.items}
          type="experience"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <>
              <div className={s.grid2}>
                <TextField
                  value={item.position}
                  placeholder={PH.position}
                  onChange={(v) => patch({ position: v })}
                />
                <TextField
                  value={item.company}
                  placeholder={PH.company}
                  onChange={(v) => patch({ company: v })}
                />
                <TextField
                  value={item.location}
                  placeholder={PH.loc}
                  onChange={(v) => patch({ location: v })}
                />
                <TextField
                  value={item.startDate}
                  placeholder={PH.start}
                  maxLength={24}
                  onChange={(v) => patch({ startDate: v })}
                />
              </div>
              {!item.current ? (
                <TextField
                  value={item.endDate}
                  placeholder={PH.end}
                  maxLength={24}
                  onChange={(v) => patch({ endDate: v })}
                />
              ) : null}
              <label className={s.checkRow}>
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(e) => patch({ current: e.target.checked })}
                />
                {t("cv.current")}
              </label>
              <AreaField
                value={item.description}
                placeholder={PH.desc}
                onChange={(v) => patch({ description: v })}
              />
              <BulletsEditor
                value={item.highlights}
                t={t}
                placeholder={PH.highlight}
                onChange={(highlights) => patch({ highlights })}
              />
            </>
          )}
        />
      );
    case "education":
      return (
        <ListEditor
          items={section.items}
          type="education"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <>
              <TextField
                value={item.degree}
                placeholder={PH.degree}
                onChange={(v) => patch({ degree: v })}
              />
              <TextField
                value={item.institution}
                placeholder={PH.institution}
                onChange={(v) => patch({ institution: v })}
              />
              <div className={s.grid2}>
                <TextField
                  value={item.fieldOfStudy}
                  placeholder={PH.field}
                  onChange={(v) => patch({ fieldOfStudy: v })}
                />
                <TextField
                  value={item.startDate}
                  placeholder={PH.start}
                  maxLength={24}
                  onChange={(v) => patch({ startDate: v })}
                />
              </div>
              <TextField
                value={item.endDate}
                placeholder={PH.end}
                maxLength={24}
                onChange={(v) => patch({ endDate: v })}
              />
            </>
          )}
        />
      );
    case "projects":
      return (
        <ListEditor
          items={section.items}
          type="projects"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <>
              <TextField
                value={item.name}
                placeholder={PH.project}
                onChange={(v) => patch({ name: v })}
              />
              <div className={s.grid2}>
                <TextField
                  value={item.role}
                  placeholder={PH.role}
                  onChange={(v) => patch({ role: v })}
                />
                <TextField
                  value={item.url}
                  placeholder={PH.url}
                  maxLength={300}
                  onChange={(v) => patch({ url: v })}
                />
              </div>
              <AreaField
                value={item.description}
                placeholder={PH.desc}
                onChange={(v) => patch({ description: v })}
              />
              <BulletsEditor
                value={item.highlights}
                t={t}
                placeholder={PH.highlight}
                onChange={(highlights) => patch({ highlights })}
              />
            </>
          )}
        />
      );
    case "certifications":
      return (
        <ListEditor
          items={section.items}
          type="certifications"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <>
              <TextField
                value={item.name}
                placeholder={PH.cert}
                onChange={(v) => patch({ name: v })}
              />
              <div className={s.grid2}>
                <TextField
                  value={item.issuer}
                  placeholder={PH.issuer}
                  onChange={(v) => patch({ issuer: v })}
                />
                <TextField
                  value={item.date}
                  placeholder={PH.date}
                  maxLength={24}
                  onChange={(v) => patch({ date: v })}
                />
              </div>
            </>
          )}
        />
      );
    case "languages":
      return (
        <ListEditor
          items={section.items}
          type="languages"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <div className={s.grid2}>
              <TextField
                value={item.language}
                placeholder={PH.language}
                onChange={(v) => patch({ language: v })}
              />
              <TextField
                value={item.proficiency}
                placeholder={PH.proficiency}
                onChange={(v) => patch({ proficiency: v })}
              />
            </div>
          )}
        />
      );
    case "awards":
      return (
        <ListEditor
          items={section.items}
          type="awards"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <>
              <TextField
                value={item.title}
                placeholder={PH.award}
                onChange={(v) => patch({ title: v })}
              />
              <div className={s.grid2}>
                <TextField
                  value={item.issuer}
                  placeholder={PH.issuer}
                  onChange={(v) => patch({ issuer: v })}
                />
                <TextField
                  value={item.date}
                  placeholder={PH.date}
                  maxLength={24}
                  onChange={(v) => patch({ date: v })}
                />
              </div>
              <AreaField
                value={item.description}
                placeholder={PH.desc}
                onChange={(v) => patch({ description: v })}
              />
            </>
          )}
        />
      );
    case "references":
      return (
        <ListEditor
          items={section.items}
          type="references"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <>
              <TextField
                value={item.name}
                placeholder={PH.refName}
                onChange={(v) => patch({ name: v })}
              />
              <div className={s.grid2}>
                <TextField
                  value={item.relation}
                  placeholder={PH.relation}
                  onChange={(v) => patch({ relation: v })}
                />
                <TextField
                  value={item.contact}
                  placeholder={PH.contact}
                  onChange={(v) => patch({ contact: v })}
                />
              </div>
            </>
          )}
        />
      );
    case "custom":
      return (
        <ListEditor
          items={section.items}
          type="custom"
          t={t}
          onItems={(items) => onChange({ ...section, items })}
          render={(item, patch) => (
            <>
              <div className={s.grid2}>
                <TextField
                  value={item.title}
                  placeholder={PH.title}
                  onChange={(v) => patch({ title: v })}
                />
                <TextField
                  value={item.subtitle}
                  placeholder={PH.subtitle}
                  onChange={(v) => patch({ subtitle: v })}
                />
              </div>
              <TextField
                value={item.date}
                placeholder={PH.date}
                maxLength={24}
                onChange={(v) => patch({ date: v })}
              />
              <AreaField
                value={item.description}
                placeholder={PH.desc}
                onChange={(v) => patch({ description: v })}
              />
              <BulletsEditor
                value={item.highlights}
                t={t}
                placeholder={PH.highlight}
                onChange={(highlights) => patch({ highlights })}
              />
            </>
          )}
        />
      );
  }
}

/** Skills = a flat tag list edited as comma-friendly rows. */
function SkillsEditor({
  items,
  t,
  onItems,
}: {
  items: string[];
  t: TranslateFn;
  onItems: (items: string[]) => void;
}) {
  return (
    <>
      {items.map((skill, i) => (
        <div key={i} className={s.bulletRow}>
          <input
            className={s.input}
            value={skill}
            placeholder={PH.skill}
            maxLength={80}
            aria-label={PH.skill}
            onChange={(e) =>
              onItems(items.map((sk, j) => (j === i ? e.target.value : sk)))
            }
          />
          <button
            type="button"
            className={s.iconBtn}
            aria-label={t("cv.removeItem")}
            onClick={() => onItems(items.filter((_, j) => j !== i))}
          >
            <Ic name="close" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className={s.addBtn}
        onClick={() => onItems([...items, ""])}
      >
        <Ic name="plus" />
        {t("cv.addItem")}
      </button>
    </>
  );
}

/** Generic repeatable-item editor (move / duplicate / remove + add). */
type ItemMap = {
  experience: ExperienceItem;
  education: EducationItem;
  projects: ProjectItem;
  certifications: CertificationItem;
  languages: LanguageItem;
  awards: AwardItem;
  references: ReferenceItem;
  custom: CustomItem;
};
function ListEditor<K extends keyof ItemMap>({
  items,
  type,
  t,
  onItems,
  render,
}: {
  items: ItemMap[K][];
  type: K;
  t: TranslateFn;
  onItems: (items: ItemMap[K][]) => void;
  render: (
    item: ItemMap[K],
    patch: (patch: Partial<ItemMap[K]>) => void,
  ) => React.ReactNode;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onItems(next);
  };
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className={s.itemBlock}>
          <div className={s.itemBar}>
            <span className={s.itemLabel}>{i + 1}</span>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.moveUp")}
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              <Ic name="chevronUp" />
            </button>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.moveDown")}
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
            >
              <Ic name="chevronDown" />
            </button>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.duplicateItem")}
              onClick={() =>
                onItems([
                  ...items.slice(0, i + 1),
                  { ...item },
                  ...items.slice(i + 1),
                ])
              }
            >
              <Ic name="copy" />
            </button>
            <button
              type="button"
              className={s.iconBtn}
              aria-label={t("cv.removeItem")}
              onClick={() => onItems(items.filter((_, j) => j !== i))}
            >
              <Ic name="trash" />
            </button>
          </div>
          {render(item, (patch) =>
            onItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it))),
          )}
        </div>
      ))}
      <button
        type="button"
        className={s.addBtn}
        onClick={() => onItems([...items, newItem(type) as ItemMap[K]])}
      >
        <Ic name="plus" />
        {t("cv.addItem")}
      </button>
    </>
  );
}

/** Editable bullet list (experience/project/custom highlights). */
function BulletsEditor({
  value,
  t,
  placeholder,
  onChange,
}: {
  value: string[];
  t: TranslateFn;
  placeholder: string;
  onChange: (value: string[]) => void;
}) {
  return (
    <>
      {value.map((bullet, i) => (
        <div key={i} className={s.bulletRow}>
          <input
            className={s.input}
            value={bullet}
            placeholder={placeholder}
            maxLength={500}
            aria-label={placeholder}
            onChange={(e) =>
              onChange(value.map((b, j) => (j === i ? e.target.value : b)))
            }
          />
          <button
            type="button"
            className={s.iconBtn}
            aria-label={t("cv.removeItem")}
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <Ic name="close" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className={s.addBtn}
        onClick={() => onChange([...value, ""])}
      >
        <Ic name="plus" />
        {t("cv.addItem")}
      </button>
    </>
  );
}
