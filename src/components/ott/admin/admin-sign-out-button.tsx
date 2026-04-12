"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutCurrentUser } from "@/api/domains/auth/client";

import { Button } from "@/components/ui/button";

export function AdminSignOutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    setIsSubmitting(true);

    try {
      const result = await signOutCurrentUser("/sign-in");

      router.push(result?.url ?? "/sign-in");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
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
