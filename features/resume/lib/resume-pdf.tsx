/**
 * Real PDF export via @react-pdf/renderer — produces a genuine, selectable,
 * ATS-parseable PDF FILE (not a screenshot/print) named after the worker.
 *
 * This module is imported DYNAMICALLY at click time only, so @react-pdf never
 * runs during SSR and its weight stays out of the initial bundle. Fonts are
 * fetched once from a CDN (Roboto + PT Serif — both cover Latin AND Cyrillic
 * so RU/UZ resumes render correctly); if the fetch fails we fall back to the
 * built-in Helvetica/Times so a download never throws.
 */
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";

import type {
  ResumeDocument,
  ResumeSection,
  StyleConfig,
} from "@/interfaces/resume.interface";

const FONT_URLS = {
  sansR:
    "https://cdn.jsdelivr.net/npm/@expo-google-fonts/roboto/Roboto_400Regular.ttf",
  sansB:
    "https://cdn.jsdelivr.net/npm/@expo-google-fonts/roboto/Roboto_700Bold.ttf",
  sansI:
    "https://cdn.jsdelivr.net/npm/@expo-google-fonts/roboto/Roboto_400Regular_Italic.ttf",
  serifR:
    "https://cdn.jsdelivr.net/npm/@expo-google-fonts/pt-serif/PTSerif_400Regular.ttf",
  serifB:
    "https://cdn.jsdelivr.net/npm/@expo-google-fonts/pt-serif/PTSerif_700Bold.ttf",
};

let fontState: "unknown" | "custom" | "builtin" = "unknown";

Font.registerHyphenationCallback((word) => [word]);

async function toBlobUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

async function ensureFonts(): Promise<"custom" | "builtin"> {
  if (fontState !== "unknown") return fontState;
  try {
    const [sansR, sansB, sansI, serifR, serifB] = await Promise.all([
      toBlobUrl(FONT_URLS.sansR),
      toBlobUrl(FONT_URLS.sansB),
      toBlobUrl(FONT_URLS.sansI),
      toBlobUrl(FONT_URLS.serifR),
      toBlobUrl(FONT_URLS.serifB),
    ]);
    Font.register({
      family: "ResumeSans",
      fonts: [
        { src: sansR },
        { src: sansB, fontWeight: "bold" },
        { src: sansI, fontStyle: "italic" },
      ],
    });
    Font.register({
      family: "ResumeSerif",
      fonts: [{ src: serifR }, { src: serifB, fontWeight: "bold" }],
    });
    fontState = "custom";
  } catch {
    fontState = "builtin";
  }
  return fontState;
}

const SERIF_FONTS = new Set(["Georgia", "Times New Roman", "Merriweather"]);

function familyFor(style: StyleConfig, state: "custom" | "builtin"): string {
  const serif = SERIF_FONTS.has(style.fontFamily);
  if (state === "custom") return serif ? "ResumeSerif" : "ResumeSans";
  return serif ? "Times-Roman" : "Helvetica";
}

const SIDE_TYPES = new Set<ResumeSection["type"]>([
  "skills",
  "languages",
  "certifications",
  "awards",
  "references",
  "education",
]);

const PAD = { sm: 30, md: 42, lg: 54 };

function buildStyles(style: StyleConfig, family: string) {
  const k = style.fontScale;
  const ink = style.primaryColor;
  const accent = style.accentColor;
  return StyleSheet.create({
    page: {
      fontFamily: family,
      fontSize: 9.5 * k,
      lineHeight: style.lineHeight,
      color: "#333333",
      paddingVertical: PAD[style.margin],
      paddingHorizontal: PAD[style.margin],
    },
    banner: {
      backgroundColor: accent,
      marginHorizontal: -PAD[style.margin],
      marginTop: -PAD[style.margin],
      paddingHorizontal: PAD[style.margin],
      paddingVertical: 22,
      marginBottom: style.sectionSpacing,
    },
    header: { marginBottom: style.sectionSpacing },
    name: { fontSize: 20 * k, fontWeight: "bold", color: ink },
    nameBanner: { fontSize: 20 * k, fontWeight: "bold", color: "#ffffff" },
    headline: {
      fontSize: 10.5 * k,
      fontWeight: "bold",
      color: accent,
      marginTop: 3,
    },
    headlineBanner: {
      fontSize: 10.5 * k,
      fontWeight: "bold",
      color: "#ffffff",
      marginTop: 3,
    },
    contacts: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
      color: "#666666",
      fontSize: 8.5 * k,
    },
    contactsBanner: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
      color: "#ffffff",
      fontSize: 8.5 * k,
    },
    contact: { marginRight: 14 },
    body: { flexDirection: "row" },
    colMain: { flexGrow: 1, flexBasis: 0 },
    colSide: { width: "34%", marginLeft: 22 },
    section: { marginTop: style.sectionSpacing },
    secTitle: {
      fontSize: 9 * k,
      fontWeight: "bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      borderBottomWidth: 1.2,
      borderBottomColor: "#e2e5ea",
      paddingBottom: 3,
      marginBottom: 7,
    },
    item: { marginBottom: 9 },
    itemHead: { flexDirection: "row", justifyContent: "space-between" },
    itemTitle: { fontSize: 10 * k, fontWeight: "bold", color: ink },
    itemWhere: { color: "#333333" },
    dates: { fontSize: 8.5 * k, color: "#888888" },
    summary: { color: "#333333" },
    bulletRow: { flexDirection: "row", marginTop: 2 },
    bulletDot: { width: 10 },
    bulletText: { flexGrow: 1, flexBasis: 0 },
    rowSub: { color: "#777777", fontSize: 8.8 * k },
    tagWrap: { flexDirection: "row", flexWrap: "wrap" },
    tag: { marginRight: 10, marginBottom: 3 },
    splitRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 3,
    },
  });
}

type S = ReturnType<typeof buildStyles>;

function join(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
}
function range(start: string, end: string, current?: boolean): string {
  const to = current ? "Present" : end;
  return [start, to].filter(Boolean).join(" – ");
}

function Sec({
  title,
  s,
  children,
}: {
  title: string;
  s: S;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section} wrap={false}>
      <Text style={s.secTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullets({ items, s }: { items: string[]; s: S }) {
  const visible = items.filter(Boolean);
  if (!visible.length) return null;
  return (
    <>
      {visible.map((b, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

function SectionBody({ section, s }: { section: ResumeSection; s: S }) {
  switch (section.type) {
    case "skills":
      return (
        <View style={s.tagWrap}>
          {section.items
            .filter((x) => x.trim())
            .map((skill, i) => (
              <Text key={i} style={s.tag}>
                {skill}
              </Text>
            ))}
        </View>
      );
    case "experience":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.item} wrap={false}>
              <View style={s.itemHead}>
                <Text style={s.itemTitle}>
                  {it.position || "Role"}
                  {it.company ? (
                    <Text style={s.itemWhere}> · {it.company}</Text>
                  ) : null}
                </Text>
                <Text style={s.dates}>
                  {range(it.startDate, it.endDate, it.current)}
                </Text>
              </View>
              {it.description ? (
                <Text style={s.summary}>{it.description}</Text>
              ) : null}
              <Bullets items={it.highlights} s={s} />
            </View>
          ))}
        </>
      );
    case "education":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.item} wrap={false}>
              <View style={s.itemHead}>
                <Text style={s.itemTitle}>
                  {it.degree || it.institution || "Education"}
                  {it.degree && it.institution ? (
                    <Text style={s.itemWhere}> · {it.institution}</Text>
                  ) : null}
                </Text>
                <Text style={s.dates}>{range(it.startDate, it.endDate)}</Text>
              </View>
              {it.fieldOfStudy ? (
                <Text style={s.rowSub}>{it.fieldOfStudy}</Text>
              ) : null}
              {it.description ? (
                <Text style={s.summary}>{it.description}</Text>
              ) : null}
            </View>
          ))}
        </>
      );
    case "projects":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.item} wrap={false}>
              <View style={s.itemHead}>
                <Text style={s.itemTitle}>
                  {it.name || "Project"}
                  {it.role ? (
                    <Text style={s.itemWhere}> · {it.role}</Text>
                  ) : null}
                </Text>
                <Text style={s.dates}>{range(it.startDate, it.endDate)}</Text>
              </View>
              {it.description ? (
                <Text style={s.summary}>{it.description}</Text>
              ) : null}
              <Bullets items={it.highlights} s={s} />
            </View>
          ))}
        </>
      );
    case "certifications":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.splitRow}>
              <Text style={s.itemTitle}>{it.name || "Certificate"}</Text>
              <Text style={s.dates}>{join(it.issuer, it.date)}</Text>
            </View>
          ))}
        </>
      );
    case "languages":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.splitRow}>
              <Text>{it.language}</Text>
              <Text style={s.rowSub}>{it.proficiency}</Text>
            </View>
          ))}
        </>
      );
    case "awards":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.item} wrap={false}>
              <View style={s.itemHead}>
                <Text style={s.itemTitle}>{it.title || "Award"}</Text>
                <Text style={s.dates}>{join(it.issuer, it.date)}</Text>
              </View>
              {it.description ? (
                <Text style={s.summary}>{it.description}</Text>
              ) : null}
            </View>
          ))}
        </>
      );
    case "references":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.splitRow}>
              <Text style={s.itemTitle}>{it.name || "Reference"}</Text>
              <Text style={s.rowSub}>{join(it.relation, it.contact)}</Text>
            </View>
          ))}
        </>
      );
    case "custom":
      return (
        <>
          {section.items.map((it, i) => (
            <View key={i} style={s.item} wrap={false}>
              <View style={s.itemHead}>
                <Text style={s.itemTitle}>
                  {it.title || "Item"}
                  {it.subtitle ? (
                    <Text style={s.itemWhere}> · {it.subtitle}</Text>
                  ) : null}
                </Text>
                <Text style={s.dates}>{it.date}</Text>
              </View>
              {it.description ? (
                <Text style={s.summary}>{it.description}</Text>
              ) : null}
              <Bullets items={it.highlights} s={s} />
            </View>
          ))}
        </>
      );
  }
}

function ResumePdf({
  document,
  style,
  state,
}: {
  document: ResumeDocument;
  style: StyleConfig;
  state: "custom" | "builtin";
}) {
  const s = buildStyles(style, familyFor(style, state));
  const b = document.basics;
  const banner = style.headerStyle === "banner";
  const center = style.headerStyle === "center";
  const visible = document.sections.filter((sec) => sec.visible);
  const twoCol = style.layout === "two-column";
  const main = twoCol
    ? visible.filter((sec) => !SIDE_TYPES.has(sec.type))
    : visible;
  const side = twoCol ? visible.filter((sec) => SIDE_TYPES.has(sec.type)) : [];

  const contacts = [b.email, b.phone, b.location, b.website]
    .filter(Boolean)
    .concat(b.socials.map((x) => x.label || x.url).filter(Boolean));

  const header = (
    <View
      style={[
        banner ? s.banner : s.header,
        center ? { alignItems: "center" } : {},
      ]}
    >
      <Text style={banner ? s.nameBanner : s.name}>
        {b.fullName || "Your Name"}
      </Text>
      {b.headline ? (
        <Text style={banner ? s.headlineBanner : s.headline}>{b.headline}</Text>
      ) : null}
      {contacts.length ? (
        <View style={banner ? s.contactsBanner : s.contacts}>
          {contacts.map((c, i) => (
            <Text key={i} style={s.contact}>
              {c}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );

  const summary = b.summary ? (
    <Sec title="Summary" s={s}>
      <Text style={s.summary}>{b.summary}</Text>
    </Sec>
  ) : null;

  const renderSections = (list: ResumeSection[]) =>
    list.map((sec) => (
      <Sec key={sec.id} title={sec.title} s={s}>
        <SectionBody section={sec} s={s} />
      </Sec>
    ));

  return (
    <Document>
      <Page size={style.pageSize === "letter" ? "LETTER" : "A4"} style={s.page}>
        {header}
        {twoCol ? (
          <View style={s.body}>
            <View style={s.colMain}>
              {summary}
              {renderSections(main)}
            </View>
            <View style={s.colSide}>{renderSections(side)}</View>
          </View>
        ) : (
          <View>
            {summary}
            {renderSections(main)}
          </View>
        )}
      </Page>
    </Document>
  );
}

function fileName(document: ResumeDocument, name: string): string {
  const base = (document.basics.fullName || name || "Resume")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  return `${base || "Resume"}_CV.pdf`;
}

/** Generate and download the resume as a real, named PDF file. */
export async function downloadResumePdf(
  document: ResumeDocument,
  style: StyleConfig,
  name: string,
): Promise<void> {
  const state = await ensureFonts();
  const blob = await pdf(
    <ResumePdf document={document} style={style} state={state} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = fileName(document, name);
  window.document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
