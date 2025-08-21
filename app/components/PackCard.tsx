"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarterPack } from "../services/starterPackService";
import { BookOpen, Users, Sparkles, Package, Globe, Brain, Coffee, Eye, Plus, Check } from "lucide-react";

interface PackCardProps {
  pack: StarterPack;
  onPreview: (pack: StarterPack) => void;
  onImport?: (pack: StarterPack) => void;
  isImported?: boolean;
  showImportButton?: boolean;
}

export function PackCard({ pack, onPreview, onImport, isImported = false, showImportButton = false }: PackCardProps) {
  function getLevelIcon(level: string | null) {
    switch (level) {
      case "beginner":
        return <BookOpen className="h-4 w-4" />;
      case "intermediate":
        return <Users className="h-4 w-4" />;
      case "advanced":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  }

  function getPackIcon(name: string) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("travel") || lowerName.includes("tourist")) {
      return <Globe className="h-8 w-8 text-blue-500" />;
    }
    if (lowerName.includes("essential") || lowerName.includes("basic")) {
      return <Brain className="h-8 w-8 text-green-500" />;
    }
    if (lowerName.includes("food") || lowerName.includes("restaurant")) {
      return <Coffee className="h-8 w-8 text-orange-500" />;
    }
    return <Package className="h-8 w-8 text-purple-500" />;
  }

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-lg border-2 hover:border-blue-200">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            {getPackIcon(pack.name)}
          </div>
          <div className="flex items-center gap-2">
            {pack.level && (
              <Badge variant="outline" className="capitalize">
                {getLevelIcon(pack.level)}
                <span className="ml-1">{pack.level}</span>
              </Badge>
            )}
            {isImported && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Imported
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-xl">{pack.name}</CardTitle>
        {pack.description && (
          <CardDescription className="mt-2">
            {pack.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onPreview(pack)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
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