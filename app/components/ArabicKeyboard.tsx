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
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-3 bg-gray-100 text-white rounded-lg hover:bg-gray-200 transition"
      >
        <Keyboard size={16} className="text-gray-600" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Arabic Keyboard</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2" dir="ltr">
              {keyboardLayout.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-1">
                  {row.map((item) => (
                    <button
                      key={item.letter}
                      className="w-12 h-12 text-2xl font-arabic border rounded-lg bg-white 
                          hover:bg-blue-50 transition-all focus:outline-none"
                      onMouseEnter={() => setHoveredLetter(item)}
                      onMouseLeave={() => setHoveredLetter(null)}
                    >
                      {hoveredLetter === item ? (
                        <span className="text-lg font-mono text-blue-600">
                          {item.sound}
                        </span>
                      ) : (
                        <span>{item.letter}</span>
                      )}
                    </button>
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
