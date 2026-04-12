import { Info, Play, Plus, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

export default function BrowsePage() {
  return (
    <div className="flex w-full flex-col pb-16">
      {/* Hero Header */}
      <section className="relative flex aspect-video min-h-125 max-h-[85vh] w-full flex-col justify-end overflow-hidden bg-ott-surface dark:bg-black/95">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2925&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-30"></div>
        <div className="absolute inset-0 z-10 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 z-10 bg-linear-to-r from-background via-background/40 to-transparent lg:w-2/3" />
        
        <div className="ott-shell relative z-20 mb-12 flex max-w-360 flex-col gap-5 md:mb-20">
          <Badge className="w-fit bg-ott-brand-violet hover:bg-ott-brand-violet/90 font-medium tracking-wide shadow-lg text-white">
            Top 10 Today
          </Badge>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground drop-shadow-xl md:text-7xl lg:text-8xl">
              Cinephile
            </h1>
            <p className="max-w-xl text-balance text-lg font-medium text-muted-foreground drop-shadow-sm md:text-xl">
              Immerse yourself in a world of award-winning filmmaking. Experience the pinnacle of visual storytelling in breathtaking 4K UHD.
            </p>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <Button size="lg" className="h-12 rounded-full gap-2 px-8 font-bold text-base ott-gradient-cta shadow-(--ott-shadow-glow-violet) hover:scale-105 transition-transform duration-300">
              <Play className="size-5 fill-current" />
              Watch Trailer
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full gap-2 px-8 font-semibold text-base backdrop-blur-md bg-background/20 border-border/40 hover:bg-background/40 hover:scale-105 transition-transform duration-300">
              <Info className="size-5" />
              More Details
            </Button>
          </div>
        </div>
      </section>

      <div className="ott-shell max-w-360 flex flex-col gap-12 -mt-8 relative z-30">
        {/* Trending Categories row */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2 tracking-tight">
              <TrendingUp className="size-5 text-ott-brand-violet" />
              Trending in Bangladesh
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group relative aspect-2/3 w-full overflow-hidden rounded-xl border border-border/50 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-ott-brand-violet/20 hover:border-ott-brand-violet/50 cursor-pointer"
              >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${getThumbnailByIndex(i)})` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white font-semibold line-clamp-2 leading-tight">Trending Release {i + 1}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-ott-brand-cyan">Action</span>
                        <span className="text-xs text-white/70">•</span>
                        <span className="text-[10px] font-medium text-white/90">2026</span>
                      </div>
                  </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Releases row */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2 tracking-tight">
            <Zap className="size-5 text-ott-brand-cyan" />
            Just Added
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`new-${i}`}
                className="group relative aspect-2/3 w-full overflow-hidden rounded-xl border border-border/50 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-ott-brand-cyan/20 hover:border-ott-brand-cyan/50 cursor-pointer"
              >
                 <div
                   className="absolute inset-0 bg-cover bg-center"
                   style={{ backgroundImage: `url(${getThumbnailByIndex(i + 6)})` }}
                 />
                 <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                 <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white font-semibold line-clamp-2 leading-tight">Dristy Original {i + 1}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] border-ott-brand-violet/50 text-ott-brand-violet bg-ott-brand-violet/10 px-1 py-0 shadow-none">New Episode</Badge>
                      </div>
                  </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}