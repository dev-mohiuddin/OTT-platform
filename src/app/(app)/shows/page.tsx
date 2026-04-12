import { Flame, Tv, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

const showRows = [
  {
    title: "Trending Series",
    icon: Flame,
    accent: "text-rose-500",
  },
  {
    title: "New Episodes",
    icon: Zap,
    accent: "text-ott-accent",
  },
  {
    title: "Binge Picks",
    icon: Tv,
    accent: "text-cyan-500",
  },
];

export default function ShowsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-ott-bg-primary via-ott-bg-secondary/50 to-ott-bg-primary dark:from-black dark:via-ott-bg-secondary/20 dark:to-black">
      <section className="ott-shell py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-2xl border border-ott-border-soft/40 bg-white/65 p-6 shadow-sm backdrop-blur-sm dark:bg-white/5">
            <Badge className="mb-3 border-ott-border-soft/50 bg-transparent text-ott-text-secondary">
              Curated For You
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ott-text-primary sm:text-4xl">
              TV Shows
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ott-text-secondary sm:text-base">
              Explore top Bangla and international series with weekly drops and high-stakes finales.
            </p>
          </div>

          <div className="space-y-8">
            {showRows.map((row) => {
              const Icon = row.icon;

              return (
                <section key={row.title}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-ott-text-primary">
                      <Icon className={`size-5 ${row.accent}`} />
                      {row.title}
                    </h2>
                    <Button variant="ghost" size="sm" className="text-ott-text-secondary">
                      View All
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <article
                        key={`${row.title}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-ott-border-soft/40 bg-white/65 p-3 transition-all duration-300 hover:-translate-y-1 ott-card-hover ott-glow-violet dark:bg-white/5"
                      >
                        <div
                          className="aspect-2/3 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${getThumbnailByIndex(index + row.title.length)})` }}
                        />
                        <h3 className="mt-3 line-clamp-1 text-sm font-medium text-ott-text-primary">
                          {row.title} #{index + 1}
                        </h3>
                        <p className="mt-1 text-xs text-ott-text-secondary">Season {index + 1}</p>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}