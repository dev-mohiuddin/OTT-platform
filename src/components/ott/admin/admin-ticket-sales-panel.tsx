"use client";

import { useEffect, useState } from "react";

import {
  createAdminTicketOffer,
  fetchAdminTicketSalesOverview,
} from "@/components/ott/admin/api";
import type { AdminTicketSalesOverview } from "@/components/ott/admin/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminTicketSalesPanel() {
  const [overview, setOverview] = useState<AdminTicketSalesOverview | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadOverview() {
      try {
        setErrorMessage(null);
        const data = await fetchAdminTicketSalesOverview();
        setOverview(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load ticket sales overview.");
      }
    }

    void loadOverview();
  }, []);

  const offers = overview?.offers ?? [];

  const grossRevenue = overview?.summary.grossRevenue
    ?? offers.reduce((total, offer) => total + offer.price * offer.sold, 0);

  const activeOffers = overview?.summary.activeOffers
    ?? offers.filter((offer) => offer.status === "active").length;

  const handleCreateOffer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !price.trim() || !expiresAt.trim()) {
      setMessage("Title, price, and fixed expiry are required.");
      return;
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage("Enter a valid positive price.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setMessage(null);

      await createAdminTicketOffer({
        title: title.trim(),
        price: parsedPrice,
        expiresAt,
      });

      const refreshedOverview = await fetchAdminTicketSalesOverview();
      setOverview(refreshedOverview);
      setMessage(`Ticket offer created for ${title.trim()}.`);
      setTitle("");
      setPrice("");
      setExpiresAt("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create ticket offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-ott-text-primary">Ticket Sales</h1>
        <p className="text-sm text-ott-text-secondary">
          Launch fixed-expiry ticket campaigns and monitor pay-per-view performance.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 text-sm text-red-200">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Active offers</CardDescription>
            <CardTitle className="text-3xl font-semibold">{activeOffers}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Estimated ticket revenue</CardDescription>
            <CardTitle className="text-3xl font-semibold">BDT {grossRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.4fr]">
        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create Ticket Offer</CardTitle>
            <CardDescription>
              Set one-time access with fixed expiry for high-value content drops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateOffer}>
              <div className="space-y-2">
                <Label htmlFor="ticket-title">Title</Label>
                <Input
                  id="ticket-title"
                  placeholder="Title for ticket campaign"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticket-price">Price (BDT)</Label>
                  <Input
                    id="ticket-price"
                    type="number"
                    placeholder="89"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-expiry">Fixed Expiry</Label>
                  <Input
                    id="ticket-expiry"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                  />
                </div>
              </div>

              {message ? <p className="text-sm text-emerald-500">{message}</p> : null}

              <Button type="submit" className="ott-gradient-cta text-white" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Offer"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-ott-border-soft bg-background/45 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Live and Expired Offers</CardTitle>
            <CardDescription>
              Monitor sales performance and offer windows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-ott-text-primary">{offer.title}</p>
                        <p className="text-xs text-ott-text-muted">{offer.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>BDT {offer.price}</TableCell>
                    <TableCell>{offer.sold}</TableCell>
                    <TableCell className="text-ott-text-secondary">{offer.expiresAt}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={offer.status === "active" ? "border-emerald-500/40 text-emerald-500" : "border-zinc-500/40 text-zinc-500"}
                      >
                        {offer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
