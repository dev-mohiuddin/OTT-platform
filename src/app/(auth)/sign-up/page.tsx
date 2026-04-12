"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  signUp,
} from "@/api/domains/auth";
import {
  signInWithCredentials,
  signInWithGoogle,
} from "@/api/domains/auth/client";

import { setLoginSuccessToastFlag } from "@/lib/auth/client-toast-flag";
import { AuthShell } from "@/components/ott/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type SignUpMethod = "email" | "phone";

function resolveOAuthErrorMessage(error: string): string {
  switch (error) {
    case "Configuration":
      return "Authentication request is invalid or server config has an issue. Use the Google button and try again after a hard refresh.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "Google sign-in failed. Please try again.";
    case "AccessDenied":
      return "Access denied for this account.";
    default:
      return "Google sign-in failed. Please try again.";
  }
}

export default function SignUpPage() {
  const router = useRouter();

  const [method, setMethod] = useState<SignUpMethod>("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!acceptedTerms) {
      setErrorMessage("You must accept the terms to create an account.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const payload = await signUp({
      method,
      fullName,
      email: method === "email" ? email : undefined,
      phone: method === "phone" ? phone : undefined,
      password,
    });

    setIsSubmitting(false);

    if (!payload.success) {
      setErrorMessage(payload.message);
      return;
    }

    if (method === "email") {
      const emailSent = payload.data.emailSent !== false;
      const deliveryQuery = emailSent ? "" : "&delivery=failed";
      router.push(`/verify-email?email=${encodeURIComponent(email)}${deliveryQuery}`);
      return;
    }

    const loginResult = await signInWithCredentials({
      identifier: phone,
      password,
      callbackUrl: "/browse",
    });

    if (!loginResult || loginResult.error) {
      router.push("/sign-in");
      return;
    }

    setLoginSuccessToastFlag();
    router.push(loginResult.url ?? "/browse");
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);

    setIsGoogleSubmitting(true);

    try {
      const result = await signInWithGoogle({
        callbackUrl: "/browse",
      });

      if (!result) {
        setErrorMessage("Google sign-in failed. Please try again.");
        setIsGoogleSubmitting(false);
        return;
      }

      if (result.error) {
        setErrorMessage(resolveOAuthErrorMessage(result.error));
        setIsGoogleSubmitting(false);
        return;
      }

      if (!result.url) {
        setErrorMessage("Google sign-in failed. Please try again.");
        setIsGoogleSubmitting(false);
        return;
      }

      setLoginSuccessToastFlag();
      window.location.href = result.url;
    } catch {
      setErrorMessage("Google sign-in failed. Please try again.");
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your Dristy account"
      subtitle="Start your free trial and unlock premium Bangla and global entertainment."
      panelTitle="Your next obsession is one click away."
      panelText="Build profiles for family members, set language preferences, and get recommendations instantly."
    >
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-full border border-ott-border-soft p-1">
        <button
          type="button"
          className={`h-8 rounded-full text-sm font-medium transition-colors ${
            method === "email"
              ? "bg-ott-brand-violet text-white"
              : "text-ott-text-secondary hover:bg-black/6 dark:hover:bg-white/10"
          }`}
          onClick={() => setMethod("email")}
        >
          Email Sign Up
        </button>
        <button
          type="button"
          className={`h-8 rounded-full text-sm font-medium transition-colors ${
            method === "phone"
              ? "bg-ott-brand-violet text-white"
              : "text-ott-text-secondary hover:bg-black/6 dark:hover:bg-white/10"
          }`}
          onClick={() => setMethod("phone")}
        >
          Phone Sign Up
        </button>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSignUp}>
        <div className="space-y-2">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            type="text"
            placeholder="Your full name"
            className="h-10 bg-background/70"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>

        {method === "email" ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-10 bg-background/70"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+8801XXXXXXXXX"
              className="h-10 bg-background/70"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            className="h-10 bg-background/70"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Retype your password"
            className="h-10 bg-background/70"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        <Label htmlFor="terms" className="items-start text-sm leading-relaxed text-ott-text-secondary">
          <Checkbox
            id="terms"
            className="mt-1"
            checked={acceptedTerms}
            onCheckedChange={(value) => setAcceptedTerms(Boolean(value))}
          />
          I agree to the Terms of Service and Privacy Policy, and I consent to receive account and billing updates.
        </Label>

        {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="ott-gradient-cta w-full h-10 rounded-full text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="bg-ott-border-soft" />
        <span className="text-xs uppercase tracking-[0.14em] text-ott-text-muted">Or</span>
        <Separator className="bg-ott-border-soft" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-10 w-full border-ott-border-soft bg-background/70"
        onClick={handleGoogleSignIn}
        disabled={isGoogleSubmitting}
      >
        {isGoogleSubmitting ? "Redirecting..." : "Continue with Google"}
      </Button>

      <p className="mt-6 text-sm text-ott-text-secondary">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-ott-brand-violet hover:underline">
          Sign in now
        </Link>
      </p>
    </AuthShell>
  );
}