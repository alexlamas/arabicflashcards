"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  Brain,
  Sparkles,
  TrendingUp,
  Wifi,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  StarterPackService,
  StarterPackWord,
} from "../../services/starterPackService";

interface SearchResult extends StarterPackWord {
  packName: string;
}

export function NotionLandingPage() {
  const { setShowAuthDialog } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allWords, setAllWords] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWord, setSelectedWord] = useState<SearchResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Flashcard state
  const flashcards = [
    { arabic: "مرحبا", english: "Hello", transliteration: "marhaba" },
    { arabic: "شكراً", english: "Thank you", transliteration: "shukran" },
    { arabic: "كيفك؟", english: "How are you?", transliteration: "kifak?" },
    { arabic: "يلا", english: "Let's go!", transliteration: "yalla" },
    { arabic: "حبيبي", english: "My love", transliteration: "habibi" },
  ];
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        (word.transliteration?.toLowerCase().includes(query) ?? false)
    );
    setSearchResults(results.slice(0, 6));
  }, [searchQuery, allWords]);

  // Handle flashcard answer
  const handleAnswer = (difficulty: string) => {
    if (difficulty === "good" || difficulty === "easy") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 800);
    }
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 260 260"
                fill="none"
                className="text-brand-bg"
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
                Yalla
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAuthDialog(true)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium hidden sm:block"
              >
                Log in
              </button>
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="bg-brand-bg hover:bg-brand-bg/90 text-white rounded-full px-5"
              >
                Get started free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <section className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Content & Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-bg/10 text-brand-bg text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Smart spaced repetition
              </div>

              <h1 className="font-pphatton text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.1]">
                Learn Lebanese Arabic
                <span className="text-brand-bg"> the smart way</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Flashcards that adapt to how you learn. Search words, track
                progress, and actually remember what you study.
              </p>

              {/* Working Search */}
              <div className="relative mb-6">
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                    isSearching
                      ? "border-brand-bg bg-white shadow-lg"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Search
                    className={`w-5 h-5 ${isSearching ? "text-brand-bg" : "text-gray-400"}`}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearching(true)}
                    onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                    placeholder="Try searching 'hello' or 'marhaba'..."
                    className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none"
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
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
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
                        className="w-full px-4 py-3 bg-gray-50 text-brand-bg text-sm font-medium hover:bg-gray-100 transition-colors"
                      >
                        Sign up to save words →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["hello", "thank you", "food", "family"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      searchInputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <Button
                size="lg"
                onClick={() => setShowAuthDialog(true)}
                className="bg-brand-bg hover:bg-brand-bg/90 text-white rounded-full px-8 py-6 text-lg group"
              >
                Start learning free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Right - Interactive Flashcard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Success indicator */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium z-10"
                  >
                    Nice! 🎉
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card stack */}
              <div className="relative max-w-sm mx-auto">
                <div className="absolute inset-2 bg-gray-100 rounded-3xl transform rotate-2" />
                <div className="absolute inset-1 bg-gray-50 rounded-3xl transform -rotate-1" />

                {/* Main card */}
                <div
                  className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-400">
                      {currentCard + 1} / {flashcards.length}
                    </span>
                    <span className="text-xs bg-brand-fg/20 text-brand-bg px-2 py-1 rounded-full">
                      Tap to flip
                    </span>
                  </div>

                  {/* Card content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentCard}-${isFlipped}`}
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-8"
                    >
                      {!isFlipped ? (
                        <>
                          <p className="text-5xl mb-3">
                            {flashcards[currentCard].arabic}
                          </p>
                          <p className="text-gray-400 font-mono">
                            {flashcards[currentCard].transliteration}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-medium text-gray-900 mb-2">
                            {flashcards[currentCard].english}
                          </p>
                          <p className="text-brand-bg">
                            {flashcards[currentCard].arabic}
                          </p>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Spaced repetition buttons */}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-xs text-gray-400 text-center mb-3">
                      How well did you know this?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        {
                          label: "Again",
                          time: "1m",
                          color: "bg-red-50 text-red-600 hover:bg-red-100",
                        },
                        {
                          label: "Hard",
                          time: "6m",
                          color:
                            "bg-orange-50 text-orange-600 hover:bg-orange-100",
                        },
                        {
                          label: "Good",
                          time: "10m",
                          color:
                            "bg-green-50 text-green-600 hover:bg-green-100",
                        },
                        {
                          label: "Easy",
                          time: "4d",
                          color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
                        },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnswer(btn.label.toLowerCase());
                          }}
                          className={`${btn.color} py-2 rounded-xl transition-all active:scale-95`}
                        >
                          <span className="block text-xs font-medium">
                            {btn.label}
                          </span>
                          <span className="block text-[10px] opacity-60">
                            {btn.time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brain tip */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-start gap-2">
                    <Brain className="w-4 h-4 text-brand-bg mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">
                        Spaced repetition:
                      </span>{" "}
                      Hard words appear more often. Easy words space out to days.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to learn
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Simple tools designed to make learning Lebanese Arabic feel natural.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "Spaced Repetition",
                desc: "Reviews scheduled at the perfect moment",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                desc: "Watch your vocabulary grow daily",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Wifi,
                title: "Works Offline",
                desc: "Learn anywhere, sync when online",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Plus,
                title: "Add Your Own",
                desc: "Build personalized vocabulary",
                color: "bg-orange-100 text-orange-600",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand-bg to-brand-bg/80 rounded-3xl p-10 sm:p-14"
          >
            <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Join learners mastering Lebanese Arabic with smart flashcards. Free
              forever.
            </p>
            <Button
              size="lg"
              onClick={() => setShowAuthDialog(true)}
              className="bg-white text-brand-bg hover:bg-white/90 rounded-full px-10 py-6 text-lg font-semibold"
            >
              Get started free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Yalla. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Try another style:</span>
            <Link
              href="/?theme=botanical"
              className="text-gray-700 hover:text-brand-bg underline underline-offset-2"
            >
              Botanical
            </Link>
            <span>&middot;</span>
            <Link
              href="/?theme=bold"
              className="text-gray-700 hover:text-brand-bg underline underline-offset-2"
            >
              Bold
            </Link>
          </div>
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
                <p className="text-5xl mb-3">{selectedWord.arabic}</p>
                <p className="text-lg text-gray-400 font-mono mb-2">
                  {selectedWord.transliteration}
                </p>
                <p className="text-2xl text-gray-900 font-medium mb-4">
                  {selectedWord.english}
                </p>
                {selectedWord.notes && (
                  <p className="text-gray-500 text-sm mb-4 italic">
                    {selectedWord.notes}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-xs bg-brand-bg/10 text-brand-bg px-3 py-1 rounded-full">
                    {selectedWord.packName}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWord(null)}
                    className="flex-1 rounded-full"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedWord(null);
                      setShowAuthDialog(true);
                    }}
                    className="flex-1 bg-brand-bg hover:bg-brand-bg/90 text-white rounded-full"
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
