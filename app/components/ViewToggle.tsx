import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Eye, EyeClosed, List } from "@phosphor-icons/react";
import { ViewMode } from "../types/word";

interface ViewToggleProps {
  current: ViewMode;
  onChange: (view: ViewMode) => void;
  isAdmin?: boolean;
}

export function ViewToggle({
  current,
  onChange,
  isAdmin = false,
}: ViewToggleProps) {
  const baseViews = [
    { value: "card" as const, icon: Eye, label: "Cards" },
    { value: "flashcard" as const, icon: EyeClosed, label: "Flashcards" },
  ];

  const adminView = { value: "list" as const, icon: List, label: "List" };
  const views = isAdmin ? [...baseViews, adminView] : baseViews;

  const handleValueChange = (value: string) => {
    onChange(value as ViewMode);
  };

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs value={current} onValueChange={handleValueChange}>
          <TabsList className="flex w-full ">
            {views.map(({ value, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon size={20} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2">
              {(() => {
                const currentView = views.find((v) => v.value === current);
                const Icon = currentView?.icon || Eye;
                return (
                  <>
                    <Icon size={20} />
                  </>
                );
              })()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {views.map(({ value, icon: Icon, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onChange(value)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Icon size={20} />
                  <span>{label}</span>
                </div>
                {current === value && <Check size={18} className="ml-2" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
