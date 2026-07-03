"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  FormActions,
  FormField,
  FormGrid,
  FormSection,
  ListField,
} from "@/components/form/form-fields";
import { routes } from "@/config/routes";
import { track } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  useCreateEmployerProfile,
  useParseCompanyProfile,
  useUpdateEmployerProfile,
} from "@/features/profile/hooks/use-employer-profile-mutations";
import type { ParsedCompanyProfile } from "@/features/profile/services/profile.service";
import { useSpeechRecognition } from "@/features/chat/hooks/use-speech-recognition";
import { VoiceInputButton } from "@/features/chat/components/voice-input-button";
import { isApiClientError } from "@/lib/api/error";
import type {
  CreateEmployerProfilePayload,
  EmployerProfile,
  UpdateEmployerProfilePayload,
} from "@/interfaces/employer-profile.interface";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

interface FormState {
  companyName: string;
  companyUrl: string;
  corporateEmail: string;
  companyLogoUrl: string;
  companySize: string;
  industry: string;
  country: string;
  city: string;
  description: string;
  phone: string;
  website: string;
  verificationDocs: string[];
}

function initialState(profile?: EmployerProfile): FormState {
  return {
    companyName: profile?.companyName ?? "",
    companyUrl: profile?.companyUrl ?? "",
    corporateEmail: profile?.corporateEmail ?? "",
    companyLogoUrl: profile?.companyLogoUrl ?? "",
    companySize: profile?.companySize ?? "",
    industry: profile?.industry ?? "",
    country: profile?.country ?? "",
    city: profile?.city ?? "",
    description: profile?.description ?? "",
    phone: profile?.phone ?? "",
    website: profile?.website ?? "",
    verificationDocs: profile?.verificationDocs ?? [],
  };
}

const trimOrNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const cleanList = (items: string[]): string[] =>
  items.map((item) => item.trim()).filter(Boolean);

/** Create or edit the employer / company profile. One form drives both. */
export function EmployerProfileForm({
  profile,
}: {
  profile?: EmployerProfile;
}) {
  const router = useRouter();
  const isEdit = Boolean(profile);
  const [state, setState] = useState<FormState>(() => initialState(profile));
  const createProfile = useCreateEmployerProfile();
  const updateProfile = useUpdateEmployerProfile();
  const pending = createProfile.isPending || updateProfile.isPending;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  // ── Voice → fields: speak a company description, the AI maps it to the form,
  // the employer reviews/edits, then saves. Only stated fields are filled. ──────
  const parse = useParseCompanyProfile();
  const transcriptRef = useRef("");

  const applyParsed = (data: ParsedCompanyProfile) => {
    if (data.companyName) set("companyName", data.companyName);
    if (data.industry) set("industry", data.industry);
    if (data.companySize) set("companySize", data.companySize);
    if (data.country) set("country", data.country);
    if (data.city) set("city", data.city);
    if (data.description) set("description", data.description);
    if (data.phone) set("phone", data.phone);
    if (data.website) set("website", data.website);
    if (!isEdit && data.corporateEmail)
      set("corporateEmail", data.corporateEmail);
    track(ANALYTICS_EVENTS.VOICE_RECORDING_COMPLETED, { surface: "company" });
    toast.success("Filled in what we heard — review and edit, then save.");
  };

  const runParse = () => {
    const text = transcriptRef.current.trim();
    if (!text) {
      toast.error(
        "Say a bit about your company first, then tap the mic to stop.",
      );
      return;
    }
    parse.mutate(text, {
      onSuccess: applyParsed,
      onError: (error) =>
        toast.error(
          isApiClientError(error)
            ? error.message
            : "Couldn't read your description — please try again.",
        ),
    });
  };

  const speech = useSpeechRecognition({
    onTranscript: (t) => {
      transcriptRef.current = t;
    },
    onError: (code) =>
      toast.error(
        code === "not-allowed"
          ? "Microphone access is blocked — enable it in your browser."
          : code === "no-speech"
            ? "Didn't catch that — try speaking again."
            : "Voice input isn't available right now.",
      ),
  });

  const toggleVoice = () => {
    if (parse.isPending) return;
    if (speech.listening) {
      speech.stop();
      runParse();
    } else {
      transcriptRef.current = "";
      speech.start();
    }
  };

  const onError = (error: unknown) =>
    toast.error(
      isApiClientError(error) ? error.message : "Couldn't save the profile",
    );

  const done = (message: string) => {
    toast.success(message);
    router.push(routes.profile);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    if (!state.companyName.trim() || !state.companyUrl.trim()) {
      toast.error("Company name and URL are required");
      return;
    }
    if (!isEdit && !state.corporateEmail.trim()) {
      toast.error("A corporate email is required");
      return;
    }

    const shared = {
      companyName: state.companyName.trim(),
      companyUrl: state.companyUrl.trim(),
      companyLogoUrl: trimOrNull(state.companyLogoUrl),
      companySize: trimOrNull(state.companySize),
      industry: trimOrNull(state.industry),
      country: trimOrNull(state.country),
      city: trimOrNull(state.city),
      description: trimOrNull(state.description),
      phone: trimOrNull(state.phone),
      website: trimOrNull(state.website),
      verificationDocs: cleanList(state.verificationDocs),
    };

    if (isEdit) {
      const payload: UpdateEmployerProfilePayload = shared;
      updateProfile.mutate(payload, {
        onSuccess: () => done("Profile updated"),
        onError,
      });
    } else {
      const payload: CreateEmployerProfilePayload = {
        ...shared,
        corporateEmail: state.corporateEmail.trim(),
      };
      createProfile.mutate(payload, {
        onSuccess: () => done("Company profile created"),
        onError,
      });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {speech.supported && (
        <div className="bg-muted/40 flex items-center gap-3 rounded-xl border p-3">
          <VoiceInputButton
            listening={speech.listening}
            disabled={parse.isPending}
            onClick={toggleVoice}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {parse.isPending
                ? "Reading your description…"
                : speech.listening
                  ? "Listening — tap to stop"
                  : "Speak to autofill"}
            </p>
            <p className="text-muted-foreground text-xs">
              Describe your company in any language — name, industry, size,
              location, what you do. We'll fill the form; you can edit before
              saving.
            </p>
          </div>
          {parse.isPending && (
            <Loader2 className="text-muted-foreground size-4 animate-spin" />
          )}
        </div>
      )}

      <FormSection title="Company">
        <FormField label="Company name" htmlFor="companyName" required>
          <Input
            id="companyName"
            value={state.companyName}
            onChange={(event) => set("companyName", event.target.value)}
            placeholder="e.g. Northwind Logistics"
            maxLength={200}
            autoFocus
          />
        </FormField>
        <FormGrid>
          <FormField label="Company URL" htmlFor="companyUrl" required>
            <Input
              id="companyUrl"
              type="url"
              value={state.companyUrl}
              onChange={(event) => set("companyUrl", event.target.value)}
              placeholder="https://company.com"
              maxLength={500}
            />
          </FormField>
          <FormField label="Logo URL" htmlFor="companyLogoUrl">
            <Input
              id="companyLogoUrl"
              type="url"
              value={state.companyLogoUrl}
              onChange={(event) => set("companyLogoUrl", event.target.value)}
              placeholder="https://…/logo.png"
              maxLength={500}
            />
          </FormField>
          <FormField label="Industry" htmlFor="industry">
            <Input
              id="industry"
              value={state.industry}
              onChange={(event) => set("industry", event.target.value)}
              placeholder="e.g. Transportation"
              maxLength={100}
            />
          </FormField>
          <FormField label="Company size" htmlFor="companySize">
            <Input
              id="companySize"
              value={state.companySize}
              onChange={(event) => set("companySize", event.target.value)}
              placeholder="e.g. 11–50"
              maxLength={50}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Location">
        <FormGrid>
          <FormField label="Country" htmlFor="country">
            <Input
              id="country"
              value={state.country}
              onChange={(event) => set("country", event.target.value)}
              placeholder="e.g. Poland"
              maxLength={100}
            />
          </FormField>
          <FormField label="City" htmlFor="city">
            <Input
              id="city"
              value={state.city}
              onChange={(event) => set("city", event.target.value)}
              placeholder="e.g. Warsaw"
              maxLength={100}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="About">
        <FormField label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={state.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="What your company does and what it's like to work there."
            rows={5}
            maxLength={4000}
          />
        </FormField>
      </FormSection>

      <FormSection title="Contact">
        <FormField
          label="Corporate email"
          htmlFor="corporateEmail"
          required={!isEdit}
          hint={
            isEdit
              ? "Your corporate email can't be changed after creation."
              : "Used to verify your company."
          }
        >
          <Input
            id="corporateEmail"
            type="email"
            value={state.corporateEmail}
            onChange={(event) => set("corporateEmail", event.target.value)}
            placeholder="hr@company.com"
            maxLength={200}
            disabled={isEdit}
          />
        </FormField>
        <FormGrid>
          <FormField label="Phone" htmlFor="phone">
            <Input
              id="phone"
              value={state.phone}
              onChange={(event) => set("phone", event.target.value)}
              placeholder="+48 …"
              maxLength={30}
            />
          </FormField>
          <FormField label="Public website" htmlFor="website">
            <Input
              id="website"
              type="url"
              value={state.website}
              onChange={(event) => set("website", event.target.value)}
              placeholder="https://…"
              maxLength={500}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Verification">
        <FormField
          label="Verification documents"
          hint="Links to documents (registration, licence) that support verification."
        >
          <ListField
            value={state.verificationDocs}
            onChange={(next) => set("verificationDocs", next)}
            placeholder="https://…"
            addLabel="Add document link"
          />
        </FormField>
      </FormSection>

      <FormActions>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="brand"
          loading={pending}
          className="w-full sm:w-auto"
        >
          {isEdit ? "Save changes" : "Create profile"}
        </Button>
      </FormActions>
    </form>
  );
}
