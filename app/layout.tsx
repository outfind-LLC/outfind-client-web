import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

/** Body face — DM Sans (variable). Self-hosted from the design system. */
const dmSans = localFont({
  src: "./fonts/DMSans-Variable.ttf",
  variable: "--font-dm-sans",
  weight: "100 1000",
  display: "swap",
});

/** Display / heading face — Nunito ExtraBold. */
const nunito = localFont({
  src: "./fonts/Nunito-ExtraBold.ttf",
  variable: "--font-nunito",
  weight: "800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "job search",
    "recruitment platform",
    "resume builder",
    "interview preparation",
    "career platform",
    "hiring",
  ],
  icons: {
    icon: "/peoplor-mark.svg",
    apple: "/peoplor-mark.svg",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
      </head>
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
