"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  useReportEmployer,
  useSubmitEmployerSignal,
} from "@/features/trust/hooks/use-trust";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type { EmployerSignalType } from "@/interfaces/trust.interface";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";

interface ReportEmployerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employerId: string;
  companyName?: string | null;
}

const SIGNALS: { value: EmployerSignalType; label: string }[] = [
  { value: "SAFE", label: "Safe" },
  { value: "SUSPICIOUS", label: "Suspicious" },
  { value: "SCAM", label: "Scam" },
];

/** Report an employer and optionally leave a behaviour signal. */
export function ReportEmployerDialog({
  open,
  onOpenChange,
  employerId,
  companyName,
}: ReportEmployerDialogProps) {
  const report = useReportEmployer();
  const signal = useSubmitEmployerSignal();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [signalType, setSignalType] = useState<EmployerSignalType | null>(null);

  const reset = () => {
    setReason("");
    setDetails("");
    setSignalType(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason.trim() || report.isPending) return;
    report.mutate(
      {
        employerId,
        reason: reason.trim(),
        details: details.trim() || null,
      },
      {
        onSuccess: () => {
          if (signalType) {
            signal.mutate({ employerId, payload: { type: signalType } });
          }
          toast.success("Report submitted. Thank you.");
          reset();
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Couldn't submit the report",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Report {companyName ? companyName : "employer"}
          </DialogTitle>
          <DialogDescription>
            Help keep Peoplor safe. Reports are reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Your experience (optional)</Label>
            <div className="flex gap-2">
              {SIGNALS.map((option) => {
                const active = signalType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSignalType(active ? null : option.value)
                    }
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-reason">
              Reason<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="report-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Misleading job posting"
              maxLength={200}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="What happened?"
              rows={4}
              maxLength={4000}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={!reason.trim() || report.isPending}
            >
              {report.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Submit report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
