"use client";

import { useEffect, useState } from "react";

import { fetchAdminSubscriptionsOverview } from "@/components/ott/admin/api";
import type { AdminSubscriptionOverview } from "@/components/ott/admin/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminSubscriptionsPanel() {
  const [overview, setOverview] = useState<AdminSubscriptionOverview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        setErrorMessage(null);
        const data = await fetchAdminSubscriptionsOverview();
        setOverview(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load subscription overview.");
      }
    }

    void loadOverview();
  }, []);

  const plans = overview?.plans ?? [];
  const lifecycleRows = overview?.lifecycle ?? [];

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Subscriptions & Plans</h1>
        <p className="text-sm text-ott-text-secondary">
          Configure plan tiers, monitor lifecycle events, and align entitlement policies.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 text-sm text-red-200">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.slug} className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
            <CardHeader>
              <CardDescription className="uppercase tracking-[0.12em]">{plan.slug}</CardDescription>
              <CardTitle className="text-3xl font-semibold">BDT {plan.price}</CardTitle>
              <CardDescription>Monthly billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-ott-text-secondary">
              <p>{plan.activeSubscribers} active subscribers</p>
              <p>{plan.entitlement}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Plan Catalog Controls</CardTitle>
            <CardDescription>
              Maintain pricing, included devices, and entitlement bundles per plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button className="ott-gradient-cta text-white">Create Plan</Button>
              <Button variant="outline" className="border-ott-border-soft">Clone Existing Plan</Button>
              <Button variant="outline" className="border-ott-border-soft">Sync Entitlements</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Entitlement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.slug}>
                    <TableCell>
                      <Badge variant="outline" className="border-ott-border-soft text-ott-text-secondary">
                        {plan.slug}
                      </Badge>
                    </TableCell>
                    <TableCell>BDT {plan.price}</TableCell>
                    <TableCell>{plan.activeSubscribers}</TableCell>
                    <TableCell className="text-ott-text-secondary">{plan.entitlement}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Subscription Lifecycle</CardTitle>
            <CardDescription>Recent movement across subscription statuses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {lifecycleRows.map((row) => (
              <div key={row.event} className="flex items-center justify-between rounded-lg border border-ott-border-soft bg-background/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-ott-text-primary">{row.event}</p>
                  <p className="text-xs text-ott-text-muted">{row.window}</p>
                </div>
                <p className="text-lg font-semibold text-ott-text-primary">{row.count}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
