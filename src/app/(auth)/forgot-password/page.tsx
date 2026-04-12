"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestPasswordReset } from "@/api/domains/auth";

import { AuthShell } from "@/components/ott/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setIsSubmitting(true);

    const payload = await requestPasswordReset({
      email,
    });

    setIsSubmitting(false);

    if (!payload.success) {
      setErrorMessage(payload.message);
      return;
    }

    setMessage(payload.data.message);
    setTimeout(() => {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 900);
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your account email to receive a one-time reset code."
      panelTitle="Recover access quickly"
      panelText="We will send a secure reset code to your inbox so you can set a new password safely."
    >
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="h-10 bg-background/70"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          {isSubmitting ? "Sending..." : "Send Reset Code"}
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
