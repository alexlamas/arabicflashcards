// app/components/SortDropdown.tsx
import { useState, useRef } from "react";
import { CaretDown } from "@phosphor-icons/react";

type SortOption = {
  label: string;
  value: "alphabetical" | "progress" | "type";
};

const sortOptions: SortOption[] = [
  { label: "Alphabetical", value: "alphabetical" },
  { label: "By Progress", value: "progress" },
  { label: "By Word Type", value: "type" },
];

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption["value"];
  onChange: (value: SortOption["value"]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = sortOptions.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors"
      >
        <span>Sort {currentOption?.label}</span>
        <CaretDown
          size={16}
          weight="bold"
          className={`text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg py-1 z-10">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                ${value === option.value ? "bg-blue-50 text-blue-600" : ""}
              `}
            >
              Sort {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
