"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowRight } from "lucide-react";

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
              className={`flex items-center gap-3 p-3 rounded-xl ${
                i === 0 ? "bg-brand-bg text-white" : "bg-white"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg ${
                  i === 0 ? "bg-white/20" : "bg-brand-bg/10"
                } flex items-center justify-center text-sm font-medium`}
              >
                {i === 0 ? "12" : i === 1 ? "24" : "18"}
              </div>
              <span className="font-medium">{pack}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Review with flashcards",
    description:
      "See the Arabic word, try to remember the meaning, then flip to check. Rate how well you knew it to help the algorithm learn your patterns.",
    visual: (
      <div className="relative">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          <p className="text-4xl mb-2 font-medium text-gray-900">مرحبا</p>
          <p className="text-lg text-gray-400">marhaba</p>
        </div>
        <div className="absolute -bottom-4 -right-4 bg-brand-fg rounded-xl px-4 py-2 shadow-md">
          <p className="text-sm font-medium text-brand-bg">Hello!</p>
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
        <div className="flex items-end gap-2 h-32">
          {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-brand-bg to-brand-bg/60"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-400">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  const { setShowAuthDialog } = useAuth();

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
