"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AdminSignOutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    setIsSubmitting(true);
    await signOut({
      callbackUrl: "/sign-in",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 border-ott-border-soft bg-background/70"
      onClick={handleSignOut}
      disabled={isSubmitting}
    >
      <LogOut className="mr-1 size-4" />
      {isSubmitting ? "Signing out..." : "Sign out"}
    </Button>
  );
}
