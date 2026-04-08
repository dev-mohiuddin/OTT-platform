"use client";

import { motion } from "motion/react";
import {
  Clapperboard,
  Languages,
  Radar,
  ShieldCheck,
  Tv,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GlowTone = "crimson" | "violet" | "emerald";
export type FeatureIconName = "tv" | "languages" | "shield" | "radar" | "clapperboard" | "zap";

interface FeatureCardProps {
  iconName: FeatureIconName;
  title: string;
  description: string;
  highlight: string;
  glowTone?: GlowTone;
}

const glowClassMap: Record<GlowTone, string> = {
  crimson: "ott-glow-crimson",
  violet: "ott-glow-violet",
  emerald: "ott-glow-emerald",
};

const iconMap: Record<FeatureIconName, LucideIcon> = {
  tv: Tv,
  languages: Languages,
  shield: ShieldCheck,
  radar: Radar,
  clapperboard: Clapperboard,
  zap: Zap,
};

export function FeatureCard({
  iconName,
  title,
  description,
  highlight,
  glowTone = "violet",
}: FeatureCardProps) {
  const Icon = iconMap[iconName];

  return (
    <motion.div
      whileHover={{ y: -1.5, scale: 1.004 }}
      transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-full"
    >
      <Card
        className={cn(
          "ott-card ott-card-hover h-full rounded-(--ott-radius-card) backdrop-blur-sm",
          glowClassMap[glowTone],
        )}
      >
        <CardHeader className="gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-xl border border-ott-border-soft bg-background/70 text-ott-brand-violet">
            <Icon className="size-5" />
          </span>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-ott-text-secondary">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="border-ott-border-strong text-ott-text-primary">
            {highlight}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
}