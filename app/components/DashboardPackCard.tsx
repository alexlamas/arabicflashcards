"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { StarterPack } from "@/app/services/starterPackService";
import {
  Hamburger,
  Users,
  HandWaving,
  Clock,
  Hash,
  Question,
  Package,
} from "@phosphor-icons/react";

type PackLevel = "beginner" | "intermediate" | "advanced";

const LEVEL_CONFIG: Record<PackLevel, { label: string; color: string; bgColor: string }> = {
  beginner: { label: "Beginner", color: "text-green-600", bgColor: "bg-green-100" },
  intermediate: { label: "Intermediate", color: "text-blue-600", bgColor: "bg-blue-100" },
  advanced: { label: "Advanced", color: "text-purple-600", bgColor: "bg-purple-100" },
};

function getPackIcon(packName: string) {
  const name = packName.toLowerCase();
  if (name.includes("food")) return Hamburger;
  if (name.includes("family")) return Users;
  if (name.includes("greet")) return HandWaving;
  if (name.includes("time") || name.includes("calendar")) return Clock;
  if (name.includes("number")) return Hash;
  if (name.includes("question")) return Question;
  return Package;
}

interface DashboardPackCardProps {
  pack: StarterPack;
  onClick?: () => void;
  variant?: "installed" | "available";
  progress?: {
    learned: number;
    total: number;
  };
  sentenceCount?: number;
  actionSlot?: React.ReactNode;
}

export function DashboardPackCard({
  pack,
  onClick,
  variant = "available",
  progress,
  sentenceCount = 0,
  actionSlot,
}: DashboardPackCardProps) {
  const config = LEVEL_CONFIG[pack.level as PackLevel] || LEVEL_CONFIG.beginner;
  const PackIcon = getPackIcon(pack.name);
  const percent = progress ? Math.round((progress.learned / progress.total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-xl overflow-hidden text-left hover:border-gray-300 hover:shadow-sm transition-all group flex flex-row cursor-pointer"
    >
      {pack.image_url ? (
        <div className="w-24 h-24 m-1 rounded-lg overflow-hidden relative flex-shrink-0">
          <Image
            src={pack.image_url}
            alt={pack.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className={`w-24 h-24 flex-shrink-0 flex items-center justify-center ${config.bgColor}`}>
          <PackIcon className={`w-8 h-8 ${config.color}`} />
        </div>
      )}

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="font-medium">{pack.name}</h3>
            <span className={`text-sm ${config.color}`}>{config.label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>

        {variant === "installed" && progress ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                {progress.learned}/{progress.total} learned
              </span>
              <span className="font-medium">{percent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {progress?.total || 0} {(progress?.total || 0) === 1 ? "word" : "words"}
            {sentenceCount > 0 && ` · ${sentenceCount} ${sentenceCount === 1 ? "sentence" : "sentences"}`}
          </p>
        )}
      </div>

      {actionSlot && (
        <div className="pr-3 flex items-center">
          {actionSlot}
        </div>
      )}
    </div>
  );
}
