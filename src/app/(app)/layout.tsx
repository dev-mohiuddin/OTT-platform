import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { AppHeader } from "@/components/ott/navigation/app-header";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white text-ott-text-primary dark:bg-black w-full">
      <AppHeader />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}