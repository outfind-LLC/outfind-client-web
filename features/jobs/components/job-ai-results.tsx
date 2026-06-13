"use client";

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Star,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import type {
  CoverLetterResult,
  GeneratedCv,
  InterviewPrepResult,
  JobInsightsResult,
  MatchScoreResult,
} from "@/interfaces/worker-ai.interface";

// ─── Shared primitives ────────────────────────────────────────────────────────

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Couldn't copy");
  }
}

function CopyButton({ text }: { text: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0"
      onClick={() => copy(text)}
    >
      <Copy className="size-3.5" />
      Copy
    </Button>
  );
}

/** A labelled block with the small uppercase section header used throughout. */
function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Pills({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge
          key={item}
          variant="secondary"
          className="max-w-full font-normal whitespace-normal break-words"
        >
          {item}
        </Badge>
      ))}
    </div>
  );
}

function Bullets({
  items,
  icon: Icon,
  tone = "muted",
}: {
  items: string[];
  icon?: typeof Check;
  tone?: "muted" | "success" | "warning";
}) {
  if (items.length === 0) return null;
  const color =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted-foreground";
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm leading-relaxed">
          {Icon ? (
            <Icon className={cn("mt-0.5 size-4 shrink-0", color)} />
          ) : (
            <span className="bg-primary/60 mt-2 size-1.5 shrink-0 rounded-full" />
          )}
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── CV ───────────────────────────────────────────────────────────────────────

function cvToText(cv: GeneratedCv): string {
  const lines: string[] = [cv.fullName, cv.headline, "", cv.summary, ""];
  if (cv.skills.length) lines.push(`Skills: ${cv.skills.join(", ")}`, "");
  if (cv.experience.length) {
    lines.push("EXPERIENCE");
    for (const e of cv.experience) {
      lines.push(
        `${e.position} — ${e.company} (${e.startDate} – ${e.endDate ?? "Present"})`,
      );
      if (e.description) lines.push(e.description);
      for (const h of e.highlights) lines.push(`• ${h}`);
      lines.push("");
    }
  }
  if (cv.education.length) {
    lines.push("EDUCATION");
    for (const ed of cv.education) {
      lines.push(
        `${[ed.degree, ed.fieldOfStudy, ed.institution].filter(Boolean).join(", ")} (${ed.startDate} – ${ed.endDate ?? "Present"})`,
      );
    }
  }
  return lines.join("\n").trim();
}

export function CvResult({ cv }: { cv: GeneratedCv }) {
  const contact = [
    cv.contact.email && { icon: Mail, value: cv.contact.email },
    cv.contact.phone && { icon: Phone, value: cv.contact.phone },
    cv.contact.location && { icon: MapPin, value: cv.contact.location },
  ].filter(Boolean) as { icon: typeof Mail; value: string }[];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg leading-tight font-semibold break-words">
            {cv.fullName}
          </h3>
          {cv.headline ? (
            <p className="text-muted-foreground text-sm break-words">
              {cv.headline}
            </p>
          ) : null}
        </div>
        <CopyButton text={cvToText(cv)} />
      </div>

      {contact.length > 0 ? (
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {contact.map(({ icon: Icon, value }) => (
            <span key={value} className="flex min-w-0 items-center gap-1.5">
              <Icon className="size-3.5 shrink-0" />
              <span className="min-w-0 break-words">{value}</span>
            </span>
          ))}
        </div>
      ) : null}

      {cv.summary ? (
        <p className="text-foreground/90 text-sm leading-relaxed break-words">
          {cv.summary}
        </p>
      ) : null}

      {cv.skills.length > 0 ? (
        <Section title="Skills">
          <Pills items={cv.skills} />
        </Section>
      ) : null}

      {cv.experience.length > 0 ? (
        <Section title="Experience">
          <ul className="space-y-4">
            {cv.experience.map((exp, index) => (
              <li key={index} className="min-w-0 space-y-1">
                <p className="text-sm font-medium break-words">
                  {exp.position}
                  {exp.company ? ` · ${exp.company}` : ""}
                </p>
                <p className="text-muted-foreground text-xs">
                  {exp.startDate} – {exp.endDate ?? "Present"}
                </p>
                {exp.description ? (
                  <p className="text-foreground/90 text-sm break-words">
                    {exp.description}
                  </p>
                ) : null}
                {exp.highlights.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {exp.highlights.map((h, hi) => (
                      <li key={hi} className="flex gap-2 text-sm">
                        <span className="bg-primary/60 mt-2 size-1.5 shrink-0 rounded-full" />
                        <span className="min-w-0 break-words">{h}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv.education.length > 0 ? (
        <Section title="Education">
          <ul className="space-y-2">
            {cv.education.map((ed, index) => (
              <li key={index} className="min-w-0 text-sm">
                <span className="font-medium break-words">
                  {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(", ") ||
                    ed.institution ||
                    "Studies"}
                </span>
                {ed.institution && (ed.degree || ed.fieldOfStudy) ? (
                  <span className="text-muted-foreground"> · {ed.institution}</span>
                ) : null}
                <span className="text-muted-foreground text-xs">
                  {" "}
                  ({ed.startDate} – {ed.endDate ?? "Present"})
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv.languages.length > 0 ? (
        <Section title="Languages">
          <Pills items={cv.languages.map((l) => `${l.language} — ${l.proficiency}`)} />
        </Section>
      ) : null}
    </div>
  );
}

// ─── Cover letter ──────────────────────────────────────────────────────────────

export function CoverLetterResultView({
  result,
}: {
  result: CoverLetterResult;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Your cover letter
        </h4>
        <CopyButton text={result.coverLetter} />
      </div>
      <div className="bg-muted/40 text-foreground/90 rounded-xl border p-4 text-sm leading-relaxed break-words whitespace-pre-wrap sm:p-5">
        {result.coverLetter}
      </div>
    </div>
  );
}

// ─── Match score ───────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-brand";
  return "text-destructive";
}

export function MatchScoreResultView({
  result,
}: {
  result: MatchScoreResult;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "text-4xl leading-none font-bold",
            scoreColor(result.overallScore),
          )}
        >
          {result.overallScore}
          <span className="text-muted-foreground text-lg">/100</span>
        </div>
        <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-brand h-full rounded-full transition-all"
            style={{ width: `${result.overallScore}%` }}
          />
        </div>
      </div>

      {result.summary ? (
        <p className="text-foreground/90 text-sm leading-relaxed break-words">
          {result.summary}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {result.matchingSkills.length > 0 ? (
          <Section title="Matching skills">
            <div className="flex flex-wrap gap-1.5">
              {result.matchingSkills.map((s) => (
                <Badge
                  key={s}
                  variant="success"
                  className="max-w-full font-normal whitespace-normal break-words"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </Section>
        ) : null}
        {result.missingSkills.length > 0 ? (
          <Section title="Skills to grow">
            <div className="flex flex-wrap gap-1.5">
              {result.missingSkills.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="max-w-full font-normal whitespace-normal break-words"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </Section>
        ) : null}
      </div>

      {result.strengths.length > 0 ? (
        <Section title="Strengths">
          <Bullets items={result.strengths} icon={Check} tone="success" />
        </Section>
      ) : null}
      {result.areasForImprovement.length > 0 ? (
        <Section title="Areas to improve">
          <Bullets items={result.areasForImprovement} />
        </Section>
      ) : null}
    </div>
  );
}

// ─── Job insights ──────────────────────────────────────────────────────────────

export function InsightsResult({ result }: { result: JobInsightsResult }) {
  return (
    <div className="space-y-5">
      {result.summary ? (
        <p className="text-foreground/90 text-sm leading-relaxed break-words">
          {result.summary}
        </p>
      ) : null}

      {result.salaryInsight ? (
        <div className="border-brand/30 bg-brand/5 flex items-start gap-3 rounded-xl border p-4">
          <Wallet className="text-brand mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-semibold tracking-wide uppercase">
              Salary insight
            </p>
            <p className="text-foreground/90 text-sm break-words">
              {result.salaryInsight}
            </p>
          </div>
        </div>
      ) : null}

      {result.keySkills.length > 0 ? (
        <Section title="Key skills">
          <Pills items={result.keySkills} />
        </Section>
      ) : null}
      {result.keyRequirements.length > 0 ? (
        <Section title="Requirements">
          <Bullets items={result.keyRequirements} icon={Check} />
        </Section>
      ) : null}
      {result.responsibilities.length > 0 ? (
        <Section title="Responsibilities">
          <Bullets items={result.responsibilities} />
        </Section>
      ) : null}
      {result.highlights.length > 0 ? (
        <Section title="Highlights">
          <Bullets items={result.highlights} icon={Star} tone="success" />
        </Section>
      ) : null}
      {result.redFlags.length > 0 ? (
        <Section title="Watch for">
          <Bullets items={result.redFlags} icon={AlertTriangle} tone="warning" />
        </Section>
      ) : null}
    </div>
  );
}

// ─── Interview prep ─────────────────────────────────────────────────────────────

function QaItem({
  question,
  answer,
  category,
  defaultOpen,
}: {
  question: string;
  answer: string;
  category: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="border-border/70 overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-muted/50 flex w-full items-start gap-2 px-4 py-3 text-left transition-colors"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1 space-y-1">
          {category ? (
            <Badge variant="outline" className="font-normal">
              {category}
            </Badge>
          ) : null}
          <p className="text-sm font-medium break-words">{question}</p>
        </div>
        <ChevronDown
          className={cn(
            "text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="border-border/60 bg-muted/30 border-t px-4 py-3">
          <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
            Suggested answer
          </p>
          <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function InterviewPrepResultView({
  result,
}: {
  result: InterviewPrepResult;
}) {
  return (
    <div className="space-y-5">
      {result.focusAreas.length > 0 ? (
        <Section title="Focus areas">
          <Pills items={result.focusAreas} />
        </Section>
      ) : null}

      {result.questions.length > 0 ? (
        <Section title={`Likely questions (${result.questions.length})`}>
          <div className="space-y-2">
            {result.questions.map((q, index) => (
              <QaItem
                key={index}
                question={q.question}
                answer={q.suggestedAnswer}
                category={q.category}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {result.tips.length > 0 ? (
        <Section title="Preparation tips">
          <Bullets items={result.tips} icon={Lightbulb} tone="warning" />
        </Section>
      ) : null}
    </div>
  );
}
