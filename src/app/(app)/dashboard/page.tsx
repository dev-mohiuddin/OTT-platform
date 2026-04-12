import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, Clock3, Eye, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/auth/access";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { getThumbnailByIndex } from "@/lib/constants/thumbnails";

export default async function DashboardPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const permissions = session?.user?.permissions ?? [];

  if (session?.user?.id && hasPermission({ roles, permissions }, ADMIN_PERMISSION.PANEL_ACCESS)) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-ott-bg-primary via-ott-bg-secondary/45 to-ott-bg-primary dark:from-black dark:via-ott-bg-secondary/20 dark:to-black">
      <section className="ott-shell py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-2xl border border-ott-border-soft/40 bg-white/65 p-6 shadow-sm backdrop-blur-sm dark:bg-white/5">
            <Badge className="mb-3 border-ott-border-soft/50 bg-white/70 text-ott-text-secondary dark:bg-white/10">
              <Sparkles className="mr-1 size-3.5 text-ott-accent" />
              Personal Overview
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ott-text-primary sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-sm text-ott-text-secondary sm:text-base">Track your activity, continue watching, and discover recommendations.</p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-ott-border-soft/30 bg-white/60 dark:bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-ott-text-secondary inline-flex items-center gap-2"><Eye className="size-4" /> Hours Watched</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-ott-text-primary">128h</p>
              </CardContent>
            </Card>
            <Card className="border-ott-border-soft/30 bg-white/60 dark:bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-ott-text-secondary inline-flex items-center gap-2"><Clock3 className="size-4" /> Continue Watching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-ott-text-primary">7 titles</p>
              </CardContent>
            </Card>
            <Card className="border-ott-border-soft/30 bg-white/60 dark:bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-ott-text-secondary inline-flex items-center gap-2"><BarChart3 className="size-4" /> Top Genre</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-ott-text-primary">Thriller</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <article
                key={index}
                className="group overflow-hidden rounded-xl border border-ott-border-soft/40 bg-white/65 p-3 transition-all duration-300 hover:-translate-y-1 ott-card-hover ott-glow-violet dark:bg-white/5"
              >
                <div
                  className="aspect-2/3 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${getThumbnailByIndex(index + 8)})` }}
                />
                <p className="mt-3 line-clamp-1 text-sm font-medium text-ott-text-primary">Recommended #{index + 1}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button asChild className="ott-gradient-cta text-white">
              <Link href="/browse">Go To Browse</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}