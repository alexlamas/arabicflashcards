import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Keyboard } from "@phosphor-icons/react";
import { TooltipProvider } from "@radix-ui/react-tooltip";

interface LetterItem {
  letter: string;
  sound: string;
}

type KeyboardRow = LetterItem[];
type KeyboardLayout = KeyboardRow[];

const keyboardLayout: KeyboardLayout = [
  [
    { letter: "ض", sound: "d" },
    { letter: "ص", sound: "s" },
    { letter: "ث", sound: "s" },
    { letter: "ق", sound: "2" },
    { letter: "ف", sound: "f" },
    { letter: "غ", sound: "gh" },
    { letter: "ع", sound: "3" },
    { letter: "ه", sound: "h" },
    { letter: "خ", sound: "5" },
    { letter: "ح", sound: "7" },
    { letter: "ج", sound: "j" },
    { letter: "د", sound: "d" },
  ],
  [
    { letter: "ش", sound: "sh" },
    { letter: "س", sound: "s" },
    { letter: "ي", sound: "y/i" },
    { letter: "ب", sound: "b" },
    { letter: "ل", sound: "l" },
    { letter: "ا", sound: "a/e" },
    { letter: "ت", sound: "t" },
    { letter: "ن", sound: "n" },
    { letter: "م", sound: "m" },
    { letter: "ك", sound: "k" },
    { letter: "ط", sound: "t" },
  ],
  [
    { letter: "ئ", sound: "2" },
    { letter: "ء", sound: "2" },
    { letter: "ؤ", sound: "2" },
    { letter: "ر", sound: "r" },
    { letter: "لا", sound: "la" },
    { letter: "ى", sound: "a" },
    { letter: "ة", sound: "a/e" },
    { letter: "و", sound: "w/u" },
    { letter: "ز", sound: "z" },
    { letter: "ظ", sound: "z" },
  ],
];

export default function ArabicKeyboard() {
  const [hoveredLetter, setHoveredLetter] = useState<LetterItem | null>(null);

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Keyboard size={16} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Open Arabic keyboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-100 bg-transparent border-none shadow-none">
        <DialogHeader>
          <DialogTitle className="hidden">Arabic Keyboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-2" dir="ltr">
          {keyboardLayout.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1">
              {row.map((item) => (
                <Button
                  key={item.letter}
                  onMouseEnter={() => setHoveredLetter(item)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  className="w-16 h-16 text-2xl bg-white text-black hover:bg-slate-200"
                >
                  {hoveredLetter === item ? (
                    <span className="text-lg font-mono">{item.sound}</span>
                  ) : (
                    <span>{item.letter}</span>
                  )}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
