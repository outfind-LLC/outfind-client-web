import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ResumeRender } from "@/features/resume/templates/resume-render";
import { env } from "@/lib/env";
import type { PublicResume } from "@/interfaces/resume.interface";
import s from "./public-cv.module.css";

/**
 * Public resume — outfind.ai/cv/<slug>. No auth shell; the backend serves DATA
 * only (a whitelisted projection) and this page renders it with the worker's
 * saved template. Unknown or unpublished slugs 404.
 */

async function fetchPublicResume(slug: string): Promise<PublicResume | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/cv/public/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: PublicResume | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resume = await fetchPublicResume(slug);
  if (!resume) return { title: "Resume — Outfind AI" };
  const b = resume.document.basics;
  return {
    title: `${b.fullName || resume.name} — Resume | Outfind AI`,
    description: b.headline || b.summary.slice(0, 160),
  };
}

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resume = await fetchPublicResume(slug);
  if (!resume) notFound();

  return (
    <div className={s.page}>
      <header className={s.head}>
        <Link href="/" className={s.wordmark}>
          Outfind AI
        </Link>
        <Link href="/" className={s.cta}>
          Find a job
        </Link>
      </header>
      <main className={s.main}>
        <ResumeRender document={resume.document} style={resume.style} />
      </main>
      <footer className={s.foot}>
        Powered by <Link href="/">Outfind AI</Link>
      </footer>
    </div>
  );
}
