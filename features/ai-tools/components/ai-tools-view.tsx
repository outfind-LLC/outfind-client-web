"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Copy,
  FileText,
  Loader2,
  PenLine,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { TagInput } from "@/components/form/form-fields";
import {
  useBuildCv,
  useGenerateCoverLetter,
  useMatchScore,
} from "@/features/ai-tools/hooks/use-worker-ai";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type { GeneratedCv } from "@/interfaces/worker-ai.interface";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Textarea } from "@/ui/textarea";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Couldn't copy");
  }
}

function errorText(error: unknown): string {
  return isApiClientError(error)
    ? error.message
    : "Something went wrong. Please try again.";
}

/** Worker AI tools: CV builder, cover letter, and job match score. */
export function AiToolsView() {
  return (
    <Tabs defaultValue="cv" className="space-y-6">
      <TabsList>
        <TabsTrigger value="cv">
          <FileText className="size-4" />
          CV Builder
        </TabsTrigger>
        <TabsTrigger value="cover">
          <PenLine className="size-4" />
          Cover Letter
        </TabsTrigger>
        <TabsTrigger value="match">
          <Target className="size-4" />
          Match Score
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cv">
        <CvTool />
      </TabsContent>
      <TabsContent value="cover">
        <CoverLetterTool />
      </TabsContent>
      <TabsContent value="match">
        <MatchScoreTool />
      </TabsContent>
    </Tabs>
  );
}

// ─── CV Builder ─────────────────────────────────────────────────────────────

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

function CvTool() {
  const build = useBuildCv();
  const cv = build.data;

  return (
    <ToolShell
      icon={FileText}
      title="AI CV Builder"
      description="Generate a polished CV from your profile, experience, and skills."
      action={
        <Button
          variant="brand"
          onClick={() => build.mutate()}
          disabled={build.isPending}
        >
          {build.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {cv ? "Regenerate" : "Generate CV"}
        </Button>
      }
    >
      {build.isError ? <ToolError message={errorText(build.error)} /> : null}
      {cv ? (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold break-words">
                {cv.fullName}
              </h3>
              <p className="text-muted-foreground text-sm break-words">
                {cv.headline}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => copyText(cvToText(cv))}
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
          </div>
          {cv.summary ? (
            <p className="text-foreground/90 text-sm leading-relaxed">
              {cv.summary}
            </p>
          ) : null}
          {cv.skills.length ? (
            <Field label="Skills">
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="max-w-full font-normal whitespace-normal break-words"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </Field>
          ) : null}
          {cv.experience.length ? (
            <Field label="Experience">
              <ul className="space-y-3">
                {cv.experience.map((e, i) => (
                  <li key={i} className="min-w-0 space-y-1">
                    <p className="text-sm font-medium break-words">
                      {e.position} · {e.company}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {e.startDate} – {e.endDate ?? "Present"}
                    </p>
                    {e.description ? (
                      <p className="text-foreground/90 text-sm">
                        {e.description}
                      </p>
                    ) : null}
                    {e.highlights.length ? (
                      <ul className="text-foreground/90 list-disc space-y-0.5 pl-5 text-sm">
                        {e.highlights.map((h, hi) => (
                          <li key={hi}>{h}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}
          {cv.education.length ? (
            <Field label="Education">
              <ul className="space-y-2">
                {cv.education.map((ed, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">
                      {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(", ") ||
                        ed.institution}
                    </span>
                    {ed.institution &&
                    (ed.degree || ed.fieldOfStudy) ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {ed.institution}
                      </span>
                    ) : null}
                    <span className="text-muted-foreground text-xs">
                      {" "}
                      ({ed.startDate} – {ed.endDate ?? "Present"})
                    </span>
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}
        </div>
      ) : !build.isError ? (
        <p className="text-muted-foreground text-sm">
          Click generate to build a CV from your saved profile.
        </p>
      ) : null}
    </ToolShell>
  );
}

// ─── Cover Letter ─────────────────────────────────────────────────────────────

function CoverLetterTool() {
  const generate = useGenerateCoverLetter();
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const result = generate.data;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobDescription.trim() || generate.isPending) return;
    generate.mutate({
      jobDescription: jobDescription.trim(),
      jobTitle: jobTitle.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });
  };

  return (
    <ToolShell
      icon={PenLine}
      title="AI Cover Letter"
      description="Paste a job and get a tailored cover letter grounded in your profile."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput
            label="Job title"
            value={jobTitle}
            onChange={setJobTitle}
            placeholder="e.g. Warehouse Operative"
          />
          <FieldInput
            label="Company"
            value={companyName}
            onChange={setCompanyName}
            placeholder="e.g. Northwind"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cl-desc">Job description</Label>
          <Textarea
            id="cl-desc"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description…"
            rows={6}
            maxLength={8000}
          />
        </div>
        <Button
          type="submit"
          variant="brand"
          disabled={!jobDescription.trim() || generate.isPending}
        >
          {generate.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Generate cover letter
        </Button>
      </form>

      {generate.isError ? (
        <ToolError message={errorText(generate.error)} />
      ) : null}
      {result ? (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <Label>Your cover letter</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyText(result.coverLetter)}
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
          </div>
          <div className="bg-muted/40 text-foreground/90 rounded-lg border p-4 text-sm whitespace-pre-wrap">
            {result.coverLetter}
          </div>
        </div>
      ) : null}
    </ToolShell>
  );
}

// ─── Match Score ───────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-brand";
  return "text-destructive";
}

function MatchScoreTool() {
  const match = useMatchScore();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const result = match.data;

  const canSubmit =
    jobTitle.trim().length > 0 &&
    jobDescription.trim().length > 0 &&
    !match.isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    match.mutate({
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      requiredSkills: requiredSkills.length ? requiredSkills : undefined,
      additionalInfo: additionalInfo.trim() || undefined,
    });
  };

  return (
    <ToolShell
      icon={Target}
      title="AI Match Score"
      description="See how well your profile fits a role, with strengths and gaps."
    >
      <form onSubmit={submit} className="space-y-4">
        <FieldInput
          label="Job title"
          required
          value={jobTitle}
          onChange={setJobTitle}
          placeholder="e.g. Long-haul Driver"
        />
        <div className="space-y-1.5">
          <Label htmlFor="ms-desc">
            Job description<span className="text-destructive ml-0.5">*</span>
          </Label>
          <Textarea
            id="ms-desc"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description…"
            rows={5}
            maxLength={8000}
          />
        </div>
        <Field label="Required skills">
          <TagInput
            value={requiredSkills}
            onChange={setRequiredSkills}
            placeholder="Add a required skill"
            max={100}
          />
        </Field>
        <div className="space-y-1.5">
          <Label htmlFor="ms-info">Anything else (optional)</Label>
          <Textarea
            id="ms-info"
            value={additionalInfo}
            onChange={(event) => setAdditionalInfo(event.target.value)}
            placeholder="Context that helps the analysis…"
            rows={2}
            maxLength={4000}
          />
        </div>
        <Button type="submit" variant="brand" disabled={!canSubmit}>
          {match.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Analyze fit
        </Button>
      </form>

      {match.isError ? <ToolError message={errorText(match.error)} /> : null}
      {result ? (
        <div className="mt-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className={cn("text-4xl font-bold", scoreColor(result.overallScore))}>
              {result.overallScore}
              <span className="text-muted-foreground text-lg">/100</span>
            </div>
            <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-brand h-full rounded-full"
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
          </div>
          {result.summary ? (
            <p className="text-foreground/90 text-sm leading-relaxed">
              {result.summary}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <SkillList
              label="Matching skills"
              items={result.matchingSkills}
              variant="success"
            />
            <SkillList
              label="Missing skills"
              items={result.missingSkills}
              variant="outline"
            />
          </div>
          <BulletList label="Strengths" items={result.strengths} />
          <BulletList
            label="Areas to improve"
            items={result.areasForImprovement}
          />
        </div>
      ) : null}
    </ToolShell>
  );
}

// ─── Shared bits ───────────────────────────────────────────────────────────────

function ToolShell({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="text-brand size-4" />
              {title}
            </CardTitle>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ToolError({ message }: { message: string }) {
  return (
    <p className="border-destructive/40 bg-destructive/5 text-destructive mb-4 rounded-lg border p-3 text-sm">
      {message}
    </p>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="text-destructive ml-0.5">*</span> : null}
      </Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SkillList({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "success" | "outline";
}) {
  if (items.length === 0) return null;
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge
            key={item}
            variant={variant}
            className="max-w-full font-normal whitespace-normal break-words"
          >
            {item}
          </Badge>
        ))}
      </div>
    </Field>
  );
}

function BulletList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Field label={label}>
      <ul className="text-foreground/90 list-disc space-y-1 pl-5 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Field>
  );
}
