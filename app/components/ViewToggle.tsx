import { Button } from "@/components/ui/button";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";

interface ViewToggleProps {
  hideArabic: boolean;
  onChange: (hideArabic: boolean) => void;
}

export function ViewToggle({ hideArabic, onChange }: ViewToggleProps) {
  return hideArabic ? (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onChange(!hideArabic)}
      className="gap-2"
    >
      <EyeClosedIcon weight="bold" />
    </Button>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onChange(!hideArabic)}
      className="gap-2"
    >
      <EyeIcon weight="bold" />
    </Button>
  );
}
