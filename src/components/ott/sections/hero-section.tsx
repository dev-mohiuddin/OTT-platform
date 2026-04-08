"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Play, Plus, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heroDots = ["slide-1", "slide-2", "slide-3", "slide-4", "slide-5"];

const heroHighlights = [
  {
    label: "Top 10 in Bangladesh",
    value: "Updated hourly",
  },
  {
    label: "Up to 4K + HDR",
    value: "Adaptive playback",
  },
  {
    label: "One account, six personas",
    value: "Personalized watchlists",
  },
];

export function HeroSection() {
  return (
    <section id="top" className="relative min-h-[92vh] overflow-hidden pt-16 sm:pt-20">
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://image.tmdb.org/t/p/original/oqP1qEZccq5AD9TVTIaO6IGUj7o.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-(image:--ott-gradient-hero)" />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/35 to-black/10" />

      <div className="ott-shell relative z-10 flex min-h-[74vh] items-center pb-24 pt-14 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
            <Sparkles className="size-3.5 text-ott-brand-amber" />
            Bangla-first OTT universe
          </span>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.17em] text-white/70">2022</p>
            <h1 className="font-heading text-5xl font-semibold leading-[0.92] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl">
              The Batman
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span>2 hr 56 min</span>
              <span className="size-1 rounded-full bg-white/40" />
              <span>Crime</span>
              <span className="size-1 rounded-full bg-white/40" />
              <span>Drama</span>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-white/82 sm:text-base">
              Batman is called to intervene when the mayor of Gotham City is murdered. Soon, his investigation
              leads him to uncover a web of corruption linked to his own dark past.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: "lg" }), "ott-gradient-cta h-11 rounded-sm px-7 text-white")}
            >
              <Play className="size-4 fill-current" />
              Play Now
            </Link>
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 rounded-sm border-white/35 bg-black/35 px-6 text-white hover:bg-black/55",
              )}
            >
              <Play className="size-4" />
              Watch Trailer
            </Link>
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 rounded-sm border-white/30 bg-black/35 px-4 text-white hover:bg-black/55",
              )}
            >
              <Plus className="size-4" />
              Add Watchlist
            </Link>
          </div>

          <div className="grid gap-2.5 pt-2 sm:grid-cols-3">
            {heroHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/14 bg-black/35 px-3 py-2 backdrop-blur-sm"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/68">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {heroDots.map((dot, index) => (
          <button
            key={dot}
            type="button"
            aria-label={`Go to hero slide ${index + 1}`}
            className={cn(
              "rounded-full transition-all duration-300",
              index === 2
                ? "h-2.5 w-6 bg-ott-brand-violet"
                : "size-2.5 bg-white/45 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </section>
  );
}