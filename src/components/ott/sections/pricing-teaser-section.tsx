import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const perks = [
  "No ads on Premium and Family tiers",
  "Offline download up to 40 titles",
  "Cancel anytime with one tap",
  "Secure checkout with local payment methods",
];

export function PricingTeaserSection() {
  return (
    <section id="plans" className="ott-section">
      <div className="ott-shell space-y-7">
        <article className="relative overflow-hidden rounded-[calc(var(--ott-radius-card)+2px)] border border-ott-border-strong bg-(image:--ott-gradient-cta) p-7 text-white sm:p-10">
          <div className="absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-white/12 blur-3xl" />
          <div className="absolute -right-16 -top-20 size-72 rounded-full bg-black/15 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/75">Subscription</p>
              <h2 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                Start with ৳99 and unlock the full Dristy experience.
              </h2>
              <p className="max-w-xl text-white/85">
                Flexible monthly plans for students, families, and binge-watchers. Upgrade or downgrade whenever you
                want.
              </p>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-white px-7 text-[#21122f] hover:bg-white/90")}
              >
                See Plans
              </Link>
            </div>

            <div className="rounded-2xl border border-white/30 bg-black/20 p-5 backdrop-blur-sm">
              <p className="mb-4 text-sm font-medium text-white/85">Included perks</p>
              <ul className="space-y-3 text-sm text-white/90">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[calc(var(--ott-radius-card)+2px)] border border-black/12 p-7 sm:p-10 dark:border-white/12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://image.tmdb.org/t/p/original/9zcbqSxdsRMZWHYtyCd1nXPr2xq.jpg')" }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-[#2f0f4f]/58 to-black/65" />

          <div className="relative space-y-5 text-center">
            <h3 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
              Join now with your email address and choose your plan to get started.
            </h3>
            <p className="mx-auto max-w-xl text-sm text-white/84 sm:text-base">
              Stream instantly on every device with smart discovery, multilingual subtitles, and family-safe profile
              controls.
            </p>

            <form className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row" noValidate>
              <Input
                type="email"
                placeholder="Email Address"
                className="h-11 border-white/35 bg-black/35 text-white placeholder:text-white/60"
              />
              <button
                type="submit"
                className="ott-gradient-cta inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold text-white"
              >
                Join Now
              </button>
            </form>
          </div>
        </article>
      </div>
    </section>
  );
}