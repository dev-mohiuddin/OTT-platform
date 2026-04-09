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

export default function ResetPasswordPage() {
  const router = useRouter();
  const queryEmail = useSyncExternalStore(subscribe, getEmailFromQuery, () => "");
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const email = emailInput ?? queryEmail;
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
        newPassword,
        confirmPassword,
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok || !payload.success) {
      setErrorMessage(payload?.error?.message ?? "Failed to reset password.");
      return;
    }

    setMessage(payload.data.message);
    setTimeout(() => {
      router.push("/sign-in");
    }, 900);
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Use the 6-digit code from email and set your new password."
      panelTitle="Almost done"
      panelText="Create a strong password to secure your Dristy account and continue streaming instantly."
    >
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
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
          <Label htmlFor="code">Reset Code</Label>
          <Input
            id="code"
            type="text"
            className="h-10 bg-background/70 tracking-[0.35em] text-center"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            className="h-10 bg-background/70"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            className="h-10 bg-background/70"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {isSubmitting ? "Updating..." : "Reset Password"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ott-text-secondary">
        Back to{" "}
        <Link href="/sign-in" className="font-medium text-ott-brand-violet hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
