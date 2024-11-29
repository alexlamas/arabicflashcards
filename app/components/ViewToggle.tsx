// app/components/ViewToggle.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeClosed } from "@phosphor-icons/react";

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
            <Eye size={20} />
          </TabsTrigger>
          <TabsTrigger onClick={() => onChange("flashcard")} value="flashcard">
            <EyeClosed size={20} />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
}
