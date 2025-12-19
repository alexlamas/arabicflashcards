"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { Ghost, SmileyNervous, Balloon, Star } from "@phosphor-icons/react";
import Link from "next/link";
import {
  StarterPackService,
  StarterPackWord,
} from "../../services/starterPackService";

interface SearchResult extends StarterPackWord {
  packName: string;
}

// Helper to generate light version of a color
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateTheme(primary: string) {
  const [h, s] = hexToHsl(primary);
  return {
    primary,
    primaryLight: hslToHex(h, Math.min(s, 30), 94),
    accent: hslToHex(h, s * 0.8, 55),
  };
}

export function NotionLandingPage() {
  const { setShowAuthDialog } = useAuth();

  // Theme state
  const [primaryColor, setPrimaryColor] = useState("#47907d");
  const theme = generateTheme(primaryColor);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allWords, setAllWords] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWord, setSelectedWord] = useState<SearchResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Flashcard demo state
  const flashcards = [
    { arabic: "معصب", english: "Angry", transliteration: "m3assab" },
    { arabic: "مزعج", english: "Annoying", transliteration: "miz3ij" },
    { arabic: "غدّار", english: "Backstabber", transliteration: "ghaddar" },
    { arabic: "اتأخّر", english: "To be late", transliteration: "ita2akhar" },
  ];
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [feedbackAnimation, setFeedbackAnimation] = useState<{
    isPlaying: boolean;
    text: string;
    color: string;
    nextReview: string;
    icon: "ghost" | "nervous" | "balloon" | "star" | null;
  }>({ isPlaying: false, text: "", color: "", nextReview: "", icon: null });

  // Grid card animation - randomly shuffle which word each card shows
  const [gridWordIndices, setGridWordIndices] = useState<number[]>(
    Array.from({ length: 16 }, (_, i) => i)
  );

  useEffect(() => {
    if (allWords.length === 0) return;
    const interval = setInterval(() => {
      setGridWordIndices(prev => {
        const newIndices = [...prev];
        const randomCard = Math.floor(Math.random() * 16);
        newIndices[randomCard] = Math.floor(Math.random() * allWords.length);
        return newIndices;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [allWords.length]);

  // Load words from starter packs
  useEffect(() => {
    async function loadWords() {
      try {
        const packs = await StarterPackService.getAvailablePacks();
        const wordsWithPacks: SearchResult[] = [];
        for (const pack of packs) {
          const { words } = await StarterPackService.getPackContents(pack.id);
          words.forEach((word) => {
            wordsWithPacks.push({ ...word, packName: pack.name });
          });
        }
        setAllWords(wordsWithPacks);
      } catch (error) {
        console.error("Error loading words:", error);
      }
    }
    loadWords();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = allWords.filter(
      (word) =>
        word.arabic.includes(searchQuery) ||
        word.english.toLowerCase().includes(query) ||
        word.packName.toLowerCase().includes(query) ||
        (word.transliteration?.toLowerCase().includes(query) ?? false)
    );
    setSearchResults(results.slice(0, 10));
  }, [searchQuery, allWords]);

  // Focus search input on page load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleRating = (rating: number) => {
    const feedbackText = rating === 0 ? "Forgot" : rating === 1 ? "Struggled" : rating === 2 ? "Remembered" : "Perfect!";
    const feedbackColor = rating === 0 ? "bg-red-500" : rating === 1 ? "bg-orange-500" : rating === 2 ? "bg-green-500" : "bg-emerald-500";
    const nextReview = rating === 0 ? "Later today" : rating === 1 ? "Tomorrow" : rating === 2 ? "In 3 days" : "In a week";
    const feedbackIcon = rating === 0 ? "ghost" : rating === 1 ? "nervous" : rating === 2 ? "balloon" : "star";

    setFeedbackAnimation({ isPlaying: true, text: feedbackText, color: feedbackColor, nextReview, icon: feedbackIcon as "ghost" | "nervous" | "balloon" | "star" });

    setTimeout(() => {
      setFeedbackAnimation({ isPlaying: false, text: "", color: "", nextReview: "", icon: null });
    }, 1800);

    setTimeout(() => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentCard((prev) => (prev + 1) % flashcards.length);
      }, 150);
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .search-input::selection {
          background-color: ${theme.primary};
          color: white;
        }
      `}</style>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 260 260"
                fill="none"
                style={{ color: theme.primary }}
              >
                <path
                  d="M221.792 73.3274C215.418 108.418 203.652 99.3945 196.298 136.991C190.655 165.843 198.259 201.658 186.493 219.203C174.726 236.748 222.367 175.355 229.636 144.009C235.783 117.5 231.107 104.407 221.792 73.3274Z"
                  fill="currentColor"
                />
                <path
                  d="M63.1188 136.991C55.7648 99.3945 43.9985 108.418 37.6251 73.3274C28.3101 104.407 23.6334 117.5 29.7809 144.009C37.0498 175.355 84.6903 236.748 72.924 219.203C61.1577 201.658 68.7621 165.843 63.1188 136.991Z"
                  fill="currentColor"
                />
                <path
                  d="M126.711 220V114.19C126.711 113.086 127.606 112.19 128.711 112.19C129.815 112.19 130.853 113.085 130.853 114.19L130.711 220C130.711 221.104 129.815 222 128.711 222C127.606 222 126.711 221.104 126.711 220Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M148.782 52.2994C151.201 49.6222 154.514 46.2756 157.915 43.5144C160.124 41.7211 162.456 40.1044 164.664 39.0985C166.783 38.1331 169.274 37.5098 171.466 38.5058L172.609 39.0254L172.637 40.28C173.136 63.7272 172.4 78.0833 169.827 87.99C167.2 98.1034 162.664 103.551 155.957 109.225C149.862 114.381 140.071 115.54 130.853 109.393V114.19C130.853 115.293 129.959 116.186 128.857 116.186C128.832 116.186 128.808 116.183 128.783 116.182C128.759 116.183 128.735 116.186 128.71 116.186C127.608 116.186 126.714 115.292 126.714 114.19V109.393C117.496 115.539 107.705 114.381 101.61 109.225C94.9031 103.551 90.3669 98.1032 87.7398 87.99C85.1663 78.0833 84.4311 63.7271 84.93 40.28L84.9573 39.0254L86.1009 38.5058C88.2932 37.5096 90.7841 38.1331 92.903 39.0985C95.1104 40.1043 97.4423 41.7212 99.6515 43.5144C103.053 46.2755 106.366 49.6222 108.785 52.2994C112.17 46.7574 121.223 38.3268 128.711 38.3268C136.198 38.3268 145.766 47.3617 148.782 52.2994Z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-pphatton font-bold text-xl text-gray-900">
                Yalla Flash
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAuthDialog(true)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium hidden sm:block"
              >
                Log in
              </button>
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="text-white rounded-full px-5 text-sm font-medium"
                style={{ backgroundColor: theme.primary }}
              >
                Get started free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white pt-16">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating elements */}
        <motion.div
          className="absolute top-1/4 left-[10%] w-20 h-20 rounded-2xl hidden sm:block"
          style={{ backgroundColor: `${theme.primary}15` }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-[15%] w-16 h-16 rounded-full hidden sm:block"
          style={{ backgroundColor: `${theme.primary}20` }}
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-[20%] w-12 h-12 rounded-xl hidden sm:block"
          style={{ backgroundColor: `${theme.primary}10` }}
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
                style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Smart spaced repetition</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-pphatton text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight"
              >
                Learn
                <br />
                <span style={{ color: theme.primary }}>Lebanese</span>
                <br />
                Arabic
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Smart Lebanese flashcards to help you finally understand what Teta is saying about you.
              </motion.p>

              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative mb-6 max-w-md mx-auto lg:mx-0"
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all bg-white ${
                    isSearching
                      ? "shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={isSearching ? { borderColor: theme.primary, boxShadow: `0 10px 15px -3px ${theme.primary}20` } : {}}
                >
                  <Search
                    className="w-5 h-5 transition-colors"
                    style={{ color: isSearching ? theme.primary : "#9ca3af" }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearching(true)}
                    onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                    placeholder="Try searching 'hello' or 'marhaba'..."
                    className="search-input flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none"
                    style={{ caretColor: theme.primary }}
                  />
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {searchResults.length > 0 && isSearching && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {searchResults.map((word) => (
                        <button
                          key={word.id}
                          onClick={() => {
                            setSelectedWord(word);
                            setIsSearching(false);
                          }}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50/50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{word.arabic}</span>
                            <span className="text-gray-400 text-sm font-mono">
                              {word.transliteration}
                            </span>
                          </div>
                          <span className="text-gray-600 text-sm">
                            {word.english}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => setShowAuthDialog(true)}
                        className="w-full px-4 py-3 text-sm font-medium transition-colors"
                        style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
                      >
                        Sign up to save words →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Quick search tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8"
              >
                {["greetings", "food", "family", "numbers"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      searchInputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm transition-colors hover:border-current"
                    style={{ "--hover-color": theme.primary } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.primary;
                      e.currentTarget.style.color = theme.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.color = "";
                    }}
                  >
                    {term}
                  </button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={() => setShowAuthDialog(true)}
                  className="text-white rounded-full px-8 py-6 text-base font-medium group transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.primary, boxShadow: `0 10px 15px -3px ${theme.primary}40` }}
                >
                  Start learning for free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right - Flashcard Demo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative max-w-md mx-auto">
                {/* Card stack effect - white cards peeking from top-left */}
                <div className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-gray-200 transform -translate-y-3 -translate-x-2 rotate-[-3deg] opacity-50" />
                <div className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-gray-200 transform -translate-y-1.5 -translate-x-1 rotate-[-1.5deg] opacity-75" />

                {/* Main flashcard */}
                <div
                  className="relative bg-white rounded-2xl shadow-md border border-gray-200 cursor-pointer overflow-hidden"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Card content */}
                  <div className="min-h-[200px] flex flex-col items-center justify-center p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currentCard}-${isFlipped}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="text-center"
                      >
                        {!isFlipped ? (
                          <p className="text-4xl font-semibold text-gray-900 pt-2">
                            {flashcards[currentCard].english}
                          </p>
                        ) : (
                          <>
                            <p className="text-4xl font-arabic mb-2">
                              {flashcards[currentCard].arabic}
                            </p>
                            <p className="text-sm text-gray-600">
                              {flashcards[currentCard].transliteration}
                            </p>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Card chin - fixed height area for hint or buttons */}
                  <div className="border-t border-gray-150 p-4 bg-gray-50/40 h-16 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {!isFlipped ? (
                        <motion.p
                          key="hint"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-xs text-gray-400"
                        >
                          click to reveal
                        </motion.p>
                      ) : (
                        <motion.div
                          key="buttons"
                          className="grid grid-cols-4 gap-2 w-full"
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: { staggerChildren: 0.1 },
                            },
                          }}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0 }}
                        >
                          <motion.button
                            variants={{
                              hidden: { y: 10, opacity: 0 },
                              show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
                            }}
                            onClick={(e) => { e.stopPropagation(); handleRating(0); }}
                            className="py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Forgot
                          </motion.button>
                          <motion.button
                            variants={{
                              hidden: { y: 10, opacity: 0 },
                              show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
                            }}
                            onClick={(e) => { e.stopPropagation(); handleRating(1); }}
                            className="py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100 transition-colors"
                          >
                            Struggled
                          </motion.button>
                          <motion.button
                            variants={{
                              hidden: { y: 10, opacity: 0 },
                              show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
                            }}
                            onClick={(e) => { e.stopPropagation(); handleRating(2); }}
                            className="py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                          >
                            Remembered
                          </motion.button>
                          <motion.button
                            variants={{
                              hidden: { y: 10, opacity: 0 },
                              show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
                            }}
                            onClick={(e) => { e.stopPropagation(); handleRating(3); }}
                            className="py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold hover:opacity-90 transition-colors shadow-sm"
                          >
                            Perfect
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Feedback animation overlay - covers entire card */}
                  {feedbackAnimation.isPlaying && (
                    <>
                      <motion.div
                        className={`absolute inset-0 ${feedbackAnimation.color} z-20 rounded-2xl`}
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      />
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.2 }}
                      >
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                          className="mb-2"
                        >
                          {feedbackAnimation.icon === "ghost" && <Ghost className="w-12 h-12 text-white" weight="fill" />}
                          {feedbackAnimation.icon === "nervous" && <SmileyNervous className="w-12 h-12 text-white" weight="fill" />}
                          {feedbackAnimation.icon === "balloon" && <Balloon className="w-12 h-12 text-white" weight="fill" />}
                          {feedbackAnimation.icon === "star" && <Star className="w-12 h-12 text-white" weight="fill" />}
                        </motion.div>
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.35, duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                          className="text-white text-2xl font-bold"
                        >
                          {feedbackAnimation.text}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.2 }}
                          className="text-white/80 text-sm mt-1"
                        >
                          {feedbackAnimation.nextReview}
                        </motion.span>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Word Library Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center pb-8">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Hundreds of words.
                <br />
                <span style={{ color: theme.primary }}>Add your own.</span>
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Start with curated packs for greetings, food, family, and more.
                Then add the words you actually hear — from your teta, the news, or that show everyone's watching.
              </p>
              <div className="flex gap-4 text-sm text-gray-500 pb-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                  <span>{allWords.length}+ words ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>Add unlimited</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Animated Card Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px] perspective-1000 mt-4"
            >
              <div
                className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-3 transform rotate-x-12 rotate-y-[-8deg]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {Array.from({ length: 16 }).map((_, i) => {
                  const wordIndex = gridWordIndices[i] % (allWords.length || 1);
                  const word = allWords[wordIndex];
                  const depth = (i % 4) * 10;
                  const row = Math.floor(i / 4);
                  const opacity = 1 - (row * 0.2);
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col items-center justify-center text-center"
                      style={{ transform: `translateZ(${depth}px)`, opacity }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={wordIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center"
                        >
                          {word ? (
                            <>
                              <span className="text-lg font-arabic">{word.arabic}</span>
                              <span className="text-[10px] text-gray-400 truncate w-full">{word.english}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg font-arabic">كلمة</span>
                              <span className="text-[10px] text-gray-400">word</span>
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
              {/* Fade overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-12 sm:p-16 shadow-2xl"
            style={{ backgroundColor: theme.primary, boxShadow: `0 25px 50px -12px ${theme.primary}40` }}
          >
            <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8 max-w-md mx-auto">
              Join learners mastering Lebanese Arabic with smart flashcards. Free forever.
            </p>
            <Button
              size="lg"
              onClick={() => setShowAuthDialog(true)}
              className="bg-white hover:bg-white/90 rounded-full px-10 py-6 text-base font-medium"
              style={{ color: theme.primary }}
            >
              Get started free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto flex justify-center items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Yalla Flash. All rights reserved.</p>
        </div>
      </footer>

      {/* Word Detail Modal */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            onClick={() => setSelectedWord(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <p className="text-4xl font-arabic mb-3">{selectedWord.arabic}</p>
                <p className="text-sm text-gray-400 mb-2">
                  {selectedWord.transliteration}
                </p>
                <p className="text-xl text-gray-900 font-medium mb-4">
                  {selectedWord.english}
                </p>
                {selectedWord.notes && (
                  <p className="text-gray-500 text-sm mb-4 italic">
                    {selectedWord.notes}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
                  >
                    {selectedWord.packName}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWord(null)}
                    className="flex-1 rounded-full text-sm font-medium"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedWord(null);
                      setShowAuthDialog(true);
                    }}
                    className="flex-1 text-white rounded-full text-sm font-medium hover:opacity-90"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Save to my words
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
