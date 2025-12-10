"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, Brain, TrendingUp, Wifi, Plus } from "lucide-react";
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

  // Flashcard demo state
  const flashcards = [
    { arabic: "مرحبا", english: "Hello", transliteration: "marhaba" },
    { arabic: "شكراً", english: "Thank you", transliteration: "shukran" },
    { arabic: "كيفك؟", english: "How are you?", transliteration: "kifak?" },
    { arabic: "يلا", english: "Let's go!", transliteration: "yalla" },
  ];
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-white">
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-white pt-16">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating elements */}
        <motion.div
          className="absolute top-1/4 left-[10%] w-20 h-20 bg-brand-fg/20 rounded-2xl hidden sm:block"
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
          className="absolute top-1/3 right-[15%] w-16 h-16 bg-brand-bg/10 rounded-full hidden sm:block"
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
          className="absolute bottom-1/3 left-[20%] w-12 h-12 bg-brand-secondary/20 rounded-xl hidden sm:block"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-fg/10 text-brand-bg text-sm font-medium mb-8"
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
                Learn Lebanese
                <br />
                <span className="text-brand-bg">the fun way</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Master Lebanese Arabic with smart flashcards that adapt to your
                learning pace.
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
                      ? "border-brand-bg shadow-lg shadow-brand-bg/10"
                      : "border-gray-200 hover:border-gray-300"
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
                        className="w-full px-4 py-3 bg-amber-50/50 text-brand-bg text-sm font-medium hover:bg-amber-50 transition-colors"
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
                {["hello", "thank you", "food", "family"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      searchInputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm hover:border-brand-bg hover:text-brand-bg transition-colors"
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
                  className="bg-brand-bg hover:bg-brand-bg/90 text-white rounded-full px-8 py-6 text-lg font-medium group shadow-lg shadow-brand-bg/20 hover:shadow-xl hover:shadow-brand-bg/30 transition-all"
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
              <div className="relative max-w-sm mx-auto perspective-1000">
                {/* Card stack effect */}
                <div className="absolute inset-0 bg-brand-bg/5 rounded-3xl transform rotate-3 translate-x-2 translate-y-2" />
                <div className="absolute inset-0 bg-brand-fg/10 rounded-3xl transform -rotate-2 -translate-x-1" />

                {/* Main flashcard */}
                <div
                  className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Card header */}
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-bg" />
                      <span className="text-xs text-gray-400 font-medium">FLASHCARD</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {currentCard + 1} / {flashcards.length}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="px-6 py-12 min-h-[200px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currentCard}-${isFlipped}`}
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-center"
                      >
                        {!isFlipped ? (
                          <>
                            <p className="text-6xl mb-4">{flashcards[currentCard].arabic}</p>
                            <p className="text-gray-400 font-mono text-lg">
                              {flashcards[currentCard].transliteration}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-3xl font-medium text-gray-900 mb-2">
                              {flashcards[currentCard].english}
                            </p>
                            <p className="text-2xl text-brand-bg">
                              {flashcards[currentCard].arabic}
                            </p>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Tap hint */}
                  <div className="px-6 pb-4 text-center">
                    <span className="text-xs text-gray-300">tap to flip</span>
                  </div>

                  {/* Action buttons */}
                  <div className="px-6 pb-6">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); nextCard(); }}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Skip
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextCard(); }}
                        className="flex-1 py-3 rounded-xl bg-brand-bg text-white text-sm font-medium hover:bg-brand-bg/90 transition-colors"
                      >
                        Got it!
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative hint */}
              <motion.div
                className="absolute -bottom-4 -right-4 bg-brand-fg/20 px-4 py-2 rounded-full text-sm text-brand-bg font-medium"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Try it! →
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
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
                className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg hover:bg-white transition-all border border-transparent hover:border-gray-100"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-bg rounded-3xl p-12 sm:p-16 shadow-2xl shadow-brand-bg/20"
          >
            <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Join learners mastering Lebanese Arabic with smart flashcards. Free forever.
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
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8 bg-white">
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
