"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createAdminUploadDraft,
  fetchAdminUploadBlueprint,
} from "@/components/ott/admin/api";
import type { AdminUploadBlueprint } from "@/components/ott/admin/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type AccessMode = "subscription" | "ticket" | "hybrid";
type MinimumTier = "free" | "basic" | "standard" | "premium";

interface UploadDraftForm {
  title: string;
  slug: string;
  synopsis: string;
  thumbnailUrl: string;
  sourceFileName: string;
  language: string;
  genre: string;
  qualityPreset: string;
  accessMode: AccessMode;
  minimumTier: MinimumTier;
  ticketPrice: string;
  ticketExpiresAt: string;
  isFeatured: boolean;
  isKidsSafe: boolean;
  allowPreview: boolean;
}

const initialUploadDraftForm: UploadDraftForm = {
  title: "",
  slug: "",
  synopsis: "",
  thumbnailUrl: "",
  sourceFileName: "",
  language: "Bangla",
  genre: "Drama",
  qualityPreset: "4K + 1080p",
  accessMode: "hybrid",
  minimumTier: "standard",
  ticketPrice: "",
  ticketExpiresAt: "",
  isFeatured: true,
  isKidsSafe: false,
  allowPreview: true,
};

function getCompletionPercentage(form: UploadDraftForm): number {
  const checks = [
    form.title.trim().length > 0,
    form.slug.trim().length > 0,
    form.synopsis.trim().length > 0,
    form.thumbnailUrl.trim().length > 0,
    form.sourceFileName.trim().length > 0,
    form.genre.trim().length > 0,
    form.language.trim().length > 0,
  ];

  if (form.accessMode !== "subscription") {
    checks.push(form.ticketPrice.trim().length > 0);
    checks.push(form.ticketExpiresAt.trim().length > 0);
  }

  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function AdminUploadStudioPanel() {
  const [form, setForm] = useState<UploadDraftForm>(initialUploadDraftForm);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blueprint, setBlueprint] = useState<AdminUploadBlueprint | null>(null);

  useEffect(() => {
    async function loadBlueprint() {
      try {
        setErrorMessage(null);
        const data = await fetchAdminUploadBlueprint();
        setBlueprint(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load upload blueprint.");
      }
    }

    void loadBlueprint();
  }, []);

  const completion = useMemo(() => getCompletionPercentage(form), [form]);

  const accessSummary = useMemo(() => {
    if (form.accessMode === "subscription") {
      return `Subscribers with ${form.minimumTier} tier and above can watch this title.`;
    }

    if (form.accessMode === "ticket") {
      return "Ticket purchase is required. Subscription alone will not unlock this title.";
    }

    return "Viewers can unlock access through either subscription tier rules or ticket purchase.";
  }, [form.accessMode, form.minimumTier]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.slug.trim()) {
      setStatusMessage("Title and slug are required before saving the upload draft.");
      return;
    }

    if (!form.thumbnailUrl.trim()) {
      setStatusMessage("Provide a thumbnail URL before continuing.");
      return;
    }

    if (!form.sourceFileName.trim()) {
      setStatusMessage("Select a source video file to create this upload draft.");
      return;
    }

    if (form.accessMode !== "subscription" && !form.ticketExpiresAt) {
      setStatusMessage("Set a fixed ticket expiry for ticket-enabled access modes.");
      return;
    }

    const parsedTicketPrice = form.ticketPrice.trim().length > 0
      ? Number(form.ticketPrice)
      : undefined;

    if (
      form.accessMode !== "subscription"
      && (!parsedTicketPrice || !Number.isFinite(parsedTicketPrice) || parsedTicketPrice <= 0)
    ) {
      setStatusMessage("Provide a valid ticket price for ticket-enabled access modes.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const draft = await createAdminUploadDraft({
        title: form.title.trim(),
        slug: form.slug.trim(),
        synopsis: form.synopsis.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        sourceFileName: form.sourceFileName.trim(),
        language: form.language,
        genre: form.genre,
        qualityPreset: form.qualityPreset,
        accessMode: form.accessMode,
        minimumTier: form.minimumTier,
        ticketPrice: form.accessMode === "subscription" ? undefined : parsedTicketPrice,
        ticketExpiresAt: form.accessMode === "subscription" ? undefined : form.ticketExpiresAt || undefined,
        isFeatured: form.isFeatured,
        isKidsSafe: form.isKidsSafe,
        allowPreview: form.allowPreview,
      });

      setStatusMessage(`Upload draft ${draft.id} saved. Next step: processing and quality checks.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save upload draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Upload Studio</h1>
        <p className="text-sm text-ott-text-secondary">
          Configure video metadata, thumbnail, access policy, and publishing readiness in one workflow.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 text-sm text-red-200">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Video Intake Form</CardTitle>
            <CardDescription>
              This draft powers upload, scheduling, and monetization setup for each title.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="upload-title">Title</Label>
                  <Input
                    id="upload-title"
                    placeholder="Chorki-style original title"
                    value={form.title}
                    onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-slug">Slug</Label>
                  <Input
                    id="upload-slug"
                    placeholder="shadow-city-final-cut"
                    value={form.slug}
                    onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-synopsis">Synopsis</Label>
                <Textarea
                  id="upload-synopsis"
                  placeholder="Describe story, mood, and audience fit"
                  value={form.synopsis}
                  onChange={(event) => setForm((previous) => ({ ...previous, synopsis: event.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="upload-thumbnail">Thumbnail URL</Label>
                  <Input
                    id="upload-thumbnail"
                    placeholder="https://cdn.dristy.local/posters/title.jpg"
                    value={form.thumbnailUrl}
                    onChange={(event) => setForm((previous) => ({ ...previous, thumbnailUrl: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-file">Source Video</Label>
                  <Input
                    id="upload-file"
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        sourceFileName: event.target.files?.[0]?.name ?? "",
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="upload-language">Language</Label>
                  <Select
                    value={form.language}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        language: value ?? previous.language,
                      }))
                    }
                  >
                    <SelectTrigger id="upload-language" className="w-full border-ott-border-soft">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {(blueprint?.languages ?? ["Bangla", "English", "Hindi"]).map((language) => (
                        <SelectItem key={language} value={language}>{language}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-genre">Genre</Label>
                  <Select
                    value={form.genre}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        genre: value ?? previous.genre,
                      }))
                    }
                  >
                    <SelectTrigger id="upload-genre" className="w-full border-ott-border-soft">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {(blueprint?.genres ?? ["Drama", "Thriller", "Comedy"]).map((genre) => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-quality">Quality Preset</Label>
                  <Select
                    value={form.qualityPreset}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        qualityPreset: value ?? previous.qualityPreset,
                      }))
                    }
                  >
                    <SelectTrigger id="upload-quality" className="w-full border-ott-border-soft">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {(blueprint?.qualityPresets ?? ["4K + 1080p", "1080p + 720p", "720p only"]).map((preset) => (
                        <SelectItem key={preset} value={preset}>{preset}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl border border-ott-border-soft bg-background/40 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-ott-text-muted">
                  Access and Monetization
                </p>

                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="upload-access">Access Mode</Label>
                    <Select
                      value={form.accessMode}
                      onValueChange={(value) =>
                        setForm((previous) => ({
                          ...previous,
                          accessMode: (value as AccessMode | null) ?? previous.accessMode,
                        }))
                      }
                    >
                      <SelectTrigger id="upload-access" className="w-full border-ott-border-soft">
                        <SelectValue placeholder="Select access mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {(blueprint?.accessModes ?? ["subscription", "ticket", "hybrid"]).map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode === "subscription" ? "Subscription only" : mode === "ticket" ? "Ticket only" : "Subscription or Ticket"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-tier">Minimum Tier</Label>
                    <Select
                      value={form.minimumTier}
                      onValueChange={(value) =>
                        setForm((previous) => ({
                          ...previous,
                          minimumTier: (value as MinimumTier | null) ?? previous.minimumTier,
                        }))
                      }
                    >
                      <SelectTrigger id="upload-tier" className="w-full border-ott-border-soft">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {(blueprint?.minimumTiers ?? ["free", "basic", "standard", "premium"]).map((tier) => (
                          <SelectItem key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-ticket-price">Ticket Price (BDT)</Label>
                    <Input
                      id="upload-ticket-price"
                      type="number"
                      placeholder="89"
                      value={form.ticketPrice}
                      onChange={(event) => setForm((previous) => ({ ...previous, ticketPrice: event.target.value }))}
                      disabled={form.accessMode === "subscription"}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="upload-ticket-expiry">Ticket Expiry (Fixed)</Label>
                  <Input
                    id="upload-ticket-expiry"
                    type="datetime-local"
                    value={form.ticketExpiresAt}
                    onChange={(event) => setForm((previous) => ({ ...previous, ticketExpiresAt: event.target.value }))}
                    disabled={form.accessMode === "subscription"}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Label className="flex items-center justify-between rounded-lg border border-ott-border-soft p-3 text-sm">
                  <span>Feature on dashboard carousel</span>
                  <Switch
                    checked={form.isFeatured}
                    onCheckedChange={(checked) => setForm((previous) => ({ ...previous, isFeatured: Boolean(checked) }))}
                  />
                </Label>

                <Label className="flex items-center justify-between rounded-lg border border-ott-border-soft p-3 text-sm">
                  <span>Kids-safe profile visibility</span>
                  <Switch
                    checked={form.isKidsSafe}
                    onCheckedChange={(checked) => setForm((previous) => ({ ...previous, isKidsSafe: Boolean(checked) }))}
                  />
                </Label>

                <Label className="flex items-center justify-between rounded-lg border border-ott-border-soft p-3 text-sm">
                  <span>Trailer preview before unlock</span>
                  <Switch
                    checked={form.allowPreview}
                    onCheckedChange={(checked) => setForm((previous) => ({ ...previous, allowPreview: Boolean(checked) }))}
                  />
                </Label>
              </div>

              {statusMessage ? (
                <p className="text-sm text-emerald-500">{statusMessage}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="ott-gradient-cta text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Upload Draft"}
                </Button>
                <Button type="button" variant="outline" className="border-ott-border-soft">Validate Metadata</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Draft Readiness</CardTitle>
              <CardDescription>Completeness score for processing and release pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={completion}>
                <ProgressLabel>Metadata Completion</ProgressLabel>
                <ProgressValue>{(_, value) => `${value ?? completion}%`}</ProgressValue>
              </Progress>

              <div className="rounded-lg border border-ott-border-soft bg-background/40 p-3 text-xs text-ott-text-secondary">
                Upload file: {form.sourceFileName || "No file selected"}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Access Policy Preview</CardTitle>
              <CardDescription>Flexible entitlement is evaluated from this policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                  {form.accessMode}
                </Badge>
                <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                  Tier {form.minimumTier}
                </Badge>
                {form.accessMode !== "subscription" ? (
                  <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                    Ticket expiry fixed
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-ott-text-secondary">{accessSummary}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
