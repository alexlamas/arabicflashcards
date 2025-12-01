"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Zap, BookOpen } from "lucide-react";
import Link from "next/link";
import {
  StarterPackService,
  StarterPack,
} from "../../services/starterPackService";
import { PackPreviewModal } from "../PackPreviewModal";

export function BoldLandingPage() {
  const { setShowAuthDialog } = useAuth();
  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function loadPacks() {
      try {
        const availablePacks = await StarterPackService.getAvailablePacks();
        setPacks(availablePacks.slice(0, 3));
      } catch (error) {
        console.error("Error loading packs:", error);
      }
    }
    loadPacks();
  }, []);

  const arabicWords = [
    { arabic: "مرحبا", english: "Hello", transliteration: "marhaba" },
    { arabic: "شكراً", english: "Thank you", transliteration: "shukran" },
    { arabic: "كيفك", english: "How are you?", transliteration: "kifak" },
    { arabic: "يلا", english: "Let's go", transliteration: "yalla" },
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % arabicWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [arabicWords.length]);

  return (
    <div className="min-h-screen bg-brand-bg overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 sm:px-8 py-6 max-w-7xl mx-auto"
      >
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="36"
            height="36"
            viewBox="0 0 260 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-brand-fg"
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
          <span className="font-pphatton font-bold text-xl text-brand-fg">
            Yalla
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAuthDialog(true)}
            className="text-brand-accent hover:text-white transition-colors hidden sm:block"
          >
            Log in
          </button>
          <Button
            onClick={() => setShowAuthDialog(true)}
            className="bg-brand-fg text-brand-bg hover:bg-brand-fg/90 rounded-full px-6"
          >
            Start free
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="px-6 sm:px-8 pt-12 pb-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-brand-fg text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Spaced repetition powered
            </div>

            <h1 className="font-pphatton text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
              Learn
              <br />
              <span className="text-brand-fg">Lebanese</span>
              <br />
              Arabic
            </h1>

            <p className="text-lg text-brand-accent mb-8 max-w-md">
              The fun, effective way to master Lebanese dialect. Smart
              flashcards that adapt to how you learn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setShowAuthDialog(true)}
                className="bg-brand-fg text-brand-bg hover:bg-brand-fg/90 rounded-full px-8 py-6 text-lg font-semibold group"
              >
                Get started free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowAuthDialog(true)}
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                { value: "500+", label: "Words" },
                { value: "Free", label: "Forever" },
                { value: "5 min", label: "Daily" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-brand-fg">
                    {stat.value}
                  </div>
                  <div className="text-sm text-brand-accent">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Flashcard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative cards behind */}
            <div className="absolute -top-4 -left-4 w-full h-full bg-white/5 rounded-3xl transform rotate-3" />
            <div className="absolute -top-2 -left-2 w-full h-full bg-white/10 rounded-3xl transform rotate-1" />

            {/* Main flashcard */}
            <div className="relative bg-white rounded-3xl p-8 sm:p-12 shadow-2xl">
              <div className="text-center">
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-6xl sm:text-7xl mb-4 text-gray-900">
                    {arabicWords[currentWordIndex].arabic}
                  </p>
                  <p className="text-xl text-gray-400 mb-2 font-mono">
                    {arabicWords[currentWordIndex].transliteration}
                  </p>
                  <p className="text-2xl text-gray-700 font-medium">
                    {arabicWords[currentWordIndex].english}
                  </p>
                </motion.div>

                {/* Card indicators */}
                <div className="flex justify-center gap-2 mt-8">
                  {arabicWords.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentWordIndex
                          ? "bg-brand-bg w-6"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-8">
                <button className="flex-1 py-3 rounded-xl bg-red-100 text-red-600 font-medium hover:bg-red-200 transition">
                  Again
                </button>
                <button className="flex-1 py-3 rounded-xl bg-yellow-100 text-yellow-700 font-medium hover:bg-yellow-200 transition">
                  Hard
                </button>
                <button className="flex-1 py-3 rounded-xl bg-green-100 text-green-600 font-medium hover:bg-green-200 transition">
                  Good
                </button>
                <button className="flex-1 py-3 rounded-xl bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition">
                  Easy
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-brand-fg py-6 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-12">
              {[
                "Spaced Repetition",
                "Offline Mode",
                "AI Examples",
                "Progress Tracking",
                "Custom Words",
                "Smart Review",
              ].map((feature, i) => (
                <span
                  key={`${setIndex}-${i}`}
                  className="text-brand-bg font-medium flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {feature}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Word Packs Section */}
      {packs.length > 0 && (
        <section className="px-6 sm:px-8 py-20 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-pphatton text-4xl sm:text-5xl font-bold text-white mb-4">
              Start with curated packs
            </h2>
            <p className="text-brand-accent text-lg">
              Hand-picked vocabulary to get you speaking fast
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {packs.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedPack(pack);
                  setShowPreview(true);
                }}
                className="bg-white/10 backdrop-blur rounded-2xl p-6 cursor-pointer hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-fg/20 flex items-center justify-center mb-4 text-2xl">
                  {pack.icon || "📚"}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {pack.name}
                </h3>
                <p className="text-brand-accent text-sm mb-4 line-clamp-2">
                  {pack.description}
                </p>
                <div className="flex items-center gap-2 text-brand-fg text-sm font-medium group-hover:gap-3 transition-all">
                  <BookOpen className="w-4 h-4" />
                  Preview pack
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-6 sm:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-brand-fg rounded-3xl p-8 sm:p-12 text-center"
        >
          <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-brand-bg mb-4">
            Ready to start speaking Lebanese?
          </h2>
          <p className="text-brand-bg/70 mb-8 max-w-md mx-auto">
            Join thousands learning Lebanese Arabic the smart way. Free forever.
          </p>
          <Button
            size="lg"
            onClick={() => setShowAuthDialog(true)}
            className="bg-brand-bg text-white hover:bg-brand-bg/90 rounded-full px-10 py-6 text-lg font-semibold"
          >
            Get started now
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-brand-accent">
              &copy; {new Date().getFullYear()} Yalla Arabic
            </p>
            <div className="flex items-center gap-2 text-sm text-brand-accent">
              <span>Try another style:</span>
              <Link
                href="/?theme=notion"
                className="text-white hover:text-brand-fg underline underline-offset-2"
              >
                Modern
              </Link>
              <span>&middot;</span>
              <Link
                href="/?theme=botanical"
                className="text-white hover:text-brand-fg underline underline-offset-2"
              >
                Botanical
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Pack Preview Modal */}
      <PackPreviewModal
        pack={selectedPack}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedPack(null);
        }}
      />
    </div>
  );
}
