"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Play, ChevronRight } from "lucide-react";
import { DashboardPackCard } from "@/app/components/DashboardPackCard";
import { WelcomeBanner } from "@/app/components/WelcomeBanner";
import { StarterPack } from "@/app/services/starterPackService";
import Link from "next/link";
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

// Mock packs for demos (no image_url to show fallback icons)
const mockPacks: StarterPack[] = [
  {
    id: "1",
    name: "Greetings",
    description: "Essential greetings and polite phrases",
    language: "lebanese",
    level: "beginner",
    is_active: true,
    image_url: null,
    icon: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Numbers",
    description: "Learn to count in Lebanese",
    language: "lebanese",
    level: "beginner",
    is_active: true,
    image_url: null,
    icon: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Common foods",
    description: "Food and drink vocabulary",
    language: "lebanese",
    level: "intermediate",
    is_active: true,
    image_url: null,
    icon: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Family members",
    description: "Family and relationship terms",
    language: "lebanese",
    level: "advanced",
    is_active: true,
    image_url: null,
    icon: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function DesignSystemPage() {
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
                "Logo",
                "DashboardPackCard",
                "ProgressBar",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <StateLabel label="Installed (with progress)" />
                <DashboardPackCard
                  pack={mockPacks[0]}
                  variant="installed"
                  progress={{ learned: 5, total: 8 }}
                  onClick={() => {}}
                />
              </div>

              <div>
                <StateLabel label="With Review Button" />
                <DashboardPackCard
                  pack={mockPacks[1]}
                  variant="installed"
                  progress={{ learned: 3, total: 10 }}
                  onClick={() => {}}
                  actionSlot={
                    <Link href="#">
                      <Button size="sm" className="gap-1" style={{ backgroundColor: theme.primary }}>
                        <Play className="w-3 h-3" />5
                      </Button>
                    </Link>
                  }
                />
              </div>

              <div>
                <StateLabel label="Available (not installed)" />
                <DashboardPackCard
                  pack={mockPacks[2]}
                  variant="available"
                  progress={{ learned: 0, total: 10 }}
                  onClick={() => {}}
                />
              </div>

              <div>
                <StateLabel label="Completed (100%)" />
                <DashboardPackCard
                  pack={mockPacks[3]}
                  variant="installed"
                  progress={{ learned: 8, total: 8 }}
                  onClick={() => {}}
                />
              </div>
            </div>
          </ComponentSection>
        </div>

        {/* Progress Bar */}
        <div id="progressbar">
          <ComponentSection
            name="ProgressBar"
            path="app/components/Dashboard.tsx (inline)"
            description="Overall progress indicator"
          >
            <div className="space-y-4">
              <div>
                <StateLabel label="Default (67%)" />
                <div className="bg-white border rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall progress</span>
                    <span className="text-sm text-gray-500">24/36 words learned</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: "67%" }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">67% complete</p>
                </div>
              </div>

              <div>
                <StateLabel label="Empty (0%)" />
                <div className="bg-white border rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall progress</span>
                    <span className="text-sm text-gray-500">0/36 words learned</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">0% complete</p>
                </div>
              </div>
            </div>
          </ComponentSection>
        </div>

        {/* Welcome Banner */}
        <div id="welcomebanner">
          <ComponentSection
            name="WelcomeBanner"
            path="app/components/WelcomeBanner.tsx"
            description="Hero banner on the dashboard"
          >
            <div className="space-y-4">
              <div>
                <StateLabel label="With Reviews Available" />
                <WelcomeBanner firstName="Alex" reviewCount={12} />
              </div>

              <div>
                <StateLabel label="All Caught Up" />
                <WelcomeBanner firstName="Alex" reviewCount={0} />
              </div>

              <div>
                <StateLabel label="Loading" />
                <WelcomeBanner firstName="Alex" reviewCount={0} isLoading />
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
