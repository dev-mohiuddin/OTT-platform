"use client";

import { MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label="Toggle light and dark mode"
      className={cn("border-ott-border-soft bg-card/80 backdrop-blur-sm", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <SunIcon
        className={cn(
          "transition-all duration-300",
          isDark ? "scale-90 opacity-0" : "scale-100 opacity-100",
        )}
      />
      <MoonStarIcon
        className={cn(
          "absolute transition-all duration-300",
          isDark ? "scale-100 opacity-100" : "scale-90 opacity-0",
        )}
      />
    </Button>
  );
}