import { Button } from "@/components/ui/button";
import { Keyboard } from "@phosphor-icons/react";
import React, { useState } from "react";

// Define types for our data structures
interface LetterItem {
  letter: string;
  sound: string;
}

type KeyboardRow = LetterItem[];
type KeyboardLayout = KeyboardRow[];

// Type the keyboard layout data
const keyboardLayout: KeyboardLayout = [
  // Row 1 - all Lebanese pronunciations
  [
    { letter: "ض", sound: "d" },
    { letter: "ص", sound: "s" },
    { letter: "ث", sound: "s" }, // Lebanese pronunciation
    { letter: "ق", sound: "2" }, // Lebanese pronunciation
    { letter: "ف", sound: "f" },
    { letter: "غ", sound: "gh" },
    { letter: "ع", sound: "3" },
    { letter: "ه", sound: "h" },
    { letter: "خ", sound: "5" },
    { letter: "ح", sound: "7" },
    { letter: "ج", sound: "j" },
    { letter: "د", sound: "d" },
  ],
  // Row 2
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
  // Row 3
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
    { letter: "ظ", sound: "z" }, // Lebanese pronunciation
  ],
];

const ArabicKeyboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLetter, setHoveredLetter] = useState<LetterItem | null>(null);

  return (
    <div>
      <Button variant={"outline"} size="sm" onClick={() => setIsOpen(true)}>
        <Keyboard size={16} />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-full ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Arabic Keyboard</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-2" dir="ltr">
              {keyboardLayout.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-1">
                  {row.map((item) => (
                    <Button
                      key={item.letter}
                      onMouseEnter={() => setHoveredLetter(item)}
                      onMouseLeave={() => setHoveredLetter(null)}
                      className="w-20 h-20 text-3xl"
                    >
                      {hoveredLetter === item ? (
                        <span className="text-2xl font-mono">{item.sound}</span>
                      ) : (
                        <span>{item.letter}</span>
                      )}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArabicKeyboard;
