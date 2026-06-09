"use client";

import { useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useUpdateJobSearchInfo } from "@/features/profile/hooks/use-worker-profile-mutations";
import { useSession } from "@/features/auth/hooks/use-session";
import { isApiClientError } from "@/lib/api/error";
import { FormField, SwitchField, TagInput } from "@/components/form/form-fields";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

/**
 * First-time worker profile setup. A worker has no profile until they save the
 * core job-search fields — the backend `PATCH /worker/profile/job-search`
 * endpoint upserts (creates) the profile. Once it succeeds the worker-profile
 * query is invalidated and the full editable profile view takes over, where the
 * rest (experience, education, languages, personal info) can be managed.
 */
export function WorkerProfileSetup() {
  const { user } = useSession();
  const mutation = useUpdateJobSearchInfo();

  const [profession, setProfession] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [skills, setSkills] = useState<string[]>([]);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("0");
  const [abroad, setAbroad] = useState(false);

  const firstName = user?.name?.split(" ")[0];

  const submit = () => {
    if (!profession.trim()) {
      toast.error("Tell us your profession to get started");
      return;
    }
    mutation.mutate(
      {
        profession: profession.trim(),
        targetCountries,
        experienceYears: Math.max(0, parseInt(experienceYears, 10) || 0),
        abroadExperience: abroad,
        skills,
        expectedSalaryMin: Math.max(0, parseInt(salaryMin, 10) || 0),
      },
      {
        onSuccess: () => toast.success("Profile created — let's fill in the rest"),
        onError: (error) =>
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Couldn't create your profile — please try again",
          ),
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="bg-card rounded-2xl border p-6 sm:p-8">
        <span className="bg-brand/10 text-brand mb-4 flex size-12 items-center justify-center rounded-2xl">
          <UserRound className="size-6" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight">
          {firstName ? `Let's set up your profile, ${firstName}` : "Set up your profile"}
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Start with the basics so we can match you to the right jobs. You can
          add your experience, education and languages right after.
        </p>

        <div className="mt-6 space-y-5">
          <FormField label="Profession" htmlFor="profession" required>
            <Input
              id="profession"
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              placeholder="e.g. Truck Driver"
              autoFocus
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Years of experience" htmlFor="experienceYears">
              <Input
                id="experienceYears"
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(event) => setExperienceYears(event.target.value)}
              />
            </FormField>
            <FormField
              label="Expected salary (min, USD/mo)"
              htmlFor="salaryMin"
            >
              <Input
                id="salaryMin"
                type="number"
                min={0}
                value={salaryMin}
                onChange={(event) => setSalaryMin(event.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Skills" hint="Press Enter to add each skill">
            <TagInput
              value={skills}
              onChange={setSkills}
              placeholder="e.g. Forklift, CNC"
            />
          </FormField>

          <FormField
            label="Target countries"
            hint="Where you'd like to work (optional)"
          >
            <TagInput
              value={targetCountries}
              onChange={setTargetCountries}
              placeholder="e.g. Germany"
            />
          </FormField>

          <SwitchField
            label="Open to relocating abroad"
            checked={abroad}
            onChange={setAbroad}
          />
        </div>

        <Button
          variant="brand"
          size="lg"
          className="mt-6 w-full"
          onClick={submit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating profile…
            </>
          ) : (
            "Create my profile"
          )}
        </Button>
      </div>
    </div>
  );
}
