import { PublicFooter } from "@/components/ott/layout/public-footer";
import { PublicHeader } from "@/components/ott/navigation/public-header";
import { ContentRailsSection } from "@/components/ott/sections/content-rails-section";
import { FaqSection } from "@/components/ott/sections/faq-section";
import { FeatureSection } from "@/components/ott/sections/feature-section";
import { HeroSection } from "@/components/ott/sections/hero-section";
import { PricingTeaserSection } from "@/components/ott/sections/pricing-teaser-section";
import { ShowcaseSection } from "@/components/ott/sections/showcase-section";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-(image:--ott-gradient-page) text-foreground">
      <PublicHeader />
      <main className="overflow-x-clip">
        <HeroSection />
        <ContentRailsSection />
        <FeatureSection />
        <ShowcaseSection />
        <PricingTeaserSection />
        <FaqSection />
      </main>
      <PublicFooter />
    </div>
  );
}