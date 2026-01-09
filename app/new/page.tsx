"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircle,
  CardsThree,
  TrendUp,
  Ghost,
  SmileyNervous,
  Balloon,
  Star,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react";

const FLUENCY_LEVELS = [
  { level: "tourist", label: "Tourist", threshold: 0, logo: "/logo-tourist.svg" },
  { level: "visitor", label: "Visitor", threshold: 50, logo: "/logo-visitor.svg" },
  { level: "resident", label: "Resident", threshold: 150, logo: "/logo-resident.svg" },
  { level: "local", label: "Local", threshold: 350, logo: "/logo-local.svg" },
];

export default function NewLandingPage() {
  const { setShowAuthDialog } = useAuth();

  const flashcards = [
    { arabic: "مرحبا", english: "Hello", transliteration: "marhaba" },
    { arabic: "شكراً", english: "Thank you", transliteration: "shukran" },
    { arabic: "كيفك؟", english: "How are you?", transliteration: "kifak?" },
    { arabic: "يلا", english: "Let's go!", transliteration: "yalla" },
  ];

  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [feedbackAnimation, setFeedbackAnimation] = useState<{
    isPlaying: boolean;
    text: string;
    color: string;
    icon: "ghost" | "nervous" | "balloon" | "star" | null;
  }>({ isPlaying: false, text: "", color: "", icon: null });

  const [activeLevelIndex, setActiveLevelIndex] = useState(0);

  // Cycle through fluency levels
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLevelIndex((prev) => (prev + 1) % FLUENCY_LEVELS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRating = (rating: number) => {
    const feedbackText = rating === 0 ? "Forgot" : rating === 1 ? "Struggled" : rating === 2 ? "Remembered" : "Perfect!";
    const feedbackColor = rating === 0 ? "#ef4444" : rating === 1 ? "#f59e0b" : rating === 2 ? "#10b981" : "#14b8a6";
    const feedbackIcon = rating === 0 ? "ghost" : rating === 1 ? "nervous" : rating === 2 ? "balloon" : "star";

    setFeedbackAnimation({ isPlaying: true, text: feedbackText, color: feedbackColor, icon: feedbackIcon as "ghost" | "nervous" | "balloon" | "star" });

    setTimeout(() => {
      setFeedbackAnimation({ isPlaying: false, text: "", color: "", icon: null });
    }, 1500);

    setTimeout(() => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentCard((prev) => (prev + 1) % flashcards.length);
      }, 150);
    }, 1300);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Pill style like app */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="h-12 flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-sm px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-tourist.svg"
              alt="Yalla Flash"
              width={28}
              height={28}
            />
            <span className="font-pphatton font-bold text-lg text-gray-900">
              Yalla Flash
            </span>
          </Link>

          <div className="flex-1" />

          <button
            onClick={() => setShowAuthDialog(true)}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Log in
          </button>
          <Button
            onClick={() => setShowAuthDialog(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full px-5 text-sm font-medium"
          >
            Get started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-medium mb-6"
              >
                <TrendUp className="w-4 h-4" weight="bold" />
                Smart spaced repetition
              </motion.div>

              <h1 className="font-pphatton text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Learn
                <br />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Lebanese Arabic
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-md">
                Smart flashcards that adapt to your brain. Go from tourist to local with words that actually stick.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  size="lg"
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full px-8 py-6 text-base font-medium group"
                >
                  <PlayCircle className="w-5 h-5 mr-2" weight="fill" />
                  Start learning free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                  <span>No credit card</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Flashcard Demo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative max-w-sm mx-auto">
                {/* Card stack effect */}
                <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 transform -translate-y-2 -translate-x-1 rotate-[-2deg] opacity-60" />
                <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 transform -translate-y-1 rotate-[-1deg] opacity-80" />

                {/* Main flashcard */}
                <div
                  className="relative bg-white rounded-2xl border border-gray-200 shadow-lg cursor-pointer overflow-hidden"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Card content */}
                  <div className="min-h-[180px] flex flex-col items-center justify-center p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currentCard}-${isFlipped}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-center"
                      >
                        {!isFlipped ? (
                          <p className="text-3xl font-semibold text-gray-900">
                            {flashcards[currentCard].english}
                          </p>
                        ) : (
                          <>
                            <p className="text-4xl font-arabic mb-2">
                              {flashcards[currentCard].arabic}
                            </p>
                            <p className="text-sm text-gray-500">
                              {flashcards[currentCard].transliteration}
                            </p>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Card chin with buttons */}
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <AnimatePresence mode="wait">
                      {!isFlipped ? (
                        <motion.p
                          key="hint"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-xs text-gray-400"
                        >
                          Tap to reveal
                        </motion.p>
                      ) : (
                        <motion.div
                          key="buttons"
                          className="grid grid-cols-4 gap-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {[
                            { label: "Forgot", color: "bg-red-50 text-red-600 border-red-200", rating: 0 },
                            { label: "Struggled", color: "bg-amber-50 text-amber-600 border-amber-200", rating: 1 },
                            { label: "Remembered", color: "bg-emerald-50 text-emerald-600 border-emerald-200", rating: 2 },
                            { label: "Perfect", color: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent", rating: 3 },
                          ].map((btn) => (
                            <button
                              key={btn.label}
                              onClick={(e) => { e.stopPropagation(); handleRating(btn.rating); }}
                              className={`py-2 rounded-lg border text-xs font-medium transition-all hover:scale-105 ${btn.color}`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Feedback animation overlay */}
                  {feedbackAnimation.isPlaying && (
                    <>
                      <motion.div
                        className="absolute inset-0 z-20 rounded-2xl"
                        style={{ backgroundColor: feedbackAnimation.color }}
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      />
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                          className="mb-2"
                        >
                          {feedbackAnimation.icon === "ghost" && <Ghost className="w-10 h-10 text-white" weight="fill" />}
                          {feedbackAnimation.icon === "nervous" && <SmileyNervous className="w-10 h-10 text-white" weight="fill" />}
                          {feedbackAnimation.icon === "balloon" && <Balloon className="w-10 h-10 text-white" weight="fill" />}
                          {feedbackAnimation.icon === "star" && <Star className="w-10 h-10 text-white" weight="fill" />}
                        </motion.div>
                        <span className="text-white text-xl font-bold">
                          {feedbackAnimation.text}
                        </span>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fluency Levels Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Track your journey to fluency
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Progress through four levels as you learn. Each milestone unlocks a new badge.
            </p>
          </motion.div>

          {/* Level progression */}
          <div className="relative">
            {/* Progress bar background */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full -translate-y-1/2 hidden sm:block" />
            <motion.div
              className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full -translate-y-1/2 hidden sm:block"
              initial={{ width: "0%" }}
              whileInView={{ width: `${((activeLevelIndex + 1) / FLUENCY_LEVELS.length) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">
              {FLUENCY_LEVELS.map((level, index) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                    index <= activeLevelIndex ? "bg-white shadow-lg border border-gray-100" : "opacity-50"
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                    index <= activeLevelIndex ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gray-100"
                  }`}>
                    <Image
                      src={level.logo}
                      alt={level.label}
                      width={56}
                      height={56}
                      className={index <= activeLevelIndex ? "" : "grayscale opacity-50"}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{level.label}</h3>
                  <p className="text-xs text-gray-500">{level.threshold}+ words</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: CardsThree,
                title: "Vocabulary packs",
                description: "Start with curated packs for greetings, food, family and more.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: TrendUp,
                title: "Smart scheduling",
                description: "Words you know appear less. Struggling? We'll show it more.",
                gradient: "from-teal-500 to-cyan-500",
              },
              {
                icon: PlayCircle,
                title: "Quick reviews",
                description: "Review in minutes a day. Perfect for your commute or coffee break.",
                gradient: "from-cyan-500 to-emerald-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" weight="fill" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-10 sm:p-14 text-center shadow-2xl"
          >
            <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start?
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Join learners mastering Lebanese Arabic with smart flashcards. Free forever.
            </p>
            <Button
              size="lg"
              onClick={() => setShowAuthDialog(true)}
              className="bg-white text-emerald-600 hover:bg-white/90 rounded-full px-10 py-6 text-base font-semibold"
            >
              Get started free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Yalla Flash
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Compare:</span>
            <Link href="/?theme=notion" className="text-emerald-600 hover:underline">
              Current
            </Link>
            <span>&middot;</span>
            <Link href="/?theme=bold" className="text-emerald-600 hover:underline">
              Bold
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
