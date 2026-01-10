"use client";

import { useState } from "react";
import Image from "next/image";

export default function InstagramTemplate() {
  const [arabic, setArabic] = useState("كتير");
  const [transliteration, setTransliteration] = useState("ktir");
  const [english, setEnglish] = useState("very / a lot");
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Word of the Day</h2>
          <div>
            <label className="text-sm text-gray-500">Arabic</label>
            <input
              type="text"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-2xl font-arabic text-right"
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Transliteration</label>
            <input
              type="text"
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">English</label>
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Image URL (from Recraft)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Paste Recraft image URL..."
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Recraft prompt:</p>
            <p className="text-xs text-gray-700 font-mono">
              {english}, simple illustration, black ink on white background
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Screenshot the card below (1080x1080)
          </p>
        </div>

        {/* Instagram Card - 1:1 aspect ratio */}
        <div
          className="aspect-square bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-12 relative overflow-hidden"
          style={{ width: 540, height: 540 }}
        >
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            {imageUrl ? (
              <div className="w-40 h-40 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={english}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
                Word of the Day
              </p>
            )}

            <h1
              className="text-6xl font-arabic text-gray-900 leading-tight"
              dir="rtl"
            >
              {arabic}
            </h1>

            <p className="text-xl text-gray-500 font-light">
              {transliteration}
            </p>

            <div className="w-12 h-px bg-gray-200" />

            <p className="text-xl text-gray-700 font-medium">{english}</p>
          </div>

          {/* Logo at bottom */}
          <div className="absolute bottom-8 flex items-center gap-2">
            <Image
              src="/avatars/pomegranate.svg"
              alt="Yalla Flash"
              width={24}
              height={24}
            />
            <span className="font-pphatton font-bold text-gray-900">
              Yalla Flash
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
