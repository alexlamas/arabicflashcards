// app/components/SearchBar.tsx
import { Input } from "@/components/ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative md:max-w-48 mr-2">
      <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 rounded-full"
      />
    </div>
  );
}
