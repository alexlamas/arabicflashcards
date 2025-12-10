"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  StarterPackService,
  StarterPackWord,
} from "../../services/starterPackService";

interface SearchResult extends StarterPackWord {
  packName: string;
}

export function BotanicalLandingPage() {
  const { setShowAuthDialog } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allWords, setAllWords] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWord, setSelectedWord] = useState<SearchResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load all words from starter packs on mount
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
        (word.transliteration?.toLowerCase().includes(query) ?? false)
    );

    setSearchResults(results.slice(0, 8));
  }, [searchQuery, allWords]);

  return (
    <div className="min-h-screen bg-[#f8f7f4] overflow-hidden relative">
      {/* Decorative botanical elements - positioned absolutely */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Left side botanical - large palm/plant */}
        <div className="absolute -left-20 bottom-0 w-[500px] h-[90vh] opacity-[0.15]">
          <svg viewBox="0 0 400 700" className="w-full h-full" fill="none">
            {/* Elegant palm fronds */}
            <g stroke="#2d5a3d" strokeWidth="1.5" fill="none">
              {[...Array(12)].map((_, i) => {
                const angle = (i - 6) * 15;
                const length = 250 + Math.random() * 100;
                const curve = 50 + Math.random() * 30;
                return (
                  <path
                    key={i}
                    d={`M200,400 Q${200 + Math.sin((angle * Math.PI) / 180) * curve},${400 - length / 2} ${200 + Math.sin((angle * Math.PI) / 180) * length},${400 - length}`}
                    strokeWidth={2 - Math.abs(i - 6) * 0.1}
                  />
                );
              })}
            </g>
            {/* Trunk */}
            <path
              d="M195,400 Q190,500 185,650 Q200,680 215,650 Q210,500 205,400"
              fill="#8b7355"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Right side botanical - delicate branch */}
        <div className="absolute -right-10 top-20 w-[350px] h-[500px] opacity-[0.12]">
          <svg viewBox="0 0 300 450" className="w-full h-full" fill="none">
            <g stroke="#2d5a3d" strokeWidth="1">
              {/* Main branch */}
              <path d="M300,200 Q200,180 120,220 Q80,250 60,300" strokeWidth="3" />
              {/* Leaves */}
              {[
                { x: 250, y: 190, r: -20 },
                { x: 200, y: 175, r: -35 },
                { x: 160, y: 185, r: -50 },
                { x: 130, y: 210, r: -30 },
                { x: 100, y: 240, r: -15 },
                { x: 80, y: 275, r: 10 },
                { x: 180, y: 210, r: 45 },
                { x: 140, y: 240, r: 55 },
                { x: 110, y: 280, r: 40 },
              ].map((leaf, i) => (
                <ellipse
                  key={i}
                  cx={leaf.x}
                  cy={leaf.y}
                  rx="40"
                  ry="15"
                  fill="#3a6b4a"
                  opacity="0.4"
                  transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
                />
              ))}
              {/* Fruits */}
              <ellipse cx="75" cy="320" rx="18" ry="25" fill="#7a9b6a" opacity="0.5" />
              <ellipse cx="95" cy="290" rx="15" ry="20" fill="#8aab7a" opacity="0.5" />
            </g>
          </svg>
        </div>

        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-8 max-w-7xl mx-auto"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2d5a3d] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg font-serif">ي</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#2d5a3d] font-medium text-lg tracking-wide">
              yalla arabic
            </span>
            <span className="text-[#2d5a3d]/50 text-xs tracking-widest uppercase">
              Lebanese dialect
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <button
            onClick={() => setShowAuthDialog(true)}
            className="text-[#2d5a3d]/70 hover:text-[#2d5a3d] text-sm font-medium transition-colors"
          >
            sign in
          </button>
          <Button
            onClick={() => setShowAuthDialog(true)}
            className="bg-[#2d5a3d] hover:bg-[#234a31] text-white rounded-full px-6"
          >
            start learning
          </Button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl w-full text-center"
        >
          {/* Headline */}
          <h1 className="font-pphatton text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a1a] mb-6 leading-[1.1] tracking-tight">
            A dictionary for students
            <br />
            of{" "}
            <span className="text-[#2d5a3d] italic">Lebanese Arabic</span>
          </h1>

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-12 mb-8"
          >
            <div
              className={`relative flex items-center gap-4 border-b-2 pb-4 transition-all duration-300 ${
                isSearching
                  ? "border-[#2d5a3d]"
                  : "border-[#2d5a3d]/30 hover:border-[#2d5a3d]/50"
              }`}
            >
              <Search
                className={`w-6 h-6 transition-colors ${
                  isSearching ? "text-[#2d5a3d]" : "text-[#2d5a3d]/40"
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                placeholder="Yalla, look for a word..."
                className="flex-1 bg-transparent text-xl text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 outline-none font-light"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[#2d5a3d]/50 hover:text-[#2d5a3d] text-sm"
                >
                  clear
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#2d5a3d]/10 overflow-hidden z-50"
                >
                  {searchResults.map((word, index) => (
                    <motion.button
                      key={word.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedWord(word);
                        setIsSearching(false);
                      }}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8f7f4] transition-colors text-left border-b border-[#2d5a3d]/5 last:border-b-0"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl text-[#1a1a1a]">
                          {word.arabic}
                        </span>
                        <span className="text-[#2d5a3d]/60 text-sm font-mono">
                          {word.transliteration}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#1a1a1a]/70">{word.english}</span>
                        <span className="text-xs text-[#2d5a3d]/40 bg-[#2d5a3d]/5 px-2 py-1 rounded-full">
                          {word.packName}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                  <div className="px-6 py-3 bg-[#2d5a3d]/5 text-center">
                    <button
                      onClick={() => setShowAuthDialog(true)}
                      className="text-[#2d5a3d] text-sm font-medium hover:underline"
                    >
                      Sign up to save words and track progress →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* No results message */}
            <AnimatePresence>
              {searchQuery.length >= 2 &&
                searchResults.length === 0 &&
                isSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#2d5a3d]/10 p-8 text-center"
                  >
                    <p className="text-[#1a1a1a]/60 mb-2">
                      No words found for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <button
                      onClick={() => setShowAuthDialog(true)}
                      className="text-[#2d5a3d] text-sm font-medium hover:underline"
                    >
                      Sign up to add your own words →
                    </button>
                  </motion.div>
                )}
            </AnimatePresence>
          </motion.div>

          {/* Quick stats */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-[#1a1a1a]/40 text-sm"
          >
            {allWords.length > 0
              ? `${allWords.length} words available to explore`
              : "Loading words..."}
          </motion.p>
        </motion.div>

        {/* Selected Word Card */}
        <AnimatePresence>
          {selectedWord && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
              onClick={() => setSelectedWord(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full shadow-2xl"
              >
                <div className="text-center">
                  <p className="text-6xl sm:text-7xl mb-4 text-[#1a1a1a]">
                    {selectedWord.arabic}
                  </p>
                  <p className="text-xl text-[#2d5a3d]/60 mb-2 font-mono">
                    {selectedWord.transliteration}
                  </p>
                  <p className="text-2xl text-[#1a1a1a]/80 font-medium mb-6">
                    {selectedWord.english}
                  </p>

                  {selectedWord.notes && (
                    <p className="text-[#1a1a1a]/50 text-sm mb-6 italic">
                      {selectedWord.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-3 mb-8">
                    <span className="text-xs text-[#2d5a3d]/60 bg-[#2d5a3d]/10 px-3 py-1 rounded-full">
                      {selectedWord.packName}
                    </span>
                    {selectedWord.type && (
                      <span className="text-xs text-[#1a1a1a]/40 bg-[#1a1a1a]/5 px-3 py-1 rounded-full">
                        {selectedWord.type}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setSelectedWord(null)}
                      variant="outline"
                      className="flex-1 rounded-full border-[#2d5a3d]/20"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedWord(null);
                        setShowAuthDialog(true);
                      }}
                      className="flex-1 bg-[#2d5a3d] hover:bg-[#234a31] text-white rounded-full"
                    >
                      Save to my words
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browse by category hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-3"
        >
          {["Greetings", "Food", "Family", "Numbers", "Everyday"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSearchQuery(cat.toLowerCase());
                searchInputRef.current?.focus();
              }}
              className="px-4 py-2 rounded-full border border-[#2d5a3d]/20 text-[#2d5a3d]/60 text-sm hover:border-[#2d5a3d]/40 hover:text-[#2d5a3d] transition-all"
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#2d5a3d]/10 mt-auto">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#2d5a3d]/50">
            &copy; {new Date().getFullYear()} Yalla Arabic
          </p>
          <div className="flex items-center gap-2 text-sm text-[#2d5a3d]/50">
            <span>Try another style:</span>
            <Link
              href="/?theme=notion"
              className="text-[#2d5a3d] hover:underline underline-offset-2"
            >
              Modern
            </Link>
            <span>&middot;</span>
            <Link
              href="/?theme=bold"
              className="text-[#2d5a3d] hover:underline underline-offset-2"
            >
              Bold
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
