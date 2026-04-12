import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

const featured = [
  { slug: "midnight-archive", title: "Midnight Archive" },
  { slug: "city-of-echoes", title: "City of Echoes" },
  { slug: "monsoon-code", title: "Monsoon Code" },
  { slug: "glass-horizon", title: "Glass Horizon" },
];

export default function WatchIndexPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-black via-[#0b0a14] to-black text-white">
      <section className="ott-shell py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Watch</h1>
            <p className="mt-2 text-sm text-white/75 sm:text-base">Pick a title and jump straight into playback.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((item, index) => (
              <article
                key={item.slug}
                className="group overflow-hidden rounded-xl border border-white/15 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 ott-card-hover ott-glow-violet"
              >
                <div
                  className="aspect-2/3 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${getThumbnailByIndex(index + 9)})` }}
                />
                <h2 className="mt-3 line-clamp-1 text-sm font-medium text-white/90">{item.title}</h2>
                <Button asChild size="sm" className="mt-3 h-8 w-full rounded-full ott-gradient-cta text-xs text-white">
                  <Link href={`/watch/${item.slug}`}>
                    <PlayCircle className="mr-1 size-3.5" />
                    Play
                  </Link>
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button asChild variant="ghost" className="text-white/85 hover:text-white">
              <Link href="/browse">
                Back To Browse
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}