"use client";

import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Flame, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type RailCardItem = {
  title: string;
  subtitle: string;
  meta: string;
  image: string;
  rating: string;
};

const latestReleases: RailCardItem[] = [
  {
    title: "Deadpool & Wolverine",
    subtitle: "Action, Sci-Fi",
    meta: "2h 7m",
    image: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    rating: "4.8",
  },
  {
    title: "Fast X",
    subtitle: "Action, Thriller",
    meta: "2h 21m",
    image: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
    rating: "4.5",
  },
  {
    title: "Dune: Part Two",
    subtitle: "Sci-Fi, Drama",
    meta: "2h 46m",
    image: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    rating: "4.9",
  },
  {
    title: "John Wick: Chapter 4",
    subtitle: "Action, Crime",
    meta: "2h 49m",
    image: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    rating: "4.7",
  },
  {
    title: "The Marvels",
    subtitle: "Action, Adventure",
    meta: "1h 45m",
    image: "https://image.tmdb.org/t/p/w500/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg",
    rating: "4.2",
  },
  {
    title: "The Last of Us",
    subtitle: "Drama, Thriller",
    meta: "Season 1",
    image: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    rating: "4.9",
  },
];

const trendingNow: RailCardItem[] = [
  {
    title: "Avatar: The Way of Water",
    subtitle: "Action, Sci-Fi",
    meta: "3h 12m",
    image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    rating: "4.8",
  },
  {
    title: "Top Gun: Maverick",
    subtitle: "Action, Drama",
    meta: "2h 11m",
    image: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    rating: "4.9",
  },
  {
    title: "Attack on Titan",
    subtitle: "Anime, Action",
    meta: "Final Season",
    image: "https://image.tmdb.org/t/p/w500/aiy35Evcofzl7hASZZvsFgltHTX.jpg",
    rating: "4.9",
  },
  {
    title: "Breaking Bad",
    subtitle: "Drama, Crime",
    meta: "5 Seasons",
    image: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    rating: "4.9",
  },
  {
    title: "The Batman",
    subtitle: "Crime, Mystery",
    meta: "2h 56m",
    image: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    rating: "4.8",
  },
  {
    title: "Joker",
    subtitle: "Crime, Drama",
    meta: "2h 2m",
    image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    rating: "4.7",
  },
];

export function ContentRailsSection() {
  return (
    <section className="ott-section pt-3">
      <div className="ott-shell space-y-10">
        <motion.article
          id="latest"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ott-text-primary sm:text-3xl dark:text-white">Latest Releases</h2>
              <p className="mt-1 text-sm text-ott-text-secondary">Fresh cinema drops from global hits and Bangla originals.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-black/12 bg-white/80 text-ott-text-primary hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                aria-label="Scroll latest releases left"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-black/12 bg-white/80 text-ott-text-primary hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                aria-label="Scroll latest releases right"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {latestReleases.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.44, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5, scale: 1.016 }}
                whileTap={{ scale: 0.99 }}
                className="group relative aspect-[0.69] overflow-hidden rounded-xl border border-white/14 bg-black/55"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/32 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-white/82">{item.subtitle}</p>
                  <p className="mt-1 text-[11px] text-white/68">
                    {item.meta} • {item.rating} / 5
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.article>

        <motion.article
          id="trending"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ott-text-muted">
                <Flame className="size-4 text-ott-brand-amber" />
                Most Watched This Week
              </p>
              <h2 className="mt-1 font-heading text-2xl font-semibold text-ott-text-primary sm:text-3xl dark:text-white">Trending Movies & Shows</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-black/12 bg-white/80 text-ott-text-primary hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                aria-label="Scroll trending left"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-black/12 bg-white/80 text-ott-text-primary hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                aria-label="Scroll trending right"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {trendingNow.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.44, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5, scale: 1.016 }}
                whileTap={{ scale: 0.99 }}
                className="group relative aspect-[0.69] overflow-hidden rounded-xl border border-white/14 bg-black/55"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/32 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-white/82">{item.subtitle}</p>
                  <p className="mt-1 text-[11px] text-white/68">
                    {item.meta} • {item.rating} / 5
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-ott-text-muted">
            <Sparkles className="size-4 text-ott-brand-emerald" />
            Updated every 15 minutes from real-time viewing signals.
          </div>
        </motion.article>
      </div>
    </section>
  );
}