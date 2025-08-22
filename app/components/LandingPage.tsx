"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  StarterPackService,
  StarterPack,
} from "../services/starterPackService";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PackPreviewModal } from "./PackPreviewModal";
import { PackCard } from "./PackCard";
import { motion, AnimatePresence } from "framer-motion";

export function LandingPage() {
  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPackIndex, setCurrentPackIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0); // Track swipe direction
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const { setShowAuthDialog } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadPacks() {
      try {
        const availablePacks = await StarterPackService.getAvailablePacks();
        setPacks(availablePacks);
      } catch (error) {
        console.error("Error loading packs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPacks();
  }, []);

  // Track mouse position for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (!loading && packs.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentPackIndex((prev) => (prev + 1) % packs.length);
      }, 4000); // Rotate every 4 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [loading, packs.length, isPaused]);

  const handlePackPreview = (pack: StarterPack) => {
    setSelectedPack(pack);
    setShowPreview(true);
    setIsPaused(true); // Pause rotation when preview is open
  };

  const nextPack = () => {
    setDirection(1);
    setCurrentPackIndex((prev) => (prev + 1) % packs.length);
    setIsPaused(true); // Pause auto-rotation on manual navigation
    setTimeout(() => setIsPaused(false), 8000); // Resume after 8 seconds
  };

  const prevPack = () => {
    setDirection(-1);
    setCurrentPackIndex((prev) => (prev - 1 + packs.length) % packs.length);
    setIsPaused(true); // Pause auto-rotation on manual navigation
    setTimeout(() => setIsPaused(false), 8000); // Resume after 8 seconds
  };

  return (
    <div
      className="min-h-screen bg-brand-bg overflow-y-auto flex flex-col justify-center py-8 md:py-0 md:cursor-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Custom Cursor */}
      <motion.div
        className="fixed bg-white/10 backdrop-blur-sm rounded-full pointer-events-none z-50 hidden md:block transition"
        style={{
          left: cursorPos.x - (isPointer ? 20 : 12),
          top: cursorPos.y - (isPointer ? 20 : 12),
          width: isPointer ? 40 : 24,
          height: isPointer ? 40 : 24,
        }}
        animate={{
          opacity: isHovering ? 1 : 0,
          scale: isPointer ? 1 : 1,
        }}
        transition={{
          opacity: { duration: 0.2 },
          scale: { type: "spring", damping: 15, stiffness: 300 },
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Title and Subtitle */}
        <motion.div
          className="text-center mb-6 md:mb-8 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1
            className="font-pphatton text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-fg mb-3 md:mb-4 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            Yalla! let&apos;s learn Lebanese arabic
          </motion.h1>
          <motion.p
            className="font-geist-mono text-sm sm:text-base text-white/90 max-w-xl md:max-w-2xl mx-auto px-4 sm:px-8 md:px-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            Master Lebanese with smart flashcards that adapt to your learning
            pace and add your own as you go.
          </motion.p>
        </motion.div>

        {/* Pack Carousel */}
        <motion.div
          className="mb-6 md:mb-10 min-h-[200px] md:h-64 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-72 sm:w-80 h-56 md:h-56 rounded-lg bg-gray-100/10 animate-pulse" />
            </div>
          ) : packs.length > 0 ? (
            <div className="flex items-center justify-center sm:gap-8 w-full max-w-2xl">
              <motion.button
                onClick={prevPack}
                className="p-1.5 sm:p-2 rounded-full bg-brand-fg/10 hover:bg-brand-fg/20 transition text-brand-fg flex-shrink-0 md:cursor-none hover:scale-110"
                aria-label="Previous pack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                onMouseEnter={() => setIsPointer(true)}
                onMouseLeave={() => setIsPointer(false)}
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 " />
              </motion.button>

              <div
                className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[30rem] relative overflow-hidden"
                onMouseEnter={() => {
                  setIsPaused(true);
                  setIsPointer(true);
                }}
                onMouseLeave={() => {
                  setIsPaused(false);
                  setIsPointer(false);
                }}
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentPackIndex}
                    custom={direction}
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      filter: "blur(10px)",
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <PackCard
                      pack={packs[currentPackIndex]}
                      onPreview={handlePackPreview}
                      showImportButton={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.button
                onClick={nextPack}
                className="p-1.5 sm:p-2 rounded-full bg-brand-fg/10 hover:bg-brand-fg/20 transition text-brand-fg flex-shrink-0 md:cursor-none hover:scale-110"
                aria-label="Next pack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                onMouseEnter={() => setIsPointer(true)}
                onMouseLeave={() => setIsPointer(false)}
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.button>
            </div>
          ) : null}
        </motion.div>

        {/* Carousel Indicators */}
        {packs.length > 1 && !loading && (
          <motion.div
            className="flex justify-center gap-1.5 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            {packs.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  const diff = index - currentPackIndex;
                  setDirection(diff > 0 ? 1 : -1);
                  setCurrentPackIndex(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 8000);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out md:cursor-none ${
                  index === currentPackIndex
                    ? "w-8 bg-brand-fg"
                    : "w-1.5 bg-brand-fg/30 hover:bg-brand-fg/50"
                }`}
                aria-label={`Go to pack ${index + 1}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                onMouseEnter={() => setIsPointer(true)}
                onMouseLeave={() => setIsPointer(false)}
              />
            ))}
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
        >
          <Button
            size="lg"
            onClick={() => setShowAuthDialog(true)}
            className="gap-2 px-6 sm:px-8 py-5 sm:py-6 !bg-brand-fg !text-brand-bg font-geist-mono font-medium rounded-full group transition hover:scale-105 text-sm sm:text-base md:cursor-none"
            onMouseEnter={() => setIsPointer(true)}
            onMouseLeave={() => setIsPointer(false)}
          >
            Start learning
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition" />
          </Button>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <PackPreviewModal
        pack={selectedPack}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedPack(null);
          setIsPaused(false); // Resume rotation when preview is closed
        }}
      />
    </div>
  );
}
