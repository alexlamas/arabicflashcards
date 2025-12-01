"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BotanicalLandingPage() {
  const { setShowAuthDialog } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f3] overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ي</span>
          </div>
          <span className="text-gray-900 font-medium">yalla arabic</span>
        </Link>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowAuthDialog(true)}
            className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            sign in
          </button>
          <Button
            onClick={() => setShowAuthDialog(true)}
            variant="outline"
            className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            get started
          </Button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative min-h-[calc(100vh-100px)] flex">
        {/* Palm Tree Illustration - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute left-0 bottom-0 w-[400px] h-[90vh] pointer-events-none hidden lg:block"
        >
          <svg
            viewBox="0 0 400 800"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Palm trunk */}
            <path
              d="M180 800 Q185 600 175 400 Q170 300 180 200"
              stroke="#8B7355"
              strokeWidth="40"
              fill="none"
              strokeLinecap="round"
            />
            {/* Trunk texture */}
            {[...Array(20)].map((_, i) => (
              <path
                key={i}
                d={`M${155 + Math.sin(i) * 5} ${750 - i * 28} Q180 ${745 - i * 28} ${205 - Math.sin(i) * 5} ${750 - i * 28}`}
                stroke="#6B5344"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
            ))}
            {/* Palm fronds */}
            {[
              "M180 200 Q120 150 40 180",
              "M180 200 Q100 100 20 60",
              "M180 200 Q150 80 100 20",
              "M180 200 Q200 60 220 10",
              "M180 200 Q260 80 320 40",
              "M180 200 Q300 120 380 100",
              "M180 200 Q280 180 360 200",
              "M180 200 Q250 220 340 280",
              "M180 200 Q200 250 260 340",
              "M180 200 Q150 250 140 340",
              "M180 200 Q100 220 60 300",
              "M180 200 Q80 180 20 240",
            ].map((d, i) => (
              <g key={i}>
                <path
                  d={d}
                  stroke="#4A7C59"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Frond details */}
                {[...Array(8)].map((_, j) => {
                  const t = (j + 1) / 9;
                  return (
                    <line
                      key={j}
                      x1={180 + (parseInt(d.split(" ")[4]) - 180) * t * 0.8}
                      y1={200 + (parseInt(d.split(" ")[5]) - 200) * t * 0.8}
                      x2={180 + (parseInt(d.split(" ")[4]) - 180) * t * 0.8 + (Math.random() - 0.5) * 30}
                      y2={200 + (parseInt(d.split(" ")[5]) - 200) * t * 0.8 + (Math.random() - 0.5) * 30}
                      stroke="#5C8A6B"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  );
                })}
              </g>
            ))}
            {/* Date clusters */}
            {[
              [160, 220],
              [200, 230],
              [175, 250],
            ].map(([cx, cy], i) => (
              <g key={i}>
                {[...Array(12)].map((_, j) => (
                  <ellipse
                    key={j}
                    cx={cx + (Math.random() - 0.5) * 25}
                    cy={cy + Math.random() * 30}
                    rx="4"
                    ry="6"
                    fill="#C4A35A"
                  />
                ))}
              </g>
            ))}
          </svg>
        </motion.div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 lg:pl-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl w-full"
          >
            <h1 className="font-pphatton text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              A flashcard app for
              <br />
              students of{" "}
              <span className="text-[#4A7C59]">Lebanese Arabic</span>
            </h1>

            {/* Search Input */}
            <div className="relative mb-12">
              <div
                className={`flex items-center gap-3 border-b-2 pb-3 transition-colors ${
                  searchFocused ? "border-[#4A7C59]" : "border-gray-300"
                }`}
              >
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Yalla, search for a word..."
                  className="flex-1 bg-transparent text-lg text-gray-900 placeholder:text-gray-400 outline-none"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onClick={() => setShowAuthDialog(true)}
                  readOnly
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Sign up to search and start learning
              </p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
            >
              {[
                { title: "Smart Review", desc: "Spaced repetition that adapts" },
                { title: "Offline Ready", desc: "Learn anywhere, anytime" },
                { title: "Add Your Own", desc: "Build personal vocabulary" },
              ].map((feature) => (
                <div key={feature.title} className="text-center sm:text-left">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-6 text-lg group"
              >
                Start learning free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Branch Illustration - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute right-0 top-1/4 w-[300px] pointer-events-none hidden xl:block"
        >
          <svg
            viewBox="0 0 300 400"
            className="w-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Branch */}
            <path
              d="M300 200 Q250 200 180 180 Q140 170 100 200"
              stroke="#8B7355"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Leaves */}
            {[
              { x: 120, y: 160, rotate: -30 },
              { x: 140, y: 140, rotate: -45 },
              { x: 160, y: 130, rotate: -60 },
              { x: 180, y: 125, rotate: -70 },
              { x: 200, y: 140, rotate: -50 },
              { x: 220, y: 160, rotate: -30 },
              { x: 130, y: 200, rotate: 20 },
              { x: 150, y: 220, rotate: 40 },
              { x: 170, y: 230, rotate: 50 },
            ].map((leaf, i) => (
              <ellipse
                key={i}
                cx={leaf.x}
                cy={leaf.y}
                rx="35"
                ry="12"
                fill="#5C8A6B"
                transform={`rotate(${leaf.rotate} ${leaf.x} ${leaf.y})`}
                opacity="0.9"
              />
            ))}
            {/* Fruits */}
            <ellipse cx="110" cy="210" rx="15" ry="20" fill="#7BA05B" />
            <ellipse cx="95" cy="190" rx="12" ry="16" fill="#8DB36D" />
          </svg>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#f5f5f3]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Yalla Arabic
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Try another style:</span>
              <Link
                href="/?theme=notion"
                className="text-gray-700 hover:text-gray-900 underline underline-offset-2"
              >
                Modern
              </Link>
              <span>&middot;</span>
              <Link
                href="/?theme=bold"
                className="text-gray-700 hover:text-gray-900 underline underline-offset-2"
              >
                Bold
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
