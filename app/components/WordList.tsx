import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tags } from "lucide-react";
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
import { Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProgressButtons from "./ProgressButtons";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface WordType {
  id: string;
  english: string;
  arabic: string;
  transliteration: string;
  category: string;
  type: string;
  tags?: Tag[];
}

type ProgressType = "learned" | "learning" | "new";

interface WordListProps {
  words: WordType[];
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
  availableTags: Tag[];
  onTagCreate: (name: string) => Promise<void>;
  onTagToggle: (wordId: string, tagId: string) => Promise<void>;
}

const getProgressBackground = (progress: ProgressType | undefined) => {
  switch (progress) {
    case "learned":
      return "bg-emerald-50";
    case "learning":
      return "bg-amber-50";
    default:
      return "";
  }
};

const TagManager = ({
  word,
  availableTags,
  onTagCreate,
  onTagToggle,
}: {
  word: WordType;
  availableTags: Tag[];
  onTagCreate: (name: string) => Promise<void>;
  onTagToggle: (wordId: string, tagId: string) => Promise<void>;
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleTagCreate = async () => {
    if (inputValue.trim()) {
      await onTagCreate(inputValue.trim());
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
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Tags className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command>
          <CommandInput
            placeholder="Search or create tags..."
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
                <span>Create &ldquo;{inputValue}&rdquo;</span>
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {availableTags.map((tag) => {
                const isSelected = word.tags?.some((t) => t.id === tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => onTagToggle(word.id, tag.id)}
                  >
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
};

const WordList = ({
  words,
  progress,
  onProgressChange,
  availableTags,
  onTagCreate,
  onTagToggle,
}: WordListProps) => {
  if (!words.length) {
    return (
      <div className="rounded-md border p-4 text-center text-muted-foreground">
        No words found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">English</TableHead>
            <TableHead>Arabic</TableHead>
            <TableHead>Transliteration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow
              key={word.english}
              className={getProgressBackground(progress[word.english])}
            >
              <TableCell className="font-medium">{word.english}</TableCell>
              <TableCell className="font-arabic text-lg">
                {word.arabic}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {word.transliteration}
              </TableCell>
              <TableCell>{word.type}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {word.tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs bg-slate-200/30 px-1.5"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <TagManager
                    word={word}
                    availableTags={availableTags}
                    onTagCreate={onTagCreate}
                    onTagToggle={onTagToggle}
                  />
                  <ProgressButtons
                    word={word}
                    progress={progress}
                    onProgressChange={onProgressChange}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WordList;
