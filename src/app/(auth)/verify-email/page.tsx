"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import { AuthShell } from "@/components/ott/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function subscribe(): () => void {
  return () => {
    // no-op subscription for useSyncExternalStore snapshots
  };
}

function getEmailFromQuery(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("email") ?? "";
}

function getDeliveryStateFromQuery(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("delivery") ?? "";
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const queryEmail = useSyncExternalStore(subscribe, getEmailFromQuery, () => "");
  const deliveryState = useSyncExternalStore(subscribe, getDeliveryStateFromQuery, () => "");
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const email = emailInput ?? queryEmail;
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setIsSubmitting(true);

    const response = await fetch("/api/v1/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok || !payload.success) {
      setErrorMessage(payload?.error?.message ?? "Failed to verify email.");
      return;
    }

    setMessage("Email verified successfully. Redirecting to sign-in...");
    setTimeout(() => {
      router.push(`/sign-in?verified=1&email=${encodeURIComponent(email)}`);
    }, 900);
  };

  const handleResendCode = async () => {
    setErrorMessage(null);
    setMessage(null);
    setIsResending(true);

    const response = await fetch("/api/v1/auth/resend-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const payload = await response.json();
    setIsResending(false);

    if (!response.ok || !payload.success) {
      setErrorMessage(payload?.error?.message ?? "Failed to resend code.");
      return;
    }

    setMessage(payload.data.message);
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email address."
      panelTitle="Secure your account in one step"
      panelText="Email verification keeps your profile safe and unlocks sign-in for credential login."
    >
      {deliveryState === "failed" ? (
        <p className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Account created, but email delivery failed earlier. Please use "Resend code" below.
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={handleVerify} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="h-10 bg-background/70"
            value={email}
            onChange={(event) => setEmailInput(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="Enter 6-digit code"
            className="h-10 bg-background/70 tracking-[0.35em] text-center"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </div>

        {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
        {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="ott-gradient-cta w-full h-10 rounded-full text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-9 border-ott-border-soft"
          disabled={isResending}
          onClick={handleResendCode}
        >
          {isResending ? "Sending..." : "Resend code"}
        </Button>

        <Link href="/sign-in" className="text-sm text-ott-brand-violet hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
