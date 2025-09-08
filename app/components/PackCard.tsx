"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarterPack } from "../services/starterPackService";
import { Plus, Check } from "lucide-react";

interface PackCardProps {
  pack: StarterPack;
  onPreview: (pack: StarterPack) => void;
  onImport?: (pack: StarterPack) => void;
  isImported?: boolean;
  showImportButton?: boolean;
}

export function PackCard({
  pack,
  onPreview,
  onImport,
  isImported = false,
  showImportButton = false,
}: PackCardProps) {
  return (
    <Card
      onClick={() => onPreview(pack)}
      className="h-full flex flex-col transition bg-brand-accent !text-black hover:border-white/10 border border-transparent group p-3 sm:p-4 sm:gap-3 hover:scale-[1.02] cursor-pointer"
    >
      <CardHeader className="flex-1 gap-1 p-3 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-pphatton font-bold">
          {pack.name}
        </CardTitle>
        {pack.description && (
          <CardDescription className="mt-1 sm:mt-2 font-geist-mono text-sm sm:text-base text-black">
            {pack.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 p-3 sm:px-6">
        <div className="flex gap-2">
          <div className="opacity-50 font-geist-mono group-hover:opacity-80 transition">
            Click to browse pack
          </div>
          {showImportButton && onImport && (
            <Button
              className="flex-1"
              onClick={() => onImport(pack)}
              disabled={isImported}
            >
              {isImported ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Imported
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Import Pack
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
