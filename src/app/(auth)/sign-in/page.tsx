"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  loadAuthProviders,
  signInWithCredentials,
  signInWithGoogle,
} from "@/api/domains/auth/client";
import { fetchAuthSession } from "@/api/domains/auth";
import { AuthShell } from "@/components/ott/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { setLoginSuccessToastFlag } from "@/lib/auth/client-toast-flag";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { DEFAULT_ERROR_MESSAGES, type ApiErrorCode } from "@/server/common/errors/error-codes";

function isApiErrorCode(value: string): value is ApiErrorCode {
  return value in DEFAULT_ERROR_MESSAGES;
}

function resolveAuthErrorMessage(error: string, code?: string | null): string {
  if (code && isApiErrorCode(code)) {
    return DEFAULT_ERROR_MESSAGES[code];
  }

  switch (error) {
    case "Configuration":
      return "Authentication request is invalid or server config has an issue. Use the Google button (not direct /api/auth/signin/google URL), hard refresh, then try again.";
    case "AccessDenied":
      return "Access denied for this account. Please contact support if this looks incorrect.";
    case "Verification":
      return "This verification link is invalid or expired.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "Google sign-in failed. Please try again.";
    case "CredentialsSignin":
      return "Credentials sign-in failed. Please try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);
  const [isProviderLoading, setIsProviderLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URL(window.location.href).searchParams;
    const error = searchParams.get("error");

    if (!error) {
      return;
    }

    setErrorMessage(resolveAuthErrorMessage(error, searchParams.get("code")));
  }, []);

  const resolveCallbackUrl = (): string => {
    if (typeof window === "undefined") {
      return "/browse";
    }

    const rawCallbackUrl = new URL(window.location.href).searchParams.get("callbackUrl");
    return rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/browse";
  };

  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      try {
        const providers = await loadAuthProviders();
        if (!isMounted) {
          return;
        }

        setIsGoogleAvailable(Boolean(providers?.google));
      } catch {
        if (!isMounted) {
          return;
        }

        setIsGoogleAvailable(false);
      } finally {
        if (isMounted) {
          setIsProviderLoading(false);
        }
      }
    };

    void loadProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvePostLoginUrl = async (fallbackUrl: string): Promise<string> => {
    const sessionResult = await fetchAuthSession();
    if (!sessionResult.success || !sessionResult.data.isAuthenticated || !sessionResult.data.user) {
      return fallbackUrl;
    }

    const hasAdminAccess = sessionResult.data.user.permissions?.includes(ADMIN_PERMISSION.PANEL_ACCESS);
    if (hasAdminAccess) {
      return "/admin";
    }

    return fallbackUrl;
  };

  const handleCredentialSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const callbackUrl = resolveCallbackUrl();

    const result = await signInWithCredentials({
      identifier,
      password,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setErrorMessage(resolveAuthErrorMessage(result?.error ?? "CredentialsSignin", result?.code));
      return;
    }

    setLoginSuccessToastFlag();
    const targetUrl = await resolvePostLoginUrl(result.url ?? callbackUrl);
    router.push(targetUrl);
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    const callbackUrl = resolveCallbackUrl();

    if (!isGoogleAvailable) {
      setErrorMessage("Google sign-in is not available right now. Please use email/phone sign-in.");
      return;
    }

    setIsGoogleSubmitting(true);

    try {
      const result = await signInWithGoogle({
        callbackUrl,
      });

      if (!result) {
        setErrorMessage("Google sign-in failed. Please try again.");
        setIsGoogleSubmitting(false);
        return;
      }

      if (result.error) {
        setErrorMessage(resolveAuthErrorMessage(result.error, result.code));
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
      title="Sign in to Dristy"
      subtitle="Access your watchlist, continue your sessions, and manage subscriptions."
      panelTitle="Stream where your story starts."
      panelText="Switch devices instantly, keep your personalized feed, and re-enter your world in one tap."
    >
      <form className="space-y-4" noValidate onSubmit={handleCredentialSignIn}>
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or phone</Label>
          <Input
            id="identifier"
            type="text"
            placeholder="you@example.com or +8801XXXXXXXXX"
            className="h-10 bg-background/70"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-ott-brand-violet hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="h-10 bg-background/70"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-sm">
          <Label htmlFor="remember" className="text-ott-text-secondary">
            <Checkbox id="remember" />
            Keep me signed in
          </Label>
          <span className="text-xs text-ott-text-muted">Private device only</span>
        </div>

        {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="ott-gradient-cta w-full h-10 rounded-full text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="bg-ott-border-soft" />
        <span className="text-xs uppercase tracking-[0.14em] text-ott-text-muted">Or</span>
        <Separator className="bg-ott-border-soft" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="outline"
          className="h-10 border-ott-border-soft bg-background/70"
          onClick={handleGoogleSignIn}
          disabled={isProviderLoading || !isGoogleAvailable || isGoogleSubmitting}
        >
          {isProviderLoading
            ? "Checking Google..."
            : (isGoogleAvailable
              ? (isGoogleSubmitting ? "Redirecting..." : "Continue with Google")
              : "Google (Unavailable)")}
        </Button>
        <Button variant="outline" className="h-10 border-ott-border-soft bg-background/70" disabled>
          Apple (Soon)
        </Button>
      </div>

      <p className="mt-6 text-sm text-ott-text-secondary">
        New to Dristy?{" "}
        <Link href="/sign-up" className="font-medium text-ott-brand-crimson hover:underline">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
