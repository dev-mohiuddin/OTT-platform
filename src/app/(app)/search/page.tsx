import { SearchIcon, SlidersHorizontal, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

const quickFilters = ["Action", "Drama", "Thriller", "Comedy", "Family", "Sci-Fi"];

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-ott-bg-primary via-ott-bg-secondary/45 to-ott-bg-primary dark:from-black dark:via-ott-bg-secondary/20 dark:to-black">
      <section className="ott-shell py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-2xl border border-ott-border-soft/40 bg-white/65 p-5 shadow-sm backdrop-blur-sm dark:bg-white/5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ott-text-secondary">
              <Sparkles className="size-3.5 text-ott-accent" />
              Smart Discovery
            </div>

            <h1 className="font-heading text-3xl font-bold tracking-tight text-ott-text-primary sm:text-4xl">
              Search
            </h1>

            <p className="mt-2 text-sm text-ott-text-secondary sm:text-base">
              Find movies, shows, creators and genres in seconds.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ott-text-secondary" />
                <Input
                  placeholder="Search titles, genres, actors..."
                  className="h-11 rounded-full border-ott-border-soft/40 bg-white/80 pl-9 dark:bg-white/5"
                />
              </div>
              <Button variant="outline" className="h-11 rounded-full border-ott-border-soft/40 bg-white/80 px-5 dark:bg-white/5">
                <SlidersHorizontal className="mr-2 size-4" />
                Filters
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Badge key={filter} variant="outline" className="border-ott-border-soft/50 bg-white/70 px-3 py-1 text-xs dark:bg-white/5">
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <article
                key={index}
                className="group relative overflow-hidden rounded-xl border border-ott-border-soft/40 bg-white/65 p-3 transition-all duration-300 hover:-translate-y-1 ott-card-hover ott-glow-violet dark:bg-white/5"
              >
                <div
                  className="aspect-2/3 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${getThumbnailByIndex(index + 2)})` }}
                />
                <h2 className="mt-3 line-clamp-1 text-sm font-medium text-ott-text-primary">Result Title {index + 1}</h2>
                <p className="mt-1 text-xs text-ott-text-secondary">2026 • 2h 04m</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}