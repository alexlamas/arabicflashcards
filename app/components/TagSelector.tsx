import React from "react";
import { Check, Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Trash } from "@phosphor-icons/react";

interface Tag {
  id: string;
  name: string;
}

interface TagSelectorProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onTagSelect: (tag: Tag) => void;
  onTagCreate: (tagName: string) => void;
  className?: string;
  onTagDelete: (tagId: string) => Promise<void>;
}

export default function TagSelector({
  selectedTags,
  availableTags,
  onTagSelect,
  onTagCreate,
  className,
  onTagDelete,
}: TagSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleTagCreate = () => {
    if (inputValue.trim()) {
      onTagCreate(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleTagCreate();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 border-dashed", className)}
        >
          <Tags className="mr-2 h-4 w-4" />
          {selectedTags?.length > 0 ? (
            <>
              <span>{selectedTags.length} selected</span>
            </>
          ) : (
            <span>Select tags...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={handleTagCreate}
              >
                <Plus className="mr-2 h-4 w-4" />
                {inputValue.trim() !== "" && (
                  <>
                    Create{" "}
                    <span className="bg-black/5 px-2 py-1 rounded-md">
                      {inputValue}
                    </span>
                  </>
                )}
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.some((t) => t.id === tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    className="flex justify-between items-center group"
                    onSelect={() => {
                      onTagSelect(tag);
                    }}
                  >
                    <div className="inline-flex gap-1">
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      {tag.name}
                    </div>
                    <div className="justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagDelete(tag.id);
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
