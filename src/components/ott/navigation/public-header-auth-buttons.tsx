"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, CreditCard } from "lucide-react";
import { signOutCurrentUser } from "@/api/domains/auth/client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PublicHeaderAuthButtonsProps {
  userName: string;
  userEmail: string;
  userInitials: string;
  userImage: string;
}

export function PublicHeaderAuthButtons({
  userName,
  userEmail,
  userInitials,
  userImage,
}: PublicHeaderAuthButtonsProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center rounded-full h-8 w-8 ml-2 overflow-hidden border border-black/10 hover:opacity-80 dark:border-white/10 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage alt={userName} src={userImage} />
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
  );
}
