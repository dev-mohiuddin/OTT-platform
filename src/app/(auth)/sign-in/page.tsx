import Link from "next/link";

import { AuthShell } from "@/components/ott/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in to Dristy"
      subtitle="Access your watchlist, continue your sessions, and manage subscriptions."
      panelTitle="Stream where your story starts."
      panelText="Switch devices instantly, keep your personalized feed, and re-enter your world in one tap."
    >
      <form className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="h-10 bg-background/70" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-ott-brand-violet hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="Enter your password" className="h-10 bg-background/70" />
        </div>

        <div className="flex items-center justify-between gap-2 text-sm">
          <Label htmlFor="remember" className="text-ott-text-secondary">
            <Checkbox id="remember" />
            Keep me signed in
          </Label>
          <span className="text-xs text-ott-text-muted">Private device only</span>
        </div>

        <Button type="submit" size="lg" className="ott-gradient-cta w-full h-10 rounded-full text-white">
          Sign In
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="bg-ott-border-soft" />
        <span className="text-xs uppercase tracking-[0.14em] text-ott-text-muted">Or</span>
        <Separator className="bg-ott-border-soft" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" className="h-10 border-ott-border-soft bg-background/70">
          Continue with Google
        </Button>
        <Button variant="outline" className="h-10 border-ott-border-soft bg-background/70">
          Continue with Apple
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