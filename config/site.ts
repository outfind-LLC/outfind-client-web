/** Static product metadata shared across metadata, header, and footer. */
export const siteConfig = {
  name: "Jobsterr",
  tagline: "Your AI career partner",
  description:
    "Jobsterr is an AI-first job platform. Search jobs, build your CV, prepare for interviews, and hire — all inside one conversation.",
  url: "https://jobsterr.com",
  ogImage: "/full-logo.svg",
  links: {
    telegram: "https://t.me/jobsterr",
  },
} as const;

export type SiteConfig = typeof siteConfig;
