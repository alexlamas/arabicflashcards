// app/components/CategoryFilter.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onChange: (category: string | null) => void;
  counts: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
  counts,
}: CategoryFilterProps) {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Categories</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea>
          <div className="space-y-1 p-4 pt-0">
            <CategoryButton
              isSelected={!selected}
              onClick={() => onChange(null)}
              count={totalCount}
            >
              All Categories
            </CategoryButton>

            {categories.map((category) => (
              <CategoryButton
                key={category}
                isSelected={selected === category}
                onClick={() => onChange(category)}
                count={counts[category] || 0}
              >
                {category}
              </CategoryButton>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface CategoryButtonProps {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  count: number;
}

function CategoryButton({
  children,
  isSelected,
  onClick,
  count,
}: CategoryButtonProps) {
  return (
    <Button
      variant={isSelected ? "default" : "ghost"}
      className={cn(
        "w-full justify-between h-auto px-4 py-2",
        isSelected ? "bg-primary hover:bg-primary/90" : "hover:bg-accent"
      )}
      onClick={onClick}
    >
      <span className="truncate">{children}</span>
      <span
        className={cn(
          "ml-2 text-xs",
          isSelected ? "text-primary-foreground" : "text-muted-foreground"
        )}
      >
        {count}
      </span>
    </Button>
  );
}
