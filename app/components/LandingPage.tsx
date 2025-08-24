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
import React from "react";

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
        {/* Logo with draw animation */}
        <motion.div
          className="flex justify-center mb-4 md:mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 260 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-brand-fg"
          >
            <motion.path
              d="M221.792 73.3274C215.418 108.418 203.652 99.3945 196.298 136.991C190.655 165.843 198.259 201.658 186.493 219.203C174.726 236.748 222.367 175.355 229.636 144.009C235.783 117.5 231.107 104.407 221.792 73.3274Z"
              fill="currentColor"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            />
            <motion.path
              d="M63.1188 136.991C55.7648 99.3945 43.9985 108.418 37.6251 73.3274C28.3101 104.407 23.6334 117.5 29.7809 144.009C37.0498 175.355 84.6903 236.748 72.924 219.203C61.1577 201.658 68.7621 165.843 63.1188 136.991Z"
              fill="currentColor"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            />
            <motion.path
              d="M126.711 220V114.19C126.711 113.086 127.606 112.19 128.711 112.19C129.815 112.19 130.853 113.085 130.853 114.19L130.711 220C130.711 221.104 129.815 222 128.711 222C127.606 222 126.711 221.104 126.711 220Z"
              fill="currentColor"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
            />
            <motion.path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M148.782 52.2994C151.201 49.6222 154.514 46.2756 157.915 43.5144C160.124 41.7211 162.456 40.1044 164.664 39.0985C166.783 38.1331 169.274 37.5098 171.466 38.5058L172.609 39.0254L172.637 40.28C173.136 63.7272 172.4 78.0833 169.827 87.99C167.2 98.1034 162.664 103.551 155.957 109.225C149.862 114.381 140.071 115.54 130.853 109.393V114.19C130.853 115.293 129.959 116.186 128.857 116.186C128.832 116.186 128.808 116.183 128.783 116.182C128.759 116.183 128.735 116.186 128.71 116.186C127.608 116.186 126.714 115.292 126.714 114.19V109.393C117.496 115.539 107.705 114.381 101.61 109.225C94.9031 103.551 90.3669 98.1032 87.7398 87.99C85.1663 78.0833 84.4311 63.7271 84.93 40.28L84.9573 39.0254L86.1009 38.5058C88.2932 37.5096 90.7841 38.1331 92.903 39.0985C95.1104 40.1043 97.4423 41.7212 99.6515 43.5144C103.053 46.2755 106.366 49.6222 108.785 52.2994C112.17 46.7574 121.223 38.3268 128.711 38.3268C136.198 38.3268 145.766 47.3617 148.782 52.2994ZM88.8931 42.0132C88.464 64.485 89.2435 77.8973 91.6044 86.986C93.9688 96.0877 97.919 100.873 104.19 106.178C109.218 110.432 118.135 111.542 126.714 104.414V98.8319C118.236 94.1872 112.794 89.3342 109.462 84.2088C105.954 78.8123 104.897 73.2896 104.897 67.7735C104.897 63.9048 105.356 59.9849 106.866 56.1547C104.527 53.4622 100.86 49.6389 97.1342 46.6143C95.0397 44.9141 93.0106 43.536 91.2476 42.7326C90.2561 42.2808 89.4823 42.0719 88.8931 42.0132ZM168.674 42.0132C168.085 42.072 167.311 42.2808 166.319 42.7326C164.556 43.536 162.527 44.9141 160.433 46.6143C156.706 49.639 153.039 53.4622 150.701 56.1547C152.211 59.9849 152.67 63.9048 152.67 67.7735C152.67 73.2897 151.613 78.8122 148.105 84.2088C144.773 89.3343 139.331 94.1871 130.853 98.8319V104.414C139.432 111.542 148.348 110.432 153.377 106.178C159.648 100.873 163.598 96.0879 165.962 86.986C168.323 77.8973 169.103 64.4851 168.674 42.0132ZM126.714 42.5074C117.734 46.8956 113.233 51.7183 111.001 56.6217C109.403 60.131 108.89 63.8446 108.89 67.7735C108.89 72.7383 109.829 77.4476 112.81 82.033C115.443 86.0829 119.757 90.1669 126.714 94.2425V42.5074ZM130.853 94.2425C137.81 90.1669 142.124 86.083 144.757 82.033C147.738 77.4475 148.677 72.7384 148.677 67.7735C148.677 63.8446 148.164 60.131 146.566 56.6217C144.334 51.7183 139.833 46.8956 130.853 42.5074V94.2425Z"
              fill="currentColor"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.1, ease: "easeInOut" }}
            />
            {/* Bottom decorative lines */}
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <React.Fragment key={index}>
                <motion.path
                  d={
                    index === 0
                      ? "M127.575 210.368L156.527 190.404C157.436 189.777 158.682 190.006 159.309 190.915C159.936 191.824 159.707 193.07 158.798 193.697L129.846 213.661C128.937 214.288 127.691 214.059 127.064 213.15C126.437 212.241 126.666 210.995 127.575 210.368Z"
                      : index === 1
                      ? "M129.847 210.368L100.895 190.404C99.9853 189.777 98.7398 190.006 98.1126 190.915C97.4854 191.824 97.7142 193.07 98.6235 193.697L127.575 213.661C128.485 214.288 129.73 214.059 130.357 213.15C130.985 212.241 130.756 210.995 129.847 210.368Z"
                      : index === 2
                      ? "M127.575 192.401L156.527 172.436C157.436 171.809 158.682 172.038 159.309 172.947C159.936 173.856 159.707 175.102 158.798 175.729L129.846 195.693C128.937 196.32 127.691 196.091 127.064 195.182C126.437 194.273 126.666 193.028 127.575 192.401Z"
                      : index === 3
                      ? "M129.847 192.401L100.895 172.436C99.9853 171.809 98.7398 172.038 98.1126 172.947C97.4854 173.856 97.7142 175.102 98.6235 175.729L127.575 195.693C128.485 196.32 129.73 196.091 130.357 195.182C130.985 194.273 130.756 193.028 129.847 192.401Z"
                      : index === 4
                      ? "M127.575 174.433L156.527 154.469C157.436 153.842 158.682 154.07 159.309 154.98C159.936 155.889 159.707 157.134 158.798 157.761L129.846 177.726C128.937 178.352 127.691 178.124 127.064 177.215C126.437 176.305 126.666 175.06 127.575 174.433Z"
                      : "M129.847 174.433L100.895 154.469C99.9853 153.842 98.7398 154.07 98.1126 154.98C97.4854 155.889 97.7142 157.134 98.6235 157.761L127.575 177.726C128.485 178.352 129.73 178.124 130.357 177.215C130.985 176.305 130.756 175.06 129.847 174.433Z"
                  }
                  fill="currentColor"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.8 + index * 0.1,
                    ease: "easeOut",
                  }}
                />
              </React.Fragment>
            ))}
            {/* Continue with remaining paths */}
            {[6, 7, 8, 9].map((index) => (
              <React.Fragment key={index}>
                <motion.path
                  d={
                    index === 6
                      ? "M127.575 156.465L156.527 136.501C157.436 135.874 158.682 136.103 159.309 137.012C159.936 137.921 159.707 139.167 158.798 139.794L129.846 159.758C128.937 160.385 127.691 160.156 127.064 159.247C126.437 158.338 126.666 157.092 127.575 156.465Z"
                      : index === 7
                      ? "M129.847 156.465L100.895 136.501C99.9853 135.874 98.7398 136.103 98.1126 137.012C97.4854 137.921 97.7142 139.167 98.6235 139.794L127.575 159.758C128.485 160.385 129.73 160.156 130.357 159.247C130.985 158.338 130.756 157.092 129.847 156.465Z"
                      : index === 8
                      ? "M127.575 138.498L156.527 118.533C157.436 117.906 158.682 118.135 159.309 119.044C159.936 119.953 159.707 121.199 158.798 121.826L129.846 141.79C128.937 142.417 127.691 142.188 127.064 141.279C126.437 140.37 126.666 139.125 127.575 138.498Z"
                      : "M129.847 138.498L100.895 118.533C99.9853 117.906 98.7398 118.135 98.1126 119.044C97.4854 119.953 97.7142 121.199 98.6235 121.826L127.575 141.79C128.485 142.417 129.73 142.188 130.357 141.279C130.985 140.37 130.756 139.125 129.847 138.498Z"
                  }
                  fill="currentColor"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.8 + index * 0.1,
                    ease: "easeOut",
                  }}
                />
              </React.Fragment>
            ))}
          </svg>
        </motion.div>

        {/* Title and Subtitle */}
        <motion.div
          className="text-center mb-6 md:mb-8 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <motion.h1
            className="font-pphatton text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-fg mb-3 md:mb-4 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            Yalla! Let&apos;s learn Lebanese arabic
          </motion.h1>
          <motion.p
            className="font-geist-mono text-sm sm:text-base text-white/90 max-w-xl md:max-w-2xl mx-auto px-4 sm:px-8 md:px-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            Master Lebanese with smart flashcards that adapt to your learning
            pace and add your own as you go.
          </motion.p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
        >
          <Button
            size="lg"
            onClick={() => setShowAuthDialog(true)}
            className="gap-2 px-6 sm:px-8 py-5 sm:py-6 !bg-brand-fg !text-brand-bg font-geist-mono font-medium rounded-full group transition hover:scale-105 text-sm sm:text-base md:cursor-none"
            onMouseEnter={() => setIsPointer(true)}
            onMouseLeave={() => setIsPointer(false)}
          >
            Start learning
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 group-hover:-rotate-12 transition" />
          </Button>
        </motion.div>
      </div>

      {/* Pack Carousel */}
      <motion.div
        className="mb-4 md:mb-2 min-h-[200px] md:h-64 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.8, ease: "easeOut" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-72 sm:w-80 h-56 md:h-56 rounded-lg bg-gray-100/10 animate-pulse" />
          </div>
        ) : packs.length > 0 ? (
          <div className="flex items-center justify-center sm:gap-8 gap-2 w-full max-w-2xl">
            <motion.button
              onClick={prevPack}
              className="p-1.5 sm:p-2 rounded-full bg-brand-fg/10 hover:bg-brand-fg/20 transition text-brand-accent flex-shrink-0 md:cursor-none hover:scale-110"
              aria-label="Previous pack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.4 }}
              onMouseEnter={() => setIsPointer(true)}
              onMouseLeave={() => setIsPointer(false)}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 " />
            </motion.button>

            <div
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[30rem] relative"
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
              className="p-1.5 sm:p-2 rounded-full bg-brand-fg/10 hover:bg-brand-fg/20 transition text-brand-accent flex-shrink-0 md:cursor-none hover:scale-110"
              aria-label="Next pack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 2 }}
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
          className="flex justify-center gap-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.5 }}
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
                  ? "w-8 bg-brand-accent"
                  : "w-1.5 bg-brand-accent/30 hover:bg-brand-fg/50"
              }`}
              aria-label={`Go to pack ${index + 1}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1.6 + index * 0.05 }}
              onMouseEnter={() => setIsPointer(true)}
              onMouseLeave={() => setIsPointer(false)}
            />
          ))}
        </motion.div>
      )}

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
