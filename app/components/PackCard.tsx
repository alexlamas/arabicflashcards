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
      className="h-full flex flex-col  transition-all bg-brand-fg/5 border-none !text-white cursor-pointer hover:bg-brand-fg/10 group p-4 gap-3"
    >
      <CardHeader className="flex-1 gap-1">
        <CardTitle className="text-3xl font-pphatton font-bold">
          {pack.name}
        </CardTitle>
        {pack.description && (
          <CardDescription className="mt-2 font-geist-mono text-base text-white">
            {pack.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size={"lg"}
            className="font-geist-mono rounded-full bg-transparent border-brand-fg flex-1 !text-brand-fg  !py-5 px-8 group-hover:bg-brand-fg/5 hover:scale-105 transition"
          >
            View
          </Button>
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
