/** Static product metadata shared across metadata, header, and footer. */
export const siteConfig = {
  name: "Outfind AI",
  tagline: "Where careers move forward",
  description:
    "Outfind AI is a modern recruitment platform. Discover the right opportunities, build a standout resume, prepare for interviews, and hire — all in one place.",
  url: "https://outfind.ai",
  ogImage: "/peoplor-mark.svg",
  links: {
    telegram: "https://t.me/outfindai",
  },
} as const;

export type SiteConfig = typeof siteConfig;
