"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const { setShowAuthDialog } = useAuth();

  return (
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
        className="absolute top-1/4 left-[10%] w-20 h-20 bg-brand-fg/20 rounded-2xl"
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
        className="absolute top-1/3 right-[15%] w-16 h-16 bg-brand-bg/10 rounded-full"
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
        className="absolute bottom-1/3 left-[20%] w-12 h-12 bg-brand-secondary/20 rounded-xl"
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-fg/10 text-brand-bg text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Smart spaced repetition learning</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-pphatton text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 tracking-tight"
        >
          Learn Lebanese
          <br />
          <span className="text-brand-bg">the fun way</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Master Lebanese Arabic with smart flashcards that adapt to your
          learning pace. Build vocabulary, track progress, and learn at your own
          rhythm.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={() => setShowAuthDialog(true)}
            className="bg-brand-bg hover:bg-brand-bg/90 text-white rounded-full px-8 py-6 text-lg font-medium group shadow-lg shadow-brand-bg/20 hover:shadow-xl hover:shadow-brand-bg/30 transition-all"
          >
            Start learning for free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            className="text-gray-600 hover:text-gray-900 rounded-full px-8 py-6 text-lg"
          >
            See how it works
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-bg to-brand-fg border-2 border-white"
                style={{
                  backgroundImage: `linear-gradient(${i * 45}deg, #974A27, #E9EE62)`,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Join learners mastering Lebanese Arabic
          </p>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
