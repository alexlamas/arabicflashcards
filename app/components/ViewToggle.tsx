// app/components/ViewToggle.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeClosed, List } from "@phosphor-icons/react";

export function ViewToggle({
  onChange,
}: {
  current: "list" | "card" | "flashcard";
  onChange: (view: "list" | "card" | "flashcard") => void;
}) {
  return (
    <>
      <Tabs defaultValue="list">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger onClick={() => onChange("list")} value="list">
            <List size={20} />
          </TabsTrigger>
          <TabsTrigger onClick={() => onChange("card")} value="card">
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
