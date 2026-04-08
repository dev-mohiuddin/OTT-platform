"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";

import { buttonVariants, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WideCard = {
  title: string;
  genres: string;
  image: string;
  rating: string;
};

const monthlySpotlightCards = [
  {
    title: "The Last of Us",
    platform: "HBO Max",
    image: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
  },
  {
    title: "Stranger Things",
    platform: "Netflix",
    image: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  },
  {
    title: "Oppenheimer",
    platform: "Dristy Premiere",
    image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },
];

const movieRail: WideCard[] = [
  {
    title: "Interstellar",
    genres: "Adventure, Drama, Sci-Fi",
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: "4.8",
  },
  {
    title: "Oppenheimer",
    genres: "Drama, Thriller",
    image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    rating: "4.9",
  },
  {
    title: "Batman v Superman",
    genres: "Action, Adventure",
    image: "https://image.tmdb.org/t/p/w500/5UsK3grJvtQrtzEgqNlDljJW96w.jpg",
    rating: "4.4",
  },
  {
    title: "The Lord of the Rings",
    genres: "Action, Fantasy",
    image: "https://image.tmdb.org/t/p/w500/56zTpe2xvaA4alU51sRWPoKPYZy.jpg",
    rating: "4.9",
  },
];

const showRail: WideCard[] = [
  {
    title: "Peaky Blinders",
    genres: "Drama, Crime",
    image: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",
    rating: "4.8",
  },
  {
    title: "Loki",
    genres: "Action, Sci-Fi",
    image: "https://image.tmdb.org/t/p/w500/voHUmluYmKyleFkTu3lOXQG702u.jpg",
    rating: "4.6",
  },
  {
    title: "Breaking Bad",
    genres: "Drama, Crime",
    image: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    rating: "4.9",
  },
  {
    title: "Batman: Caped Crusader",
    genres: "Animation, Crime",
    image: "https://image.tmdb.org/t/p/w500/9A8zZQ1S8W2S6vJCGJwQn2ATqNQ.jpg",
    rating: "4.3",
  },
];

function RailRow({ id, title, items }: { id: string; title: string; items: WideCard[] }) {
  return (
    <article id={id} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-2xl font-semibold text-ott-text-primary dark:text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-full border-black/12 bg-white/80 text-ott-text-primary hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-full border-black/12 bg-white/80 text-ott-text-primary hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, scale: 1.014 }}
            whileTap={{ scale: 0.99 }}
            className="group relative aspect-2/1 overflow-hidden rounded-xl border border-white/14"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${item.image}')` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/28 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <h4 className="line-clamp-1 text-sm font-semibold text-white">{item.title}</h4>
              <p className="mt-1 text-[11px] text-white/82">{item.genres}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/68">
                <Star className="size-3 fill-current text-ott-brand-amber" />
                {item.rating}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </article>
  );
}

export function ShowcaseSection() {
  return (
    <section className="ott-section">
      <div className="ott-shell space-y-10">
        <motion.article
          id="most-watched"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[calc(var(--ott-radius-card)+4px)] border border-black/10 p-6 sm:p-8 lg:p-10 dark:border-white/16"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://image.tmdb.org/t/p/original/j9XKiZrVeViAixVRzCta7h1VU9W.jpg')" }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/74 to-black/35" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/68">This month&apos;s most watched</p>
              <h2 className="font-heading text-4xl font-semibold text-white sm:text-5xl">Money Heist</h2>
              <p className="max-w-xl text-sm leading-relaxed text-white/84 sm:text-base">
                Watch this month&apos;s most watched series with cinematic Dolby quality, Bangla and English subtitles,
                and profile-based recommendations tailored to every viewer.
              </p>

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
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {monthlySpotlightCards.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.46, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -5, scale: 1.014 }}
                  className="group relative aspect-[0.7] overflow-hidden rounded-xl border border-white/26"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-[11px] text-white/68">{item.platform}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.article>

        <RailRow id="movies" title="Movies" items={movieRail} />
        <RailRow id="shows" title="Shows" items={showRail} />
      </div>
    </section>
  );
}