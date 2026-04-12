import Link from "next/link";
import { Clock3, Play, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

const continueWatching = [
  { id: 1, title: "Midnight Archive", episode: "S1 • Episode 4", progress: 38 },
  { id: 2, title: "City of Echoes", episode: "S2 • Episode 1", progress: 74 },
  { id: 3, title: "Code of Rain", episode: "S1 • Episode 8", progress: 62 },
  { id: 4, title: "Glass Horizon", episode: "S3 • Episode 2", progress: 19 },
];

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-ott-bg-primary via-ott-bg-secondary/45 to-ott-bg-primary dark:from-black dark:via-ott-bg-secondary/20 dark:to-black">
      <section className="ott-shell py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-2xl border border-ott-border-soft/40 bg-white/65 p-6 shadow-sm backdrop-blur-sm dark:bg-white/5">
            <Badge className="mb-3 border-ott-border-soft/50 bg-transparent text-ott-text-secondary">
              Keep Watching
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ott-text-primary sm:text-4xl">
              Watchlist
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ott-text-secondary sm:text-base">
              Resume unfinished titles and jump back in exactly where you left off.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {continueWatching.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-xl border border-ott-border-soft/40 bg-white/65 p-3 transition-all duration-300 hover:-translate-y-1 ott-card-hover ott-glow-violet dark:bg-white/5"
              >
                <div
                  className="mb-3 aspect-video rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${getThumbnailByIndex(item.id + 4)})` }}
                />

                <h2 className="line-clamp-1 text-sm font-semibold text-ott-text-primary">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-ott-text-secondary">{item.episode}</p>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-ott-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3" />
                      Progress
                    </span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="h-8 flex-1 rounded-full ott-gradient-cta text-xs text-white">
                    <Play className="mr-1 size-3.5 fill-current" />
                    Resume
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-full border-ott-border-soft/40">
                    <TimerReset className="size-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="border-ott-border-soft/50 bg-white/60 dark:bg-white/5">
              <Link href="/browse">Discover More Titles</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}