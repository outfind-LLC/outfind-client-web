import type { CSSProperties, ReactNode } from "react";

import type {
  ResumeDocument,
  ResumeSection,
  StyleConfig,
} from "@/interfaces/resume.interface";
import { cn } from "@/lib/utils";
import s from "./resume-render.module.css";

/** Named font → a safe CSS stack. */
function fontStack(name: string): string {
  switch (name) {
    case "Georgia":
    case "Merriweather":
      return `${name}, Georgia, "Times New Roman", serif`;
    case "Times New Roman":
      return `"Times New Roman", Times, serif`;
    case "Arial":
      return `Arial, Helvetica, sans-serif`;
    case "Roboto":
      return `Roboto, "Helvetica Neue", Arial, sans-serif`;
    case "DM Sans":
      return `"DM Sans", system-ui, sans-serif`;
    default:
      return `Inter, system-ui, -apple-system, sans-serif`;
  }
}

const SIDE_TYPES = new Set<ResumeSection["type"]>([
  "skills",
  "languages",
  "certifications",
  "awards",
  "references",
  "education",
]);

/**
 * Renders resume DATA with the chosen StyleConfig — the single source of truth
 * for every surface (editor preview, public page, print). Purely presentational.
 */
export function ResumeRender({
  document,
  style,
  className,
}: {
  document: ResumeDocument;
  style: StyleConfig;
  className?: string;
}) {
  const vars = {
    "--r-ink": style.primaryColor,
    "--r-accent": style.accentColor,
    "--r-gap": `${style.sectionSpacing}px`,
    fontFamily: fontStack(style.fontFamily),
    fontSize: `${15 * style.fontScale}px`,
    lineHeight: style.lineHeight,
  } as CSSProperties;

  const visible = document.sections.filter((sec) => sec.visible);
  const twoCol = style.layout === "two-column";
  const main = twoCol
    ? visible.filter((sec) => !SIDE_TYPES.has(sec.type))
    : visible;
  const side = twoCol ? visible.filter((sec) => SIDE_TYPES.has(sec.type)) : [];

  const b = document.basics;
  const contacts: { icon: ReactNode; text: string }[] = [];
  if (b.email) contacts.push({ icon: <IconMail />, text: b.email });
  if (b.phone) contacts.push({ icon: <IconPhone />, text: b.phone });
  if (b.location) contacts.push({ icon: <IconPin />, text: b.location });
  if (b.website) contacts.push({ icon: <IconLink />, text: b.website });
  for (const social of b.socials) {
    if (social.label || social.url)
      contacts.push({ icon: <IconLink />, text: social.label || social.url });
  }

  return (
    <article
      className={cn(s.sheet, className)}
      data-template={style.template}
      data-layout={style.layout}
      data-header={style.headerStyle}
      data-margin={style.margin}
      data-page={style.pageSize}
      style={vars}
    >
      <header className={s.header}>
        <div className={s.headTop}>
          {style.showPhoto && b.photoUrl ? (
            <img className={s.avatar} src={b.photoUrl} alt="" />
          ) : null}
          <div>
            <h1 className={s.name}>{b.fullName || "Your Name"}</h1>
            {b.headline ? <p className={s.headline}>{b.headline}</p> : null}
          </div>
        </div>
        {contacts.length > 0 ? (
          <div className={s.contacts}>
            {contacts.map((c, i) => (
              <span key={i} className={s.contact}>
                {style.showIcons ? c.icon : null}
                {c.text}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className={s.body}>
        <div>
          {b.summary ? (
            <section className={s.section}>
              <h2 className={s.secTitle}>Summary</h2>
              <p className={s.summary}>{b.summary}</p>
            </section>
          ) : null}
          {main.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))}
        </div>
        {twoCol ? (
          <div>
            {side.map((section) => (
              <SectionBlock key={section.id} section={section} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SectionBlock({ section }: { section: ResumeSection }) {
  return (
    <section className={s.section}>
      <h2 className={s.secTitle}>{section.title}</h2>
      <SectionItems section={section} />
    </section>
  );
}

function dateRange(start: string, end: string, current?: boolean): string {
  const to = current ? "Present" : end;
  return [start, to].filter(Boolean).join(" – ");
}

function SectionItems({ section }: { section: ResumeSection }) {
  switch (section.type) {
    case "skills":
      return section.items.filter(Boolean).length ? (
        <div className={s.tags}>
          {section.items
            .filter((skill) => skill.trim())
            .map((skill, i) => (
              <span key={i} className={s.tag}>
                {skill}
              </span>
            ))}
        </div>
      ) : (
        <p className={s.empty}>—</p>
      );

    case "experience":
      return (
        <>
          {section.items.map((item, i) => (
            <div key={i} className={s.item}>
              <div className={s.itemHead}>
                <span className={s.itemTitle}>{item.position || "Role"}</span>
                {item.company ? (
                  <span className={s.itemWhere}>
                    · {item.company}
                    {item.location ? `, ${item.location}` : ""}
                  </span>
                ) : null}
                <span className={s.itemDates}>
                  {dateRange(item.startDate, item.endDate, item.current)}
                </span>
              </div>
              {item.description ? (
                <p className={s.itemDesc}>{item.description}</p>
              ) : null}
              {item.highlights.filter(Boolean).length ? (
                <ul className={s.bullets}>
                  {item.highlights.filter(Boolean).map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </>
      );

    case "education":
      return (
        <>
          {section.items.map((item, i) => (
            <div key={i} className={s.item}>
              <div className={s.itemHead}>
                <span className={s.itemTitle}>
                  {item.degree || item.institution || "Education"}
                </span>
                {item.degree && item.institution ? (
                  <span className={s.itemWhere}>· {item.institution}</span>
                ) : null}
                <span className={s.itemDates}>
                  {dateRange(item.startDate, item.endDate)}
                </span>
              </div>
              {item.fieldOfStudy ? (
                <p className={s.rowSub}>{item.fieldOfStudy}</p>
              ) : null}
              {item.description ? (
                <p className={s.itemDesc}>{item.description}</p>
              ) : null}
            </div>
          ))}
        </>
      );

    case "projects":
      return (
        <>
          {section.items.map((item, i) => (
            <div key={i} className={s.item}>
              <div className={s.itemHead}>
                <span className={s.itemTitle}>{item.name || "Project"}</span>
                {item.role ? (
                  <span className={s.itemWhere}>· {item.role}</span>
                ) : null}
                <span className={s.itemDates}>
                  {dateRange(item.startDate, item.endDate)}
                </span>
              </div>
              {item.url ? (
                <a className={s.link} href={item.url}>
                  {item.url}
                </a>
              ) : null}
              {item.description ? (
                <p className={s.itemDesc}>{item.description}</p>
              ) : null}
              {item.highlights.filter(Boolean).length ? (
                <ul className={s.bullets}>
                  {item.highlights.filter(Boolean).map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </>
      );

    case "certifications":
      return (
        <div className={s.rows}>
          {section.items.map((item, i) => (
            <div key={i} className={s.row}>
              <span className={s.itemTitle}>{item.name || "Certificate"}</span>
              <span className={s.itemDates}>
                {[item.issuer, item.date].filter(Boolean).join(" · ")}
              </span>
            </div>
          ))}
        </div>
      );

    case "languages":
      return (
        <div className={s.rows}>
          {section.items.map((item, i) => (
            <div key={i} className={s.row}>
              <span>{item.language}</span>
              <span className={s.rowSub}>{item.proficiency}</span>
            </div>
          ))}
        </div>
      );

    case "awards":
      return (
        <>
          {section.items.map((item, i) => (
            <div key={i} className={s.item}>
              <div className={s.itemHead}>
                <span className={s.itemTitle}>{item.title || "Award"}</span>
                <span className={s.itemDates}>
                  {[item.issuer, item.date].filter(Boolean).join(" · ")}
                </span>
              </div>
              {item.description ? (
                <p className={s.itemDesc}>{item.description}</p>
              ) : null}
            </div>
          ))}
        </>
      );

    case "references":
      return (
        <div className={s.rows}>
          {section.items.map((item, i) => (
            <div key={i} className={s.row}>
              <span className={s.itemTitle}>{item.name || "Reference"}</span>
              <span className={s.rowSub}>
                {[item.relation, item.contact].filter(Boolean).join(" · ")}
              </span>
            </div>
          ))}
        </div>
      );

    case "custom":
      return (
        <>
          {section.items.map((item, i) => (
            <div key={i} className={s.item}>
              <div className={s.itemHead}>
                <span className={s.itemTitle}>{item.title || "Item"}</span>
                {item.subtitle ? (
                  <span className={s.itemWhere}>· {item.subtitle}</span>
                ) : null}
                <span className={s.itemDates}>{item.date}</span>
              </div>
              {item.description ? (
                <p className={s.itemDesc}>{item.description}</p>
              ) : null}
              {item.highlights.filter(Boolean).length ? (
                <ul className={s.bullets}>
                  {item.highlights.filter(Boolean).map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </>
      );
  }
}

/* ---- tiny inline contact icons ---- */
function IconMail() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7.5l8 5 8-5" strokeLinecap="round" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M6.5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 6a2 2 0 0 1 2-2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
