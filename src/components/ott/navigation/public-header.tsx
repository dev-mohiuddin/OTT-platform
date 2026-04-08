import Link from "next/link";
import { ClapperboardIcon, Search } from "lucide-react";

import { ThemeToggle } from "@/components/ott/layout/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Upcoming",
    href: "/#latest",
  },
  {
    label: "Shows",
    href: "/#shows",
  },
  {
    label: "Fanart",
    href: "/#discover",
  },
  {
    label: "Plans",
    href: "/#plans",
  },
  {
    label: "Community",
    href: "/#faq",
  },
  {
    label: "Account",
    href: "/sign-in",
  },
];

export function PublicHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ott-border-soft/70 bg-white/85 backdrop-blur-xl dark:bg-black/55">
      <div className="ott-shell flex h-16 items-center justify-between gap-3">
        <Link
          href="/#top"
          className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-heading font-semibold text-ott-text-primary"
        >
          <span className="inline-flex size-7 items-center justify-center rounded-md ott-gradient-cta shadow-(--ott-shadow-glow-violet)">
            <ClapperboardIcon className="size-4" />
          </span>
          Dristy
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 rounded-full px-3 text-xs font-medium uppercase tracking-[0.12em] text-ott-text-secondary hover:bg-black/6 hover:text-ott-text-primary dark:hover:bg-white/10 dark:hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
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
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 rounded-full px-3 text-xs text-ott-text-secondary hover:bg-black/6 hover:text-ott-text-primary dark:hover:bg-white/10 dark:hover:text-white",
            )}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "sm" }),
              "ott-gradient-cta h-8 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.12em]",
            )}
          >
            Join Now
          </Link>
        </div>
      </div>
    </header>
  );
}