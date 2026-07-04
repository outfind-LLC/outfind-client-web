import { cn } from "@/lib/utils";
import type { GeneratedCv } from "@/interfaces/worker-ai.interface";
import type { CvTemplateId } from "@/interfaces/cv.interface";
import s from "./cv-templates.module.css";

/**
 * Renders CV DATA with one of the frontend-owned templates. Used by the
 * builder preview, the print/download flow, and the public /cv/[slug] page —
 * one renderer, so what you preview is exactly what ships.
 */
export function CvTemplateRender({
  template,
  content,
}: {
  template: CvTemplateId;
  content: GeneratedCv;
}) {
  const contact = [
    content.contact?.location,
    content.contact?.email,
    content.contact?.phone,
  ].filter(Boolean) as string[];

  const header = (
    <header>
      <h1 className={s.name}>{content.fullName}</h1>
      {content.headline ? (
        <p className={s.headline}>{content.headline}</p>
      ) : null}
      {contact.length > 0 ? (
        <div className={s.contactRow}>
          {contact.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      ) : null}
    </header>
  );

  const summary = content.summary ? (
    <Section title="Summary">
      <p className={s.summary}>{content.summary}</p>
    </Section>
  ) : null;

  const experience =
    content.experience.length > 0 ? (
      <Section title="Experience">
        {content.experience.map((role, index) => (
          <div key={index} className={s.item}>
            <div className={s.itemHead}>
              <span className={s.itemTitle}>{role.position}</span>
              {role.company ? (
                <span className={s.itemWhere}>{role.company}</span>
              ) : null}
              <span className={s.itemDates}>
                {[role.startDate, role.endDate ?? "—"]
                  .filter(Boolean)
                  .join(" – ")}
              </span>
            </div>
            {role.description ? (
              <p className={s.itemDesc}>{role.description}</p>
            ) : null}
            {role.highlights.length > 0 ? (
              <ul className={s.bullets}>
                {role.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </Section>
    ) : null;

  const skills =
    content.skills.length > 0 ? (
      <Section title="Skills">
        <div className={s.tags}>
          {content.skills.map((skill) => (
            <span key={skill} className={s.tag}>
              {skill}
            </span>
          ))}
        </div>
      </Section>
    ) : null;

  const languages =
    content.languages.length > 0 ? (
      <Section title="Languages">
        {content.languages.map((lang, index) => (
          <div key={index} className={s.langRow}>
            <span>{lang.language}</span>
            <span className={s.langLevel}>{lang.proficiency}</span>
          </div>
        ))}
      </Section>
    ) : null;

  const education =
    content.education.length > 0 ? (
      <Section title="Education">
        {content.education.map((entry, index) => (
          <div key={index} className={s.item}>
            <div className={s.itemHead}>
              <span className={s.itemTitle}>
                {entry.degree ?? entry.institution ?? ""}
              </span>
              {entry.degree && entry.institution ? (
                <span className={s.itemWhere}>{entry.institution}</span>
              ) : null}
              <span className={s.itemDates}>
                {[entry.startDate, entry.endDate ?? "—"]
                  .filter(Boolean)
                  .join(" – ")}
              </span>
            </div>
            {entry.fieldOfStudy ? (
              <p className={s.itemDesc}>{entry.fieldOfStudy}</p>
            ) : null}
          </div>
        ))}
      </Section>
    ) : null;

  if (template === "modern") {
    return (
      <article className={cn(s.sheet, s.modern)}>
        {header}
        <div className={s.modernGrid}>
          <div>
            {summary}
            {experience}
          </div>
          <div>
            {skills}
            {languages}
            {education}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(s.sheet, template === "compact" ? s.compact : s.classic)}
    >
      {header}
      {summary}
      {experience}
      {skills}
      {languages}
      {education}
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

export { s as cvTemplateStyles };
