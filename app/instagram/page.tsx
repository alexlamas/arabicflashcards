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
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const cardRefs = {
    classic: useRef<HTMLDivElement>(null),
    polaroid: useRef<HTMLDivElement>(null),
    modern: useRef<HTMLDivElement>(null),
    minimal: useRef<HTMLDivElement>(null),
  };

  const prompt = `${english}, simple illustration, black ink on white background`;

  const downloadCard = async (style: string) => {
    const ref = cardRefs[style as keyof typeof cardRefs];
    if (!ref.current) return;
    setIsDownloading(style);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `yallaflash-${english.replace(/\s+/g, "-").toLowerCase()}-${style}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error downloading:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const shuffleWord = async () => {
    setIsShuffling(true);
    try {
      const supabase = createClient();
      const { count } = await supabase
        .from("words")
        .select("*", { count: "exact", head: true });
      if (!count) return;
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
        setCaption("");
      }
    } catch (error) {
      console.error("Error fetching random word:", error);
    } finally {
      setIsShuffling(false);
    }
  };

  const generate = async () => {
    setIsGenerating(true);
    setCaption("");
    setImageUrl("");
    try {
      const [imageResponse, captionResponse] = await Promise.all([
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }),
        fetch("/api/generate-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arabic, transliteration, english }),
        }),
      ]);
      const [imageData, captionData] = await Promise.all([
        imageResponse.json(),
        captionResponse.json(),
      ]);
      if (imageData.imageUrl) setImageUrl(imageData.imageUrl);
      if (captionData.caption) setCaption(captionData.caption);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl p-4 max-w-md mx-auto space-y-4">
          <h2 className="font-semibold text-gray-900">Word of the Day</h2>
          <div className="text-center py-4 border rounded-lg bg-gray-50">
            <p className="text-3xl font-arabic mb-1" dir="rtl">{arabic}</p>
            <p className="text-gray-500">{transliteration}</p>
            <p className="text-gray-700 font-medium">{english}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={shuffleWord}
              disabled={isShuffling || isGenerating}
              className="flex-1"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {isShuffling ? "..." : "Shuffle"}
            </Button>
            <Button
              onClick={generate}
              disabled={isGenerating || isShuffling}
              className="flex-1"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
          {caption && (
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="flex items-center justify-between mb-2 sticky top-0 bg-gray-50">
                <p className="text-xs text-gray-500">Caption:</p>
                <button
                  onClick={() => navigator.clipboard.writeText(caption)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{caption}</p>
            </div>
          )}
        </div>

        {/* Card Styles Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Style 1: Classic */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 text-center">Classic</p>
            <div
              ref={cardRefs.classic}
              className="bg-white relative overflow-hidden"
              style={{ width: 270, height: 270 }}
            >
              <div className="absolute inset-3 border-2 border-gray-100 rounded-2xl" />
              {imageUrl ? (
                <>
                  <div className="h-[50%] p-3 pb-0">
                    <div className="w-full h-full rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="h-[50%] flex flex-col items-center justify-center px-4">
                    <h1 className="text-3xl font-arabic text-gray-900 mb-1" dir="rtl">{arabic}</h1>
                    <p className="text-sm text-gray-400">{transliteration}</p>
                    <p className="text-sm text-gray-700 font-medium">{english}</p>
                    <div className="absolute bottom-3 flex items-center gap-1">
                      <Image src="/avatars/pomegranate.svg" alt="" width={14} height={14} />
                      <span className="font-pphatton font-bold text-gray-900 text-xs">Yalla Flash</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-6">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Word of the Day</p>
                  <h1 className="text-4xl font-arabic text-gray-900 mb-2" dir="rtl">{arabic}</h1>
                  <p className="text-sm text-gray-400 mb-1">{transliteration}</p>
                  <p className="text-sm text-gray-700 font-medium">{english}</p>
                  <div className="absolute bottom-3 flex items-center gap-1">
                    <Image src="/avatars/pomegranate.svg" alt="" width={14} height={14} />
                    <span className="font-pphatton font-bold text-gray-900 text-xs">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("classic")} disabled={isDownloading === "classic"}>
              <DownloadSimple className="w-3 h-3 mr-1" />
              {isDownloading === "classic" ? "..." : "Download"}
            </Button>
          </div>

          {/* Style 2: Polaroid */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 text-center">Polaroid</p>
            <div
              ref={cardRefs.polaroid}
              className="bg-white relative"
              style={{ width: 270, height: 270, boxShadow: "inset 0 0 0 8px white, inset 0 0 0 9px #e5e5e5" }}
            >
              {imageUrl ? (
                <>
                  <div className="h-[65%] p-2 pb-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                  </div>
                  <div className="h-[35%] flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-arabic text-gray-900" dir="rtl">{arabic}</h1>
                    <p className="text-xs text-gray-500">{transliteration} · {english}</p>
                    <div className="absolute bottom-2 flex items-center gap-1">
                      <Image src="/avatars/pomegranate.svg" alt="" width={12} height={12} />
                      <span className="font-pphatton font-bold text-gray-900 text-[10px]">Yalla Flash</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <h1 className="text-4xl font-arabic text-gray-900 mb-2" dir="rtl">{arabic}</h1>
                  <p className="text-sm text-gray-500">{transliteration}</p>
                  <p className="text-sm text-gray-700 font-medium">{english}</p>
                  <div className="absolute bottom-2 flex items-center gap-1">
                    <Image src="/avatars/pomegranate.svg" alt="" width={12} height={12} />
                    <span className="font-pphatton font-bold text-gray-900 text-[10px]">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("polaroid")} disabled={isDownloading === "polaroid"}>
              <DownloadSimple className="w-3 h-3 mr-1" />
              {isDownloading === "polaroid" ? "..." : "Download"}
            </Button>
          </div>

          {/* Style 3: Modern */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 text-center">Modern</p>
            <div
              ref={cardRefs.modern}
              className="relative overflow-hidden"
              style={{ width: 270, height: 270, background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}
            >
              {imageUrl ? (
                <>
                  <div className="absolute top-4 left-4 right-4 bottom-20 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-2xl font-arabic text-white" dir="rtl">{arabic}</h1>
                    <p className="text-xs text-gray-300">{transliteration} · {english}</p>
                    <div className="absolute bottom-3 right-4 flex items-center gap-1">
                      <Image src="/avatars/pomegranate.svg" alt="" width={12} height={12} />
                      <span className="font-pphatton font-bold text-white text-[10px]">Yalla Flash</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-6">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Word of the Day</p>
                  <h1 className="text-4xl font-arabic text-white mb-2" dir="rtl">{arabic}</h1>
                  <p className="text-sm text-gray-400 mb-1">{transliteration}</p>
                  <p className="text-sm text-gray-300 font-medium">{english}</p>
                  <div className="absolute bottom-3 flex items-center gap-1">
                    <Image src="/avatars/pomegranate.svg" alt="" width={12} height={12} />
                    <span className="font-pphatton font-bold text-white text-[10px]">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("modern")} disabled={isDownloading === "modern"}>
              <DownloadSimple className="w-3 h-3 mr-1" />
              {isDownloading === "modern" ? "..." : "Download"}
            </Button>
          </div>

          {/* Style 4: Minimal */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 text-center">Minimal</p>
            <div
              ref={cardRefs.minimal}
              className="bg-[#fafafa] relative overflow-hidden"
              style={{ width: 270, height: 270 }}
            >
              {imageUrl ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="text-center pb-8">
                    <h1 className="text-3xl font-arabic text-gray-900 mb-1" dir="rtl">{arabic}</h1>
                    <p className="text-xs text-gray-400">{transliteration}</p>
                    <p className="text-sm text-gray-600">{english}</p>
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    <Image src="/avatars/pomegranate.svg" alt="" width={12} height={12} />
                    <span className="font-pphatton font-bold text-gray-900 text-[10px]">Yalla Flash</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-px bg-gray-200 mb-6" />
                  <h1 className="text-4xl font-arabic text-gray-900 mb-2" dir="rtl">{arabic}</h1>
                  <p className="text-sm text-gray-400 mb-1">{transliteration}</p>
                  <p className="text-sm text-gray-600">{english}</p>
                  <div className="w-16 h-px bg-gray-200 mt-6" />
                  <div className="absolute bottom-3 flex items-center gap-1">
                    <Image src="/avatars/pomegranate.svg" alt="" width={12} height={12} />
                    <span className="font-pphatton font-bold text-gray-900 text-[10px]">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("minimal")} disabled={isDownloading === "minimal"}>
              <DownloadSimple className="w-3 h-3 mr-1" />
              {isDownloading === "minimal" ? "..." : "Download"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
