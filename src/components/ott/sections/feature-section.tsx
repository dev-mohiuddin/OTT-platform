"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play, WandSparkles } from "lucide-react";

import { FeatureCard } from "@/components/ott/cards/feature-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    iconName: "tv" as const,
    title: "Device Sync",
    description: "Continue where you left off on TV, mobile, tablet, and web with instant resume.",
    highlight: "Seamless multi-screen",
    tone: "violet" as const,
  },
  {
    iconName: "languages" as const,
    title: "Localized Experience",
    description: "Bangla, English, and bilingual subtitle tracks with region-smart defaults.",
    highlight: "Auto language cues",
    tone: "emerald" as const,
  },
  {
    iconName: "shield" as const,
    title: "Family Safety",
    description: "Pin-protected kids mode, maturity labels, and profile-level parental rules.",
    highlight: "Parental control suite",
    tone: "crimson" as const,
  },
  {
    iconName: "radar" as const,
    title: "Smart Discovery",
    description: "Fresh picks generated from your mood, watch history, and trending circles.",
    highlight: "AI recommendation engine",
    tone: "violet" as const,
  },
  {
    iconName: "clapperboard" as const,
    title: "Original Productions",
    description: "Exclusive Dristy Originals crafted by rising and iconic Bangladeshi creators.",
    highlight: "Weekly premieres",
    tone: "emerald" as const,
  },
  {
    iconName: "zap" as const,
    title: "Fast Playback",
    description: "Low-latency startup, adaptive bitrate, and edge-cached content delivery.",
    highlight: "Optimized globally",
    tone: "crimson" as const,
  },
];

const genres = ["Adventure", "Action", "Crime", "Comedy", "Fantasy", "Mystery", "Sci-Fi", "Thriller"];

export function FeatureSection() {
  return (
    <section id="discover" className="ott-section">
      <div className="ott-shell space-y-10">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[calc(var(--ott-radius-card)+2px)] border border-black/10 p-6 sm:p-8 lg:p-10 dark:border-white/16"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://image.tmdb.org/t/p/original/fMymfWwgTfXh9RkBCFuaZrdn8Of.jpg')" }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/55 to-black/42" />

          <div className="relative space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/68">Explore genres</p>
              <h2 className="font-heading text-4xl font-semibold text-white sm:text-5xl">One Piece</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-white/84 sm:text-base">
                Discover action, fantasy, comedy, and thrillers with region-smart recommendations. Dristy blends
                cinematic global storytelling with premium Bangla-first curation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "ott-gradient-cta h-11 rounded-sm px-6 text-white")}
              >
                <Play className="size-4 fill-current" />
                Play Now
              </Link>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-sm border-white/30 bg-black/35 px-5 text-white hover:bg-black/55",
                )}
              >
                Watch Trailer
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-lg border border-white/20 bg-black/32 px-4 py-2 text-sm text-white/84 backdrop-blur-sm"
                >
                  {genre}
                </span>
              ))}

              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                aria-label="Scroll genre list left"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                aria-label="Scroll genre list right"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.article>

        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ott-text-muted">
            <WandSparkles className="size-4 text-ott-brand-violet" />
            Why viewers stay
          </p>
          <h3 className="font-heading text-3xl font-semibold text-ott-text-primary sm:text-4xl dark:text-white">
            Built for premium streaming from day one.
          </h3>
          <p className="max-w-3xl text-ott-text-secondary">
            Every interaction is tuned for comfort, speed, and cinematic immersion in both light and dark themes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              iconName={feature.iconName}
              title={feature.title}
              description={feature.description}
              highlight={feature.highlight}
              glowTone={feature.tone}
            />
          ))}
        </div>
      </div>
    </section>
  );
}