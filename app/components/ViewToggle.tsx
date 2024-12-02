import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeClosed, List } from "@phosphor-icons/react";

type ViewMode = "list" | "card" | "flashcard";

interface ViewToggleProps {
  current: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ current, onChange }: ViewToggleProps) {
  const handleValueChange = (value: string) => {
    onChange(value as ViewMode);
  };
  return (
    <Tabs value={current} onValueChange={handleValueChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="card">
          <Eye size={20} />
        </TabsTrigger>
        <TabsTrigger value="flashcard">
          <EyeClosed size={20} />
        </TabsTrigger>
        <TabsTrigger value="list">
          <List size={20} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
