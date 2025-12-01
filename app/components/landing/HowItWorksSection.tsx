"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowRight, Brain } from "lucide-react";

export function HowItWorksSection() {
  const { setShowAuthDialog } = useAuth();

  const steps = [
    {
      number: "01",
      title: "Pick a word pack",
      description:
        "Start with curated word packs covering everyday topics like greetings, food, family, and more. Or jump right in and add your own words.",
      visual: (
        <div className="bg-gradient-to-br from-brand-accent to-white rounded-2xl p-6 shadow-lg">
          <div className="space-y-3">
            {["Greetings", "Food & Drink", "Family"].map((pack, i) => (
              <div
                key={pack}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  i === 0
                    ? "bg-brand-bg text-white scale-[1.02] shadow-md"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${
                    i === 0 ? "bg-white/20" : "bg-brand-bg/10"
                  } flex items-center justify-center text-sm font-bold`}
                >
                  {i === 0 ? "👋" : i === 1 ? "🍽️" : "👨‍👩‍👧"}
                </div>
                <div className="flex-1">
                  <span className="font-medium block">{pack}</span>
                  <span
                    className={`text-xs ${i === 0 ? "text-white/70" : "text-gray-400"}`}
                  >
                    {i === 0 ? "12 words" : i === 1 ? "24 words" : "18 words"}
                  </span>
                </div>
                {i === 0 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: "Review with smart flashcards",
      description:
        "See the Arabic word, try to remember the meaning, then flip to check. Rate how well you knew it — the app learns your patterns and schedules reviews at the perfect time.",
      visual: (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          {/* Flashcard */}
          <div className="text-center py-6 mb-4">
            <p className="text-5xl mb-2 text-gray-900">مرحبا</p>
            <p className="text-lg text-gray-400 font-mono">marhaba</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-brand-bg bg-brand-bg/10 px-3 py-1.5 rounded-full">
              <span>Hello!</span>
            </div>
          </div>

          {/* The key spaced repetition buttons */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 text-center mb-3">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Again", color: "bg-red-50 text-red-600", time: "1m" },
                {
                  label: "Hard",
                  color: "bg-orange-50 text-orange-600",
                  time: "6m",
                },
                {
                  label: "Good",
                  color: "bg-green-50 text-green-600",
                  time: "10m",
                },
                {
                  label: "Easy",
                  color: "bg-blue-50 text-blue-600",
                  time: "4d",
                },
              ].map((btn) => (
                <div
                  key={btn.label}
                  className={`${btn.color} py-2.5 rounded-xl text-center`}
                >
                  <span className="block text-sm font-medium">{btn.label}</span>
                  <span className="block text-xs opacity-60">{btn.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded-lg flex items-start gap-2">
              <Brain className="w-4 h-4 text-brand-bg mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                Words you struggle with appear more often. Easy ones space out
                to days or weeks.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "Watch your progress grow",
      description:
        "Track your learning journey with detailed statistics. See words move from 'new' to 'learning' to 'learned' as you master them.",
      visual: (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Learning", value: "24", color: "text-orange-500" },
              { label: "Learned", value: "86", color: "text-green-500" },
              { label: "Streak", value: "7🔥", color: "text-brand-bg" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="flex items-end gap-1.5 h-24">
            {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-brand-bg to-brand-bg/60 transition-all hover:from-brand-fg hover:to-brand-fg/60"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span className="font-medium text-brand-bg">Today</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-white text-gray-600 text-sm font-medium mb-4 shadow-sm"
          >
            How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-pphatton text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            Simple as 1, 2, 3
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            No complicated setup. Just start learning and let the app do the
            heavy lifting.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12 lg:gap-20`}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <span className="inline-block text-6xl font-pphatton font-bold text-gray-200 mb-4">
                  {step.number}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual */}
              <div className="flex-1 w-full max-w-md">{step.visual}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <Button
            size="lg"
            onClick={() => setShowAuthDialog(true)}
            className="bg-brand-bg hover:bg-brand-bg/90 text-white rounded-full px-8 py-6 text-lg font-medium group shadow-lg shadow-brand-bg/20"
          >
            Start your journey
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
