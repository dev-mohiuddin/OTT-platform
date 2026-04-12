import Link from "next/link";
import { Bookmark, Clock3, Play, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

const savedTitles = [
  { id: "1", name: "Dhaka Nights", genre: "Crime Drama", duration: "2h 01m" },
  { id: "2", name: "Monsoon Code", genre: "Thriller", duration: "1h 49m" },
  { id: "3", name: "Neon Streets", genre: "Action", duration: "2h 15m" },
  { id: "4", name: "Silent River", genre: "Mystery", duration: "1h 58m" },
  { id: "5", name: "Eclipse Protocol", genre: "Sci-Fi", duration: "2h 07m" },
  { id: "6", name: "Rooftop Stories", genre: "Romance", duration: "1h 43m" },
];

export default function MyListPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-ott-bg-primary via-ott-bg-secondary/60 to-ott-bg-primary dark:from-black dark:via-ott-bg-secondary/30 dark:to-black">
      <section className="ott-shell py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-ott-border-soft/50 bg-white/60 px-3 py-1 text-xs uppercase tracking-[0.14em] text-ott-text-secondary dark:bg-white/5">
                <Sparkles className="size-3.5 text-ott-accent" />
                Personal Shelf
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-ott-text-primary sm:text-4xl">
                My List
              </h1>
              <p className="mt-2 text-sm text-ott-text-secondary sm:text-base">
                Your saved titles are ready whenever you are.
              </p>
            </div>

            <Button asChild className="ott-gradient-cta text-white hover:opacity-90">
              <Link href="/browse">Browse More Titles</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {savedTitles.map((title) => (
              <article
                key={title.id}
                className="group relative overflow-hidden rounded-xl border border-ott-border-soft/40 bg-white/65 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 ott-card-hover ott-glow-violet dark:bg-white/5"
              >
                <div
                  className="mb-3 aspect-2/3 w-full rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${getThumbnailByIndex(Number(title.id) + 1)})` }}
                />

                <h2 className="line-clamp-1 text-sm font-semibold text-ott-text-primary">
                  {title.name}
                </h2>

                <p className="mt-1 line-clamp-1 text-xs text-ott-text-secondary">
                  {title.genre}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-ott-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3" />
                    {title.duration}
                  </span>
                  <Badge variant="outline" className="border-ott-border-soft/50 text-[10px]">
                    Saved
                  </Badge>
                </div>

                <Button
                  size="sm"
                  className="mt-3 h-8 w-full rounded-full ott-gradient-cta text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Play className="mr-1 size-3.5 fill-current" />
                  Play
                </Button>

                <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm">
                  <Bookmark className="size-3.5" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}