"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ClapperboardIcon, LogOut, Search, Settings, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { signOutCurrentUser } from "@/api/domains/auth/client";

import { checkAndClearLoginToastFlag } from "@/lib/auth/client-toast-flag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ott/layout/theme-toggle";
import { getUserInitials } from "../../../lib/formatters/initials";

export function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (checkAndClearLoginToastFlag()) {
      toast.success("Welcome back! You've successfully logged in.", {
        position: "top-center",
        duration: 4000,
      });
    }
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const result = await signOutCurrentUser("/sign-in");

      router.push(result?.url ?? "/sign-in");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "User";
  const userInitials = getUserInitials(session?.user?.name);

  return (
    <header className="sticky top-0 z-40 border-b border-ott-border-soft/70 bg-white/85 backdrop-blur-xl dark:bg-black/55">
      <div className="ott-shell flex h-16 items-center justify-between gap-3">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-heading font-semibold text-ott-text-primary"
        >
          <span className="inline-flex size-7 items-center justify-center rounded-md ott-gradient-cta shadow-(--ott-shadow-glow-violet)">
            <ClapperboardIcon className="size-4" />
          </span>
          Dristy
        </Link>
        
        <nav className="hidden items-center gap-4 lg:flex lg:flex-1 lg:ml-8 font-medium text-sm text-ott-text-secondary">
            <Link href="/browse" className="hover:text-ott-text-primary transition-colors">Home</Link>
            <Link href="/shows" className="hover:text-ott-text-primary transition-colors">TV Shows</Link>
            <Link href="/movies" className="hover:text-ott-text-primary transition-colors">Movies</Link>
            <Link href="/my-list" className="hover:text-ott-text-primary transition-colors">My List</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Search titles"
            className="rounded-full border border-black/10 bg-white/85 text-ott-text-secondary hover:bg-white hover:text-ott-text-primary dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Search className="size-4" />
          </Button>

          <ThemeToggle className="hidden sm:inline-flex rounded-full border-black/10 bg-white/85 text-ott-text-secondary hover:bg-white hover:text-ott-text-primary dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white" />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-full h-8 w-8 ml-2 overflow-hidden border border-black/10 hover:opacity-80 dark:border-white/10 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage alt={userName} src={session?.user?.image || ""} />
                <AvatarFallback className="bg-ott-accent/10 text-xs font-semibold text-ott-accent dark:bg-ott-accent/20 dark:text-ott-accent-dark">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/account")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 size-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/billing")}
                  className="cursor-pointer"
                >
                  <CreditCard className="mr-2 size-4" />
                  Billing
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void handleSignOut();
                }}
                disabled={isSigningOut}
                className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="mr-2 size-4" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}