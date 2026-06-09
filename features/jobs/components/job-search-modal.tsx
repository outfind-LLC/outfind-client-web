"use client";

import { useState, type FormEvent } from "react";
import { BriefcaseBusiness, Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

import { ModelSelector } from "@/features/chat/components/model-selector";
import { useComposerStore } from "@/features/chat/store/composer.store";
import {
  useStartJobSearch,
  type JobSearchParams,
} from "@/features/jobs/hooks/use-start-job-search";
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
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

interface JobSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional seed values (e.g. from the worker profile). */
  defaultProfession?: string;
  defaultCity?: string;
}

/**
 * The Job Search entry modal: pick a profession, an optional city, and an AI
 * model. Submitting seeds a Job Finder conversation and routes to its thread.
 * The form is mounted only while open so it always re-seeds from the latest
 * defaults — no state syncing in effects.
 */
export function JobSearchModal({
  open,
  onOpenChange,
  defaultProfession = "",
  defaultCity = "",
}: JobSearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-brand/10 text-brand flex size-8 items-center justify-center rounded-lg">
              <Search className="size-4" />
            </span>
            Find your next job
          </DialogTitle>
          <DialogDescription>
            Tell us what you&apos;re looking for. We search jobs from across the
            web and rank the best matches for you.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <JobSearchForm
            defaultProfession={defaultProfession}
            defaultCity={defaultCity}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function JobSearchForm({
  defaultProfession,
  defaultCity,
  onClose,
}: {
  defaultProfession: string;
  defaultCity: string;
  onClose: () => void;
}) {
  const storeModel = useComposerStore((s) => s.model);
  const [profession, setProfession] = useState(defaultProfession);
  const [city, setCity] = useState(defaultCity);
  const [model, setModel] = useState<string | null>(storeModel);
  const { startSearch, isPending } = useStartJobSearch();

  const canSubmit = profession.trim().length > 0 && !isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const params: JobSearchParams = { profession, city, model };
    startSearch(params, (error) =>
      toast.error(
        isApiClientError(error) ? error.message : "Couldn't start the search",
      ),
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="job-profession">Profession</Label>
        <div className="relative">
          <BriefcaseBusiness className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="job-profession"
            value={profession}
            onChange={(event) => setProfession(event.target.value)}
            placeholder="e.g. Welder, Nurse, Driver"
            autoFocus
            autoComplete="off"
            maxLength={100}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="job-city">
          City{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="relative">
          <MapPin className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="job-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="e.g. Warsaw, Berlin, Remote"
            autoComplete="off"
            maxLength={100}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>AI model</Label>
        <div className="border-input flex h-10 items-center justify-between rounded-md border px-1.5">
          <span className="text-muted-foreground pl-1.5 text-sm">
            Search engine
          </span>
          <ModelSelector value={model} onChange={setModel} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="brand" disabled={!canSubmit}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Search className="size-4" />
              Search jobs
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
