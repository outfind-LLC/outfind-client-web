import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
        {/* Apply saved accent (preset or custom hex) + font before paint, so
            there's no flash of the default theme. Mirrors the accent/font hooks. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var r=document.documentElement,s=r.style,a=localStorage.getItem('peoplor-accent');if(a){if(/^#[0-9a-fA-F]{6}$/.test(a)){var n=parseInt(a.slice(1),16),L=(0.2126*((n>>16)&255)+0.7152*((n>>8)&255)+0.0722*(n&255))/255,fg=L>0.6?'#0a0a0f':'#ffffff',t='color-mix(in oklab,'+a+' 14%,var(--background))';['--primary','--brand','--brand-2','--ring','--sidebar-primary','--sidebar-ring'].forEach(function(k){s.setProperty(k,a)});s.setProperty('--primary-foreground',fg);s.setProperty('--sidebar-primary-foreground',fg);s.setProperty('--accent',t);s.setProperty('--accent-foreground',a);s.setProperty('--sidebar-accent',t);s.setProperty('--sidebar-accent-foreground',a);}else{r.dataset.accent=a;}}var f=localStorage.getItem('peoplor-font');if(f)r.dataset.font=f;}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
