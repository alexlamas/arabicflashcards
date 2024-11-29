import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type SortOption = {
  label: string;
  value: "alphabetical" | "progress" | "type";
};

const sortOptions: SortOption[] = [
  { label: "alphabetical", value: "alphabetical" },
  { label: "by progress", value: "progress" },
  { label: "by word type", value: "type" },
];

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption["value"];
  onChange: (value: SortOption["value"]) => void;
}) {
  const currentOption = sortOptions.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8">
          Sort {currentOption?.label}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? "bg-accent" : ""}
          >
            Sort {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
