import { Gamepad2, Laugh, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

const kidsRows = [
  { title: "Cartoon Favorites", icon: Laugh, tone: "from-pink-400/25 to-yellow-300/15" },
  { title: "Adventure Time", icon: Rocket, tone: "from-cyan-400/25 to-emerald-300/15" },
  { title: "Game Heroes", icon: Gamepad2, tone: "from-violet-400/25 to-blue-300/15" },
];

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#fff6ea] via-[#f3f8ff] to-[#fff6ea] dark:from-black dark:via-[#131628] dark:to-black">
      <section className="ott-shell py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-3xl border border-ott-border-soft/40 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:bg-white/5">
            <Badge className="mb-3 rounded-full border-ott-border-soft/50 bg-white/70 text-ott-text-secondary dark:bg-white/10">
              Safe Mode
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ott-text-primary sm:text-4xl">
              Kids Zone
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ott-text-secondary sm:text-base">
              Fun, colorful, and family-friendly stories curated for younger viewers.
            </p>
          </div>

          <div className="space-y-8">
            {kidsRows.map((row, rowIndex) => {
              const Icon = row.icon;

              return (
                <section key={row.title}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-ott-text-primary">
                      <Icon className="size-5 text-ott-accent" />
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
                        className="group relative overflow-hidden rounded-2xl border border-ott-border-soft/40 bg-white/75 p-3 transition-all duration-300 hover:-translate-y-1 ott-card-hover ott-glow-violet dark:bg-white/5"
                      >
                        <div
                          className={`absolute inset-0 bg-linear-to-br ${row.tone} opacity-65`}
                          aria-hidden="true"
                        />
                        <div
                          className="relative aspect-2/3 rounded-xl bg-cover bg-center"
                          style={{ backgroundImage: `url(${getThumbnailByIndex(rowIndex * 6 + index + 5)})` }}
                        />
                        <h3 className="relative mt-3 line-clamp-1 text-sm font-medium text-ott-text-primary">
                          Kids Pick {index + 1}
                        </h3>
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