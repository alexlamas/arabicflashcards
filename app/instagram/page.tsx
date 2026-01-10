"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Shuffle, DownloadSimple } from "@phosphor-icons/react";
import html2canvas from "html2canvas";

export default function InstagramTemplate() {
  const [arabic, setArabic] = useState("كتير");
  const [transliteration, setTransliteration] = useState("ktir");
  const [english, setEnglish] = useState("very / a lot");
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [caption, setCaption] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const prompt = `${english}, simple illustration, black ink on white background`;

  const generateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arabic, transliteration, english }),
      });
      const data = await response.json();
      if (data.caption) {
        setCaption(data.caption);
      }
    } catch (error) {
      console.error("Error generating caption:", error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // 1080x1080 output
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `yallaflash-${english.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  const shuffleWord = async () => {
    setIsShuffling(true);
    try {
      const supabase = createClient();

      // Get total count
      const { count } = await supabase
        .from("words")
        .select("*", { count: "exact", head: true });

      if (!count) return;

      // Get random word
      const randomOffset = Math.floor(Math.random() * count);
      const { data } = await supabase
        .from("words")
        .select("arabic, english, transliteration")
        .range(randomOffset, randomOffset)
        .single();

      if (data) {
        setArabic(data.arabic);
        setEnglish(data.english);
        setTransliteration(data.transliteration || "");
        setImageUrl("");
      }
    } catch (error) {
      console.error("Error fetching random word:", error);
    } finally {
      setIsShuffling(false);
    }
  };

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        alert(data.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Word of the Day</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={shuffleWord}
              disabled={isShuffling}
            >
              <Shuffle className="w-4 h-4 mr-1" />
              {isShuffling ? "..." : "Shuffle"}
            </Button>
          </div>
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
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Prompt:</p>
            <p className="text-xs text-gray-700 font-mono">{prompt}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateImage}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? "Generating..." : "Generate Image"}
            </Button>
            <Button
              variant="outline"
              onClick={downloadCard}
              disabled={isDownloading}
            >
              <DownloadSimple className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={generateCaption}
            disabled={isGeneratingCaption}
            className="w-full"
          >
            {isGeneratingCaption ? "Writing..." : "Generate Caption"}
          </Button>
          {caption && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">Caption:</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(caption);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{caption}</p>
            </div>
          )}
        </div>

        {/* Instagram Card - 1:1 aspect ratio */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-lg relative overflow-hidden"
          style={{ width: 540, height: 540 }}
        >
          {imageUrl ? (
            <>
              {/* Image as hero - top half */}
              <div className="h-[55%] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={english}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content - bottom half */}
              <div className="h-[45%] flex flex-col items-center justify-center px-8 pt-4 pb-6">
                <h1
                  className="text-5xl font-arabic text-gray-900 leading-tight mb-2"
                  dir="rtl"
                >
                  {arabic}
                </h1>

                <p className="text-lg text-gray-400 font-light mb-1">
                  {transliteration}
                </p>

                <p className="text-xl text-gray-700 font-medium">{english}</p>

                {/* Logo */}
                <div className="absolute bottom-5 flex items-center gap-2">
                  <Image
                    src="/avatars/pomegranate.svg"
                    alt="Yalla Flash"
                    width={20}
                    height={20}
                  />
                  <span className="font-pphatton font-bold text-gray-900 text-sm">
                    Yalla Flash
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* No image - centered layout */}
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

              <div className="h-full flex flex-col items-center justify-center px-12">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">
                  Word of the Day
                </p>

                <h1
                  className="text-6xl font-arabic text-gray-900 leading-tight mb-4"
                  dir="rtl"
                >
                  {arabic}
                </h1>

                <p className="text-xl text-gray-500 font-light mb-3">
                  {transliteration}
                </p>

                <div className="w-12 h-px bg-gray-200 mb-3" />

                <p className="text-xl text-gray-700 font-medium">{english}</p>

                {/* Logo */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
