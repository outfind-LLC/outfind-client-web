"use client";

import { useState, type FormEvent } from "react";
import { BriefcaseBusiness, Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

import {
  useStartJobSearch,
  type JobSearchParams,
} from "@/features/jobs/hooks/use-start-job-search";
import { useT } from "@/providers/i18n-provider";
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
 * The Job Search entry modal: pick a profession and a city. Submitting seeds a
 * Job Finder conversation and routes to its thread. The form is mounted only
 * while open so it always re-seeds from the latest defaults — no state syncing
 * in effects.
 */
export function JobSearchModal({
  open,
  onOpenChange,
  defaultProfession = "",
  defaultCity = "",
}: JobSearchModalProps) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-brand/10 text-brand flex size-8 items-center justify-center rounded-lg">
              <Search className="size-4" />
            </span>
            {t("chat.searchTitle")}
          </DialogTitle>
          <DialogDescription>{t("chat.searchDesc")}</DialogDescription>
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
  const t = useT();
  const [profession, setProfession] = useState(defaultProfession);
  const [city, setCity] = useState(defaultCity);
  const { startSearch, isPending } = useStartJobSearch();

  const canSubmit =
    profession.trim().length > 0 && city.trim().length > 0 && !isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const params: JobSearchParams = { profession, city };
    startSearch(params, (error) =>
      toast.error(
        isApiClientError(error) ? error.message : t("chat.searchError"),
      ),
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="job-profession">{t("chat.professionLabel")}</Label>
        <div className="relative">
          <BriefcaseBusiness className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="job-profession"
            value={profession}
            onChange={(event) => setProfession(event.target.value)}
            placeholder={t("chat.professionPlaceholder")}
            autoFocus
            autoComplete="off"
            maxLength={100}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="job-city">{t("chat.cityLabel")}</Label>
        <div className="relative">
          <MapPin className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="job-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder={t("chat.cityPlaceholder")}
            autoComplete="off"
            maxLength={100}
            className="pl-9"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("chat.cancel")}
        </Button>
        <Button type="submit" variant="brand" disabled={!canSubmit}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("chat.starting")}
            </>
          ) : (
            <>
              <Search className="size-4" />
              {t("chat.searchJobs")}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
