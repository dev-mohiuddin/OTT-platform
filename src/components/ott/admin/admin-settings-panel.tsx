"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchAdminFeatureFlags,
  saveAdminFeatureFlags,
} from "@/components/ott/admin/api";
import type { AdminFeatureFlag } from "@/components/ott/admin/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function AdminSettingsPanel() {
  const [flags, setFlags] = useState<AdminFeatureFlag[]>([]);
  const [initialFlags, setInitialFlags] = useState<AdminFeatureFlag[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setMessage(null);

      const data = await fetchAdminFeatureFlags();
      setFlags(data);
      setInitialFlags(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load platform settings.");
      setFlags([]);
      setInitialFlags([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFlags();
  }, [loadFlags]);

  const toggleFlag = (id: string, checked: boolean) => {
    setFlags((previous) =>
      previous.map((flag) => (flag.id === id ? { ...flag, enabled: checked } : flag)),
    );
  };

  const handleSaveSettings = async () => {
    if (flags.length === 0) {
      setMessage("No feature flags available to save right now.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setMessage(null);

      const savedFlags = await saveAdminFeatureFlags({
        flags: flags.map((flag) => ({
          id: flag.id,
          enabled: flag.enabled,
        })),
      });

      setFlags(savedFlags);
      setInitialFlags(savedFlags);
      setMessage("Platform settings saved successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save platform settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Platform Settings</h1>
        <p className="text-sm text-ott-text-secondary">
          Control operational feature flags for content, entitlement, and admin monitoring.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="space-y-3 pt-4 text-sm text-red-200">
            <p>{errorMessage}</p>
            <Button
              type="button"
              variant="outline"
              className="border-red-400/50 bg-transparent text-red-100 hover:bg-red-500/20"
              onClick={() => {
                void loadFlags();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Retrying..." : "Retry Loading"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Operational Flags</CardTitle>
          <CardDescription>
            These switches shape how upload and access systems behave in production.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-ott-text-muted">Loading platform flags...</p>
          ) : null}

          {!isLoading && flags.length === 0 ? (
            <p className="text-sm text-ott-text-muted">No platform flags available right now.</p>
          ) : null}

          {!isLoading
            ? flags.map((flag) => (
              <Label
                key={flag.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-ott-border-soft bg-background/40 p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-ott-text-primary">{flag.label}</p>
                  <p className="text-xs text-ott-text-secondary">{flag.description}</p>
                </div>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={(checked) => toggleFlag(flag.id, Boolean(checked))}
                />
              </Label>
            ))
            : null}

          {message ? <p className="text-sm text-emerald-500">{message}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              className="ott-gradient-cta text-white"
              onClick={() => {
                void handleSaveSettings();
              }}
              disabled={isSaving || isLoading || flags.length === 0}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              variant="outline"
              className="border-ott-border-soft"
              onClick={() => {
                setFlags(initialFlags.map((flag) => ({ ...flag })));
                setMessage("Changes reset to last baseline.");
              }}
              disabled={isLoading || initialFlags.length === 0}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
