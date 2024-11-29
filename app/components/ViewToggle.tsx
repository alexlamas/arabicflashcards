// app/components/ViewToggle.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { SquaresFour, Cards } from "@phosphor-icons/react";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

export function ViewToggle({
  onChange,
}: {
  current: "list" | "flashcard";
  onChange: (view: "list" | "flashcard") => void;
}) {
  return (
    <>
      <Tabs defaultValue="list">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger onClick={() => onChange("list")} value="list">
            <Tooltip>
              <TooltipTrigger asChild>
                <SquaresFour size={20} />
              </TooltipTrigger>
              <TooltipContent side="bottom">List view</TooltipContent>
            </Tooltip>
          </TabsTrigger>
          <TabsTrigger onClick={() => onChange("flashcard")} value="flashcard">
            <Tooltip>
              <TooltipTrigger asChild>
                <Cards size={20} />
              </TooltipTrigger>
              <TooltipContent side="bottom">Flashcards</TooltipContent>
            </Tooltip>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
}
