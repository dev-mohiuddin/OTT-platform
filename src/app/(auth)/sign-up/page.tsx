import Link from "next/link";

import { AuthShell } from "@/components/ott/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your Dristy account"
      subtitle="Start your free trial and unlock premium Bangla and global entertainment."
      panelTitle="Your next obsession is one click away."
      panelText="Build profiles for family members, set language preferences, and get recommendations instantly."
    >
      <form className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="full-name">Full name</Label>
          <Input id="full-name" type="text" placeholder="Your full name" className="h-10 bg-background/70" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="h-10 bg-background/70" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Create a strong password" className="h-10 bg-background/70" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Retype your password"
            className="h-10 bg-background/70"
          />
        </div>

        <Label htmlFor="terms" className="items-start text-sm leading-relaxed text-ott-text-secondary">
          <Checkbox id="terms" className="mt-1" />
          I agree to the Terms of Service and Privacy Policy, and I consent to receive account and billing updates.
        </Label>

        <Button type="submit" size="lg" className="ott-gradient-cta w-full h-10 rounded-full text-white">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-sm text-ott-text-secondary">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-ott-brand-violet hover:underline">
          Sign in now
        </Link>
      </p>
    </AuthShell>
  );
}