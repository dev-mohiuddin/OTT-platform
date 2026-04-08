import Link from "next/link";
import { Clapperboard, Globe, MessageCircle, PlayCircle } from "lucide-react";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/#top" },
      { label: "Careers", href: "/sign-up" },
      { label: "Press", href: "/#latest" },
      { label: "Investors", href: "/#plans" },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { label: "Help center", href: "/#faq" },
      { label: "FAQs", href: "/#faq" },
      { label: "Support", href: "/sign-in" },
      { label: "Account & billing", href: "/sign-in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/#plans" },
      { label: "Privacy policy", href: "/#plans" },
      { label: "Cookie preferences", href: "/#plans" },
      { label: "Accessibility", href: "/#faq" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/78 dark:border-white/10 dark:bg-black/88">
      <div className="ott-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
        <div className="space-y-4">
          <Link
            href="/#top"
            className="inline-flex items-center gap-2 text-base font-heading font-semibold text-ott-text-primary dark:text-white"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md ott-gradient-cta shadow-(--ott-shadow-glow-violet)">
              <Clapperboard className="size-4" />
            </span>
            Dristy OTT
          </Link>

          <p className="max-w-xs text-sm leading-relaxed text-ott-text-secondary">
            Dristy is your go-to platform for premium Bangla stories, global cinema, and curated entertainment.
          </p>

          <div className="flex items-center gap-2">
            <Link
              href="/#top"
              aria-label="Visit Dristy community page"
              className="inline-flex size-8 items-center justify-center rounded-full border border-black/14 text-ott-text-secondary hover:border-black/28 hover:text-ott-text-primary dark:border-white/20 dark:hover:border-white/35 dark:hover:text-white"
            >
              <Globe className="size-4" />
            </Link>
            <Link
              href="/#top"
              aria-label="Open Dristy support chat"
              className="inline-flex size-8 items-center justify-center rounded-full border border-black/14 text-ott-text-secondary hover:border-black/28 hover:text-ott-text-primary dark:border-white/20 dark:hover:border-white/35 dark:hover:text-white"
            >
              <MessageCircle className="size-4" />
            </Link>
            <Link
              href="/#top"
              aria-label="Open Dristy trailers"
              className="inline-flex size-8 items-center justify-center rounded-full border border-black/14 text-ott-text-secondary hover:border-black/28 hover:text-ott-text-primary dark:border-white/20 dark:hover:border-white/35 dark:hover:text-white"
            >
              <PlayCircle className="size-4" />
            </Link>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ott-text-primary dark:text-white/85">{column.title}</h3>
            <ul className="space-y-2 text-sm text-ott-text-secondary">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-ott-text-primary dark:hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-black/10 dark:border-white/10">
        <div className="ott-shell py-5 text-center text-xs text-ott-text-muted">
          © {new Date().getFullYear()} Dristy Movies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}