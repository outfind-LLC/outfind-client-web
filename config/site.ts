/** Static product metadata shared across metadata, header, and footer. */
export const siteConfig = {
  name: "Peoplor",
  tagline: "Where careers move forward",
  description:
    "Peoplor is a modern recruitment platform. Discover the right opportunities, build a standout resume, prepare for interviews, and hire — all in one place.",
  url: "https://peoplor.com",
  ogImage: "/peoplor-mark.svg",
  links: {
    telegram: "https://t.me/peoplor",
  },
} as const;

export type SiteConfig = typeof siteConfig;
