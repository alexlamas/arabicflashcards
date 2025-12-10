"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame, Brain, TrendingUp } from "lucide-react";
import Link from "next/link";

export function BoldLandingPage() {
  const { setShowAuthDialog } = useAuth();

  const flashcards = [
    { arabic: "مرحبا", english: "Hello", transliteration: "marhaba" },
    { arabic: "شكراً", english: "Thank you", transliteration: "shukran" },
    { arabic: "كيفك؟", english: "How are you?", transliteration: "kifak?" },
    { arabic: "يلا", english: "Let's go!", transliteration: "yalla" },
    { arabic: "حبيبي", english: "My love", transliteration: "habibi" },
  ];

  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const streak = 7;

  const handleAnswer = (difficulty: string) => {
    if (difficulty === "easy" || difficulty === "good") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  // Auto-flip demo
  useEffect(() => {
    const flipInterval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 2500);

    const cardInterval = setInterval(() => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentCard((prev) => (prev + 1) % flashcards.length);
      }, 300);
    }, 5000);

    return () => {
      clearInterval(flipInterval);
      clearInterval(cardInterval);
    };
  }, [flashcards.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-bg/30 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-fg/20 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Arabic letters */}
        {["ي", "ل", "ا", "م", "ر", "ح", "ب"].map((letter, i) => (
          <motion.span
            key={i}
            className="absolute text-white/5 font-bold select-none"
            style={{
              fontSize: `${60 + Math.random() * 80}px`,
              left: `${10 + i * 12}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-bg to-brand-fg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">ي</span>
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="font-pphatton font-bold text-xl text-white">
            Yalla
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAuthDialog(true)}
            className="text-white/70 hover:text-white transition-colors hidden sm:block"
          >
            Log in
          </button>
          <Button
            onClick={() => setShowAuthDialog(true)}
            className="bg-white text-[#1a1a2e] hover:bg-white/90 rounded-full px-6 font-semibold"
          >
            Start free
          </Button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-8 sm:pt-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Streak badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm mb-8"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium">{streak} day streak</span>
              <span className="text-white/50">•</span>
              <span className="text-white/70">Join 2,000+ learners</span>
            </motion.div>

            <h1 className="font-pphatton text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05]">
              Master
              <br />
              <span className="bg-gradient-to-r from-brand-bg via-brand-fg to-brand-fg bg-clip-text text-transparent">
                Lebanese Arabic
              </span>
              <br />
              <span className="text-white/90">in minutes a day</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-lg leading-relaxed">
              Smart flashcards that adapt to your brain. Learn the words that
              matter, forget the frustration of forgetting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setShowAuthDialog(true)}
                className="bg-gradient-to-r from-brand-bg to-brand-bg/80 hover:from-brand-bg/90 hover:to-brand-bg/70 text-white rounded-full px-8 py-7 text-lg font-semibold shadow-lg shadow-brand-bg/25 group"
              >
                Start learning — it&apos;s free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#1a1a2e] bg-gradient-to-br from-brand-bg/80 to-brand-fg/80"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-yellow-400 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/50">
                  &ldquo;Finally, an app that actually works&rdquo;
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Interactive Flashcard Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Confetti effect */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none z-20"
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: i % 2 === 0 ? "#E9EE62" : "#974A27",
                        left: `${40 + Math.random() * 20}%`,
                        top: "50%",
                      }}
                      initial={{ y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        y: -100 - Math.random() * 100,
                        x: (Math.random() - 0.5) * 200,
                        opacity: 0,
                        scale: 0,
                        rotate: Math.random() * 360,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card stack effect */}
            <div className="relative mx-auto max-w-sm">
              {/* Background cards */}
              <div className="absolute inset-4 bg-white/5 rounded-3xl transform rotate-3 scale-[0.98]" />
              <div className="absolute inset-2 bg-white/10 rounded-3xl transform -rotate-2 scale-[0.99]" />

              {/* Main flashcard */}
              <motion.div
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-2xl cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Card indicator */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-gray-400">
                    {currentCard + 1} / {flashcards.length}
                  </span>
                  <span className="text-xs bg-brand-bg/10 text-brand-bg px-3 py-1 rounded-full font-medium">
                    Tap to flip
                  </span>
                </div>

                {/* Card content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentCard}-${isFlipped}`}
                    initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-8"
                  >
                    {!isFlipped ? (
                      <>
                        <p className="text-6xl sm:text-7xl mb-4 text-gray-900">
                          {flashcards[currentCard].arabic}
                        </p>
                        <p className="text-lg text-gray-400 font-mono">
                          {flashcards[currentCard].transliteration}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-4xl sm:text-5xl mb-4 text-gray-900 font-medium">
                          {flashcards[currentCard].english}
                        </p>
                        <p className="text-lg text-brand-bg">
                          {flashcards[currentCard].arabic}
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Spaced repetition buttons - The key feature! */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center mb-4">
                    How well did you know this?
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Again", color: "bg-red-50 text-red-600 hover:bg-red-100", time: "1m" },
                      { label: "Hard", color: "bg-orange-50 text-orange-600 hover:bg-orange-100", time: "6m" },
                      { label: "Good", color: "bg-green-50 text-green-600 hover:bg-green-100", time: "10m" },
                      { label: "Easy", color: "bg-blue-50 text-blue-600 hover:bg-blue-100", time: "4d" },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(btn.label.toLowerCase());
                        }}
                        className={`${btn.color} py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95`}
                      >
                        <span className="block text-sm">{btn.label}</span>
                        <span className="block text-xs opacity-60">{btn.time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-brand-bg mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Smart scheduling:</span>{" "}
                      Words you know well appear less often. Struggling? We&apos;ll show it more.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Brain,
              title: "Spaced Repetition",
              desc: "Science-backed algorithm that knows when you're about to forget",
              gradient: "from-purple-500/20 to-blue-500/20",
            },
            {
              icon: TrendingUp,
              title: "Track Progress",
              desc: "Watch your vocabulary grow with satisfying streaks and stats",
              gradient: "from-green-500/20 to-emerald-500/20",
            },
            {
              icon: Flame,
              title: "Stay Motivated",
              desc: "Daily goals and streaks keep you coming back for more",
              gradient: "from-orange-500/20 to-red-500/20",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/10`}
            >
              <feature.icon className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Yalla Arabic
          </p>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>Try another style:</span>
            <Link
              href="/?theme=notion"
              className="text-white/70 hover:text-white underline underline-offset-2"
            >
              Modern
            </Link>
            <span>&middot;</span>
            <Link
              href="/?theme=botanical"
              className="text-white/70 hover:text-white underline underline-offset-2"
            >
              Botanical
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
