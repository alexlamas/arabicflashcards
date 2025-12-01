"use client";

import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { PacksShowcase } from "./PacksShowcase";
import { Footer } from "./Footer";

export function NotionLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PacksShowcase />
      </main>
      <Footer />
    </div>
  );
}
