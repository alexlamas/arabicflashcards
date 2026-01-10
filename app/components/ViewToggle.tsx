import { Button } from "@/components/ui/button";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";

interface ViewToggleProps {
  hideArabic: boolean;
  onChange: (hideArabic: boolean) => void;
}

export function ViewToggle({ hideArabic, onChange }: ViewToggleProps) {
  return hideArabic ? (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onChange(!hideArabic)}
      className="gap-2 rounded-full"
    >
      <EyeClosedIcon weight="bold" />
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onChange(!hideArabic)}
      className="gap-2 rounded-full"
    >
      <EyeIcon weight="bold" />
    </Button>
  );
}
