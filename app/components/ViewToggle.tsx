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
          <Tooltip>
            <TooltipTrigger>
              <TabsTrigger onClick={() => onChange("list")} value="list">
                <SquaresFour size={20} />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">List view</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <TabsTrigger
                onClick={() => onChange("flashcard")}
                value="flashcard"
              >
                <Cards size={20} />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Flashcards</TooltipContent>
          </Tooltip>
        </TabsList>
      </Tabs>
    </>
  );
}
