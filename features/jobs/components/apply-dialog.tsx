"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useGenerateCoverLetter } from "@/features/ai-tools/hooks/use-worker-ai";
import type { JobCardData } from "@/features/chat/types/job";
import { isApiClientError } from "@/lib/api/error";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobCardData;
  submitting: boolean;
  onSubmit: (coverLetter: string, shareContact: boolean) => void;
}

/**
 * The application flow: write a cover letter (or generate one with AI), then
 * submit. The letter is optional — the worker can send without one — but it's
 * the heart of the flow, so it leads. On submit the parent applies and opens the
 * conversation with this letter pinned as the first message.
 */
export function ApplyDialog({
  open,
  onOpenChange,
  job,
  submitting,
  onSubmit,
}: ApplyDialogProps) {
  const [draft, setDraft] = useState("");
  const [shareContact, setShareContact] = useState(false);
  const generate = useGenerateCoverLetter();
  const canGenerate = Boolean(job.description?.trim());

  const onGenerate = () => {
    if (generate.isPending || !canGenerate) return;
    generate.mutate(
      {
        jobDescription: job.description ?? "",
        jobTitle: job.title,
        companyName: job.company ?? undefined,
      },
      {
        onSuccess: (result) => setDraft(result.coverLetter),
        onError: (error) =>
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Couldn't generate a cover letter",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 border-b p-5 text-left">
          <DialogTitle className="pr-6 text-lg leading-tight break-words">
            Apply to {job.title}
          </DialogTitle>
          <DialogDescription>
            {job.company
              ? `Add a cover letter for ${job.company} — or generate one with AI.`
              : "Add a cover letter — or generate one with AI."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="cover-letter" className="text-sm font-medium">
              Cover letter{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGenerate}
              disabled={generate.isPending || !canGenerate}
            >
              {generate.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generate.isPending ? "Generating…" : "Generate with AI"}
            </Button>
          </div>

          <Textarea
            id="cover-letter"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Introduce yourself and explain why you're a great fit for this role…"
            rows={10}
            maxLength={6000}
            disabled={generate.isPending}
          />
          {!canGenerate ? (
            <p className="text-muted-foreground text-xs">
              AI generation isn&apos;t available for this role — it has no
              description. You can still write your own.
            </p>
          ) : null}

          <label
            htmlFor="share-contact"
            className="bg-muted/40 flex cursor-pointer items-start gap-3 rounded-xl border p-3"
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium">Let the employer contact you directly</p>
              <p className="text-muted-foreground text-xs">
                Shares your email and phone with this employer so they can reach
                you outside the platform. You can leave this off and chat here
                instead.
              </p>
            </div>
            <Switch
              id="share-contact"
              checked={shareContact}
              onCheckedChange={setShareContact}
              disabled={generate.isPending}
              className="mt-0.5"
            />
          </label>
        </div>

        <DialogFooter className="gap-2 border-t p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            onClick={() => onSubmit(draft, shareContact)}
            disabled={submitting || generate.isPending}
            className="w-full sm:w-auto"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Send application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
