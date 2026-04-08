import Link from "next/link";
import type { ReactNode } from "react";
import { Clapperboard, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/ott/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  panelTitle: string;
  panelText: string;
}

export function AuthShell({
  title,
  subtitle,
  children,
  panelTitle,
  panelText,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-(image:--ott-gradient-page) pb-8 pt-20 sm:pb-12">
      <div className="pointer-events-none absolute left-1/2 -top-28 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,95,109,0.2),transparent_68%)] blur-2xl" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-ott-border-soft/70 bg-white/85 backdrop-blur-xl dark:bg-black/55">
        <div className="ott-shell flex h-16 items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-heading font-semibold text-ott-text-primary"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md ott-gradient-cta shadow-(--ott-shadow-glow-violet)">
              <Clapperboard className="size-4" />
            </span>
            Dristy
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 rounded-full px-3 text-xs text-ott-text-secondary hover:bg-black/6 hover:text-ott-text-primary dark:hover:bg-white/10 dark:hover:text-white",
              )}
            >
              Back Home
            </Link>
            <ThemeToggle className="rounded-full border-black/12 bg-white/80 text-ott-text-secondary hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-ott-text-secondary dark:hover:bg-white/10 dark:hover:text-white" />
          </div>
        </div>
      </header>

      <main className="ott-shell grid gap-6 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-(--ott-radius-card) border border-ott-border-soft bg-(image:--ott-gradient-auth-panel) p-7 text-ott-text-primary sm:p-10 lg:p-12">
          <div className="absolute inset-0 opacity-65 [background:radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.28),transparent_38%),radial-gradient(circle_at_12%_88%,rgba(38,11,72,0.15),transparent_42%)] dark:[background:radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.2),transparent_38%),radial-gradient(circle_at_12%_88%,rgba(0,0,0,0.24),transparent_42%)]" />
          <div className="relative space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.15em] text-ott-text-secondary dark:border-white/35 dark:bg-white/10 dark:text-white/85">
              <Sparkles className="size-3.5" />
              Welcome back
            </span>
            <h1 className="max-w-md font-heading text-4xl font-semibold leading-tight text-ott-text-primary sm:text-5xl dark:text-white">
              {panelTitle}
            </h1>
            <p className="max-w-md text-ott-text-secondary dark:text-white/85">{panelText}</p>
          </div>
        </section>

        <section className="ott-card rounded-(--ott-radius-card) p-5 sm:p-7 lg:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="font-heading text-3xl font-semibold text-ott-text-primary">{title}</h2>
            <p className="text-sm text-ott-text-secondary">{subtitle}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}