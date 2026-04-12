import { Clock3, PlayCircle, Star, Subtitles, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

interface WatchPageProps {
  params: {
    slug: string;
  };
}

function toTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function WatchPage({ params }: WatchPageProps) {
  const title = toTitle(params.slug || "featured-title");

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-[#0b0a14] to-black text-white">
      <section className="ott-shell py-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-white/75">
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">Now Playing</Badge>
            <span className="inline-flex items-center gap-1"><Star className="size-3.5 text-amber-400" /> 8.9</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> 2h 06m</span>
            <span className="inline-flex items-center gap-1"><Subtitles className="size-3.5" /> Bangla, English</span>
          </div>

          <h1 className="mb-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>

          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <div className="relative aspect-video w-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${getThumbnailByIndex(11)})` }}
              />
              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute inset-0 flex items-center justify-center">
                <Button className="h-14 rounded-full px-8 text-base ott-gradient-cta text-white">
                  <PlayCircle className="mr-2 size-5" />
                  Play
                </Button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/15 bg-black/45 px-4 py-2 backdrop-blur-sm">
                <span className="text-sm text-white/90">00:31 / 02:06:14</span>
                <span className="inline-flex items-center gap-2 text-sm text-white/85">
                  <Volume2 className="size-4" />
                  Stereo
                </span>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-white">Up Next</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={index}
                  className="group overflow-hidden rounded-xl border border-white/12 bg-white/5 p-2 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 ott-card-hover ott-glow-violet"
                >
                  <div
                    className="aspect-2/3 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${getThumbnailByIndex(index + 1)})` }}
                  />
                  <p className="mt-2 line-clamp-1 text-xs font-medium text-white/90">Episode {index + 1}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}