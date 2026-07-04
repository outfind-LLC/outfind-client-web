import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CvTemplateRender } from "@/features/cv/templates/cv-render";
import { env } from "@/lib/env";
import type { PublicCv } from "@/interfaces/cv.interface";
import s from "./public-cv.module.css";

/**
 * Public CV — peoplor.uz/cv/<slug>. No auth shell; the backend serves DATA
 * only (a whitelisted projection) and this page renders it with the worker's
 * saved template. Unknown or unpublished slugs 404.
 */

async function fetchPublicCv(slug: string): Promise<PublicCv | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/cv/public/${slug}`, {
      // Public data; short cache keeps the page fast without going stale.
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: PublicCv | null };
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
  const cv = await fetchPublicCv(slug);
  if (!cv) return { title: "CV — Peoplor" };
  return {
    title: `${cv.fullName} — CV | Peoplor`,
    description: cv.headline || cv.summary.slice(0, 160),
  };
}

export default async function PublicCvPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cv = await fetchPublicCv(slug);
  if (!cv) notFound();

  return (
    <div className={s.page}>
      <header className={s.head}>
        <Link href="/" className={s.wordmark}>
          Peoplor
        </Link>
        <Link href="/" className={s.cta}>
          Find a job
        </Link>
      </header>
      <main className={s.main}>
        <CvTemplateRender template={cv.template} content={cv} />
      </main>
      <footer className={s.foot}>
        Powered by <Link href="/">Peoplor</Link>
      </footer>
    </div>
  );
}
