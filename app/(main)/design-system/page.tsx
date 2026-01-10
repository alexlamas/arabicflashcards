"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, ChevronRight, Play } from "lucide-react";
import { DashboardPackCard } from "@/app/components/DashboardPackCard";
import { WelcomeBanner } from "@/app/components/WelcomeBanner";
import { ProgressBreakdown } from "@/app/components/ProgressBreakdown";
import { Word } from "@/app/types/word";
import { StarterPackService, StarterPack } from "@/app/services/starterPackService";
import Image from "next/image";

// Helper component for displaying components with copy-able names
function ComponentSection({
  name,
  path,
  children,
  description,
}: {
  name: string;
  path: string;
  children: React.ReactNode;
  description?: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border rounded-xl p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <button
              onClick={() => copyToClipboard(name, "name")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy component name"
            >
              {copied === "name" ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <button
            onClick={() => copyToClipboard(path, "path")}
            className="text-sm text-gray-500 hover:text-gray-700 font-mono flex items-center gap-1 mt-1"
          >
            {path}
            {copied === "path" ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
          {description && (
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function StateLabel({ label }: { label: string }) {
  return (
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
      {label}
    </div>
  );
}

function ColorSwatch({ name, hex, className }: { name: string; hex: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copyToClipboard} className="text-left group">
      <div className={`h-20 rounded-lg mb-2 ${className}`} style={{ backgroundColor: hex }} />
      <p className="text-sm font-medium flex items-center gap-1">
        {name}
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </p>
      <p className="text-xs text-gray-500">{hex}</p>
    </button>
  );
}

// Helper to create mock words for ProgressBreakdown demos
function createMockWords({ learned, learning, newWords }: { learned: number; learning: number; newWords: number }): Word[] {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneMonth = 30 * oneDay;

  const words: Word[] = [];

  // Learned words (next_review > 1 month)
  for (let i = 0; i < learned; i++) {
    words.push({
      id: `learned-${i}`,
      arabic: "مثال",
      english: "example",
      transliteration: "mithal",
      status: "learning",
      next_review_date: new Date(now.getTime() + oneMonth + oneDay * (i + 1)).toISOString(),
    } as Word);
  }

  // Learning words (next_review 1 day to 1 month)
  for (let i = 0; i < learning; i++) {
    words.push({
      id: `learning-${i}`,
      arabic: "مثال",
      english: "example",
      transliteration: "mithal",
      status: "learning",
      next_review_date: new Date(now.getTime() + oneDay * 2 + oneDay * (i % 28)).toISOString(),
    } as Word);
  }

  // New words (next_review within 1 day)
  for (let i = 0; i < newWords; i++) {
    words.push({
      id: `new-${i}`,
      arabic: "مثال",
      english: "example",
      transliteration: "mithal",
      status: "learning",
      next_review_date: new Date(now.getTime() + 1000 * 60 * 60 * (i % 24)).toISOString(),
    } as Word);
  }

  return words;
}

export default function DesignSystemPage() {
  const [packs, setPacks] = useState<StarterPack[]>([]);

  useEffect(() => {
    StarterPackService.getAvailablePacks().then(setPacks);
  }, []);
  // Theme colors from NotionLandingPage
  const theme = {
    primary: "#47907d",
    primaryLight: "#e8f3f0",
  };

  const ratingColors = {
    forgot: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
    struggled: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
    remembered: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 lg:pt-24 space-y-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Design System</h1>
          <p className="text-gray-600">
            Component library for Yalla Flash. Click to copy names, paths, or colors.
          </p>
        </div>

        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Colors",
                "Gray Audit",
                "Logo",
                "DashboardPackCard",
                "ProgressBreakdown",
                "WelcomeBanner",
                "Button",
                "RatingButtons",
              ].map((name) => (
                <a
                  key={name}
                  href={`#${name.toLowerCase()}`}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                >
                  {name}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <div id="colors">
          <ComponentSection
            name="Colors"
            path="app/components/landing/NotionLandingPage.tsx"
            description="Theme colors used throughout the app"
          >
            <div>
              <StateLabel label="Primary Theme" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <ColorSwatch name="primary" hex="#47907d" />
                <ColorSwatch name="primaryLight" hex="#e8f3f0" />
                <ColorSwatch name="white" hex="#ffffff" className="border" />
                <ColorSwatch name="gray-900" hex="#111827" />
              </div>
            </div>

            <div>
              <StateLabel label="Rating Colors" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Forgot</p>
                  <div className="flex gap-2">
                    <ColorSwatch name="bg" hex="#fef2f2" className="border" />
                    <ColorSwatch name="border" hex="#fecaca" />
                    <ColorSwatch name="text" hex="#b91c1c" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Struggled</p>
                  <div className="flex gap-2">
                    <ColorSwatch name="bg" hex="#fffbeb" className="border" />
                    <ColorSwatch name="border" hex="#fde68a" />
                    <ColorSwatch name="text" hex="#b45309" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Remembered</p>
                  <div className="flex gap-2">
                    <ColorSwatch name="bg" hex="#f0fdf4" className="border" />
                    <ColorSwatch name="border" hex="#bbf7d0" />
                    <ColorSwatch name="text" hex="#15803d" />
                  </div>
                </div>
              </div>
            </div>

          </ComponentSection>
        </div>

        {/* Gray Text Audit */}
        <div id="gray-audit">
          <ComponentSection
            name="Gray Text Audit"
            path="Design System Audit"
            description="Comparison of current gray usage vs proposed standardization"
          >
            {/* Current vs Proposed */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Current (Inconsistent) */}
              <div className="space-y-4">
                <StateLabel label="Current Usage (Inconsistent)" />
                <div className="bg-white border rounded-xl p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Card Title</p>
                    <p className="text-gray-500">Description using gray-500</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Another Card Title</p>
                    <p className="text-gray-600">Description using gray-600</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-gray-400">Muted text gray-400</p>
                    <p className="text-gray-500">Also muted gray-500</p>
                  </div>
                </div>
                <p className="text-xs text-red-500">Problem: Same purpose, different grays</p>
              </div>

              {/* Proposed (Standardized) */}
              <div className="space-y-4">
                <StateLabel label="Proposed Standard" />
                <div className="bg-white border rounded-xl p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Card Title (gray-900)</p>
                    <p className="text-gray-600">Description always gray-600</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Another Card Title (gray-900)</p>
                    <p className="text-gray-600">Description always gray-600</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-gray-500">Muted text always gray-500</p>
                    <p className="text-gray-400">Disabled/placeholder gray-400</p>
                  </div>
                </div>
                <p className="text-xs text-green-600">Consistent hierarchy</p>
              </div>
            </div>

            {/* Gray Scale Reference */}
            <div className="mt-8">
              <StateLabel label="Proposed Gray Scale" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="w-full h-8 bg-gray-900 rounded mb-2" />
                  <p className="text-sm font-medium">gray-900</p>
                  <p className="text-xs text-gray-500">Primary text, headings</p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <div className="w-full h-8 bg-gray-600 rounded mb-2" />
                  <p className="text-sm font-medium">gray-600</p>
                  <p className="text-xs text-gray-500">Body text, descriptions</p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <div className="w-full h-8 bg-gray-500 rounded mb-2" />
                  <p className="text-sm font-medium">gray-500</p>
                  <p className="text-xs text-gray-500">Secondary/muted text</p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <div className="w-full h-8 bg-gray-400 rounded mb-2" />
                  <p className="text-sm font-medium">gray-400</p>
                  <p className="text-xs text-gray-500">Disabled, placeholders</p>
                </div>
              </div>
            </div>

            {/* Real Component Examples */}
            <div className="mt-8">
              <StateLabel label="Real Examples - Before & After" />
              <div className="space-y-6">

                {/* Example 1: Dashboard Card */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">BEFORE: Dashboard.tsx:247</p>
                    <div className="bg-white border rounded-2xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📚</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">My words</h3>
                          <p className="text-sm text-gray-500">12 personal words & expressions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-2">AFTER: Standardized</p>
                    <div className="bg-white border rounded-2xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📚</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">My words</h3>
                          <p className="text-sm text-gray-600">12 personal words & expressions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example 2: Footer Links */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">BEFORE: PublicFooter.tsx (mixed grays)</p>
                    <div className="bg-gray-50 border rounded-xl p-4">
                      <div className="flex gap-6 text-sm">
                        <span className="text-gray-500">Home</span>
                        <span className="text-gray-500">All Packs</span>
                        <span className="text-gray-500">Resources</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">Made with ❤️ by Alex</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-2">AFTER: Standardized</p>
                    <div className="bg-gray-50 border rounded-xl p-4">
                      <div className="flex gap-6 text-sm">
                        <span className="text-gray-600">Home</span>
                        <span className="text-gray-600">All Packs</span>
                        <span className="text-gray-600">Resources</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">Made with ❤️ by Alex</p>
                    </div>
                  </div>
                </div>

                {/* Example 3: Word Detail */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">BEFORE: WordDetailModal (inconsistent)</p>
                    <div className="bg-white border rounded-xl p-4">
                      <p className="text-2xl font-arabic mb-1">مرحبا</p>
                      <p className="text-gray-500">marhaba</p>
                      <p className="text-gray-600 mt-2">hello, welcome</p>
                      <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full mt-2 inline-block">phrase</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-2">AFTER: Standardized</p>
                    <div className="bg-white border rounded-xl p-4">
                      <p className="text-2xl font-arabic mb-1">مرحبا</p>
                      <p className="text-gray-500">marhaba</p>
                      <p className="text-gray-600 mt-2">hello, welcome</p>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full mt-2 inline-block">phrase</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </ComponentSection>
        </div>

        {/* Logo */}
        <div id="logo">
          <ComponentSection
            name="Logo"
            path="public/logo.svg"
            description="The cedar tree logo used throughout the app"
          >
            <div className="flex items-center gap-8 flex-wrap">
              <div>
                <StateLabel label="Large (128px)" />
                <div className="bg-white border p-4 rounded-xl inline-block">
                  <Image src="/logo.svg" alt="Logo" width={128} height={128} />
                </div>
              </div>
              <div>
                <StateLabel label="Medium (64px)" />
                <div className="bg-white border p-4 rounded-xl inline-block">
                  <Image src="/logo.svg" alt="Logo" width={64} height={64} />
                </div>
              </div>
              <div>
                <StateLabel label="Small (32px)" />
                <div className="bg-white border p-4 rounded-xl inline-block">
                  <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                </div>
              </div>
            </div>
          </ComponentSection>
        </div>

        {/* Dashboard Pack Card */}
        <div id="dashboardpackcard">
          <ComponentSection
            name="DashboardPackCard"
            path="app/components/DashboardPackCard.tsx"
            description="Reusable pack card component for the dashboard"
          >
            {packs.length >= 4 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <StateLabel label="Installed (with progress)" />
                  <DashboardPackCard
                    pack={packs[0]}
                    variant="installed"
                    progress={{ learned: 5, total: 8 }}
                    onClick={() => {}}
                  />
                </div>

                <div>
                  <StateLabel label="In Progress" />
                  <DashboardPackCard
                    pack={packs[1]}
                    variant="installed"
                    progress={{ learned: 3, total: 10 }}
                    onClick={() => {}}
                  />
                </div>

                <div>
                  <StateLabel label="Available (not installed)" />
                  <DashboardPackCard
                    pack={packs[2]}
                    variant="available"
                    progress={{ learned: 0, total: 10 }}
                    onClick={() => {}}
                  />
                </div>

                <div>
                  <StateLabel label="Completed (100%)" />
                  <DashboardPackCard
                    pack={packs[3]}
                    variant="installed"
                    progress={{ learned: 8, total: 8 }}
                    onClick={() => {}}
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading packs...</div>
            )}
          </ComponentSection>
        </div>

        {/* Progress Breakdown */}
        <div id="progressbreakdown">
          <ComponentSection
            name="ProgressBreakdown"
            path="app/components/ProgressBreakdown.tsx"
            description="Segmented progress bar showing learned, learning, and new words"
          >
            <div className="space-y-4">
              <div>
                <StateLabel label="Mixed Progress" />
                <ProgressBreakdown
                  words={createMockWords({ learned: 133, learning: 87, newWords: 51 })}
                />
              </div>

              <div>
                <StateLabel label="Mostly Learned" />
                <ProgressBreakdown
                  words={createMockWords({ learned: 180, learning: 15, newWords: 5 })}
                />
              </div>

              <div>
                <StateLabel label="Just Starting" />
                <ProgressBreakdown
                  words={createMockWords({ learned: 5, learning: 20, newWords: 75 })}
                />
              </div>
            </div>
          </ComponentSection>
        </div>

        {/* Welcome Banner */}
        <div id="welcomebanner">
          <ComponentSection
            name="WelcomeBanner"
            path="app/components/WelcomeBanner.tsx"
            description="Hero banner with fluency level display"
          >
            <div className="space-y-4">
              <div>
                <StateLabel label="First Time User (no words)" />
                <WelcomeBanner firstName="Alex" reviewCount={0} learnedCount={0} totalWords={0} />
              </div>

              <div>
                <StateLabel label="Tourist Level - Has Reviews (0-49 words)" />
                <WelcomeBanner firstName="Alex" reviewCount={8} learnedCount={12} totalWords={50} />
              </div>

              <div>
                <StateLabel label="Visitor Level - Has Reviews (50-149 words)" />
                <WelcomeBanner firstName="Alex" reviewCount={15} learnedCount={87} totalWords={120} />
              </div>

              <div>
                <StateLabel label="Resident Level - Has Reviews (150-349 words)" />
                <WelcomeBanner firstName="Alex" reviewCount={5} learnedCount={220} totalWords={280} />
              </div>

              <div>
                <StateLabel label="Local Level - Has Reviews (350+ words)" />
                <WelcomeBanner firstName="Alex" reviewCount={3} learnedCount={400} totalWords={450} />
              </div>

              <div>
                <StateLabel label="All Caught Up (Visitor)" />
                <WelcomeBanner firstName="Alex" reviewCount={0} learnedCount={87} totalWords={120} />
              </div>

              <div>
                <StateLabel label="Loading" />
                <WelcomeBanner firstName="Alex" reviewCount={0} learnedCount={0} totalWords={0} isLoading />
              </div>
            </div>
          </ComponentSection>
        </div>

        {/* Buttons */}
        <div id="button">
          <ComponentSection
            name="Button"
            path="components/ui/button.tsx"
            description="Button component from shadcn/ui"
          >
            <div className="space-y-4">
              <div>
                <StateLabel label="Variants" />
                <div className="flex flex-wrap gap-3">
                  <Button style={{ backgroundColor: theme.primary }}>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <div>
                <StateLabel label="Sizes" />
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" style={{ backgroundColor: theme.primary }}>Small</Button>
                  <Button size="default" style={{ backgroundColor: theme.primary }}>Default</Button>
                  <Button size="lg" style={{ backgroundColor: theme.primary }}>Large</Button>
                </div>
              </div>

              <div>
                <StateLabel label="With Icons" />
                <div className="flex flex-wrap gap-3">
                  <Button style={{ backgroundColor: theme.primary }}>
                    <Play className="w-4 h-4 mr-2" />
                    Start review
                  </Button>
                  <Button variant="outline">
                    View all
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div>
                <StateLabel label="States" />
                <div className="flex flex-wrap gap-3">
                  <Button disabled style={{ backgroundColor: theme.primary }}>Disabled</Button>
                  <Button className="pointer-events-none opacity-70" style={{ backgroundColor: theme.primary }}>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Loading...
                  </Button>
                </div>
              </div>
            </div>
          </ComponentSection>
        </div>

        {/* Rating Buttons */}
        <div id="ratingbuttons">
          <ComponentSection
            name="RatingButtons"
            path="app/components/review/Review.tsx"
            description="Flashcard rating buttons"
          >
            <div className="space-y-4">
              <div>
                <StateLabel label="Default" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl">
                  <Button
                    variant="outline"
                    className="flex items-center w-full font-semibold"
                    style={{
                      backgroundColor: ratingColors.forgot.bg,
                      borderColor: ratingColors.forgot.border,
                      color: ratingColors.forgot.text,
                    }}
                  >
                    Forgot
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center w-full font-semibold"
                    style={{
                      backgroundColor: ratingColors.struggled.bg,
                      borderColor: ratingColors.struggled.border,
                      color: ratingColors.struggled.text,
                    }}
                  >
                    Struggled
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center w-full font-semibold"
                    style={{
                      backgroundColor: ratingColors.remembered.bg,
                      borderColor: ratingColors.remembered.border,
                      color: ratingColors.remembered.text,
                    }}
                  >
                    Remembered
                  </Button>
                  <Button
                    className="flex items-center w-full font-semibold text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Perfect
                  </Button>
                </div>
              </div>
            </div>
          </ComponentSection>
        </div>
      </div>
    </div>
  );
}
