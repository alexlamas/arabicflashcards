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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">

          {/* Style 1: Classic */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 text-center">Classic</p>
            <div
              ref={cardRefs.classic}
              className="bg-white relative overflow-hidden"
              style={{ width: 400, height: 400 }}
            >
              <div className="absolute inset-4 border-2 border-gray-100 rounded-3xl" />
              {imageUrl ? (
                <>
                  <div className="h-[52%] p-5 pb-0">
                    <div className="w-full h-full rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="h-[48%] flex flex-col items-center justify-center px-8">
                    <h1 className="text-5xl font-arabic text-gray-900 mb-2" dir="rtl">{arabic}</h1>
                    <p className="text-lg text-gray-400 mb-1">{transliteration}</p>
                    <p className="text-lg text-gray-700 font-medium">{english}</p>
                    <div className="absolute bottom-5 flex items-center gap-2">
                      <Image src="/avatars/pomegranate.svg" alt="" width={18} height={18} />
                      <span className="font-pphatton font-bold text-gray-900 text-sm">Yalla Flash</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-10">
                  <p className="text-sm text-gray-400 uppercase tracking-widest mb-6">Word of the Day</p>
                  <h1 className="text-6xl font-arabic text-gray-900 mb-3" dir="rtl">{arabic}</h1>
                  <p className="text-xl text-gray-400 mb-2">{transliteration}</p>
                  <p className="text-xl text-gray-700 font-medium">{english}</p>
                  <div className="absolute bottom-5 flex items-center gap-2">
                    <Image src="/avatars/pomegranate.svg" alt="" width={18} height={18} />
                    <span className="font-pphatton font-bold text-gray-900 text-sm">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("classic")} disabled={isDownloading === "classic"}>
              <DownloadSimple className="w-4 h-4 mr-2" />
              {isDownloading === "classic" ? "..." : "Download"}
            </Button>
          </div>

          {/* Style 2: Polaroid */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 text-center">Polaroid</p>
            <div
              ref={cardRefs.polaroid}
              className="bg-white relative"
              style={{ width: 400, height: 400, boxShadow: "inset 0 0 0 12px white, inset 0 0 0 13px #e5e5e5" }}
            >
              {imageUrl ? (
                <>
                  <div className="h-[62%] p-3 pb-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                  </div>
                  <div className="h-[38%] flex flex-col items-center justify-center px-6">
                    <h1 className="text-4xl font-arabic text-gray-900 mb-1" dir="rtl">{arabic}</h1>
                    <p className="text-base text-gray-500">{transliteration} · {english}</p>
                    <div className="absolute bottom-4 flex items-center gap-2">
                      <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                      <span className="font-pphatton font-bold text-gray-900 text-sm">Yalla Flash</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-8">
                  <h1 className="text-6xl font-arabic text-gray-900 mb-3" dir="rtl">{arabic}</h1>
                  <p className="text-xl text-gray-500 mb-1">{transliteration}</p>
                  <p className="text-xl text-gray-700 font-medium">{english}</p>
                  <div className="absolute bottom-4 flex items-center gap-2">
                    <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                    <span className="font-pphatton font-bold text-gray-900 text-sm">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("polaroid")} disabled={isDownloading === "polaroid"}>
              <DownloadSimple className="w-4 h-4 mr-2" />
              {isDownloading === "polaroid" ? "..." : "Download"}
            </Button>
          </div>

          {/* Style 3: Modern */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 text-center">Modern</p>
            <div
              ref={cardRefs.modern}
              className="relative overflow-hidden"
              style={{ width: 400, height: 400, background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}
            >
              {imageUrl ? (
                <>
                  <div className="absolute top-6 left-6 right-6 bottom-28 rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <h1 className="text-4xl font-arabic text-white mb-1" dir="rtl">{arabic}</h1>
                    <p className="text-base text-gray-300">{transliteration} · {english}</p>
                    <div className="absolute bottom-5 right-6 flex items-center gap-2">
                      <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                      <span className="font-pphatton font-bold text-white text-sm">Yalla Flash</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-10">
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-6">Word of the Day</p>
                  <h1 className="text-6xl font-arabic text-white mb-3" dir="rtl">{arabic}</h1>
                  <p className="text-xl text-gray-400 mb-2">{transliteration}</p>
                  <p className="text-xl text-gray-300 font-medium">{english}</p>
                  <div className="absolute bottom-5 flex items-center gap-2">
                    <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                    <span className="font-pphatton font-bold text-white text-sm">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("modern")} disabled={isDownloading === "modern"}>
              <DownloadSimple className="w-4 h-4 mr-2" />
              {isDownloading === "modern" ? "..." : "Download"}
            </Button>
          </div>

          {/* Style 4: Minimal */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 text-center">Minimal</p>
            <div
              ref={cardRefs.minimal}
              className="bg-[#fafafa] relative overflow-hidden"
              style={{ width: 400, height: 400 }}
            >
              {imageUrl ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-40 h-40 rounded-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="text-center pb-14">
                    <h1 className="text-5xl font-arabic text-gray-900 mb-2" dir="rtl">{arabic}</h1>
                    <p className="text-base text-gray-400 mb-1">{transliteration}</p>
                    <p className="text-lg text-gray-600">{english}</p>
                  </div>
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                    <span className="font-pphatton font-bold text-gray-900 text-sm">Yalla Flash</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-px bg-gray-300 mb-8" />
                  <h1 className="text-6xl font-arabic text-gray-900 mb-3" dir="rtl">{arabic}</h1>
                  <p className="text-xl text-gray-400 mb-2">{transliteration}</p>
                  <p className="text-xl text-gray-600">{english}</p>
                  <div className="w-20 h-px bg-gray-300 mt-8" />
                  <div className="absolute bottom-5 flex items-center gap-2">
                    <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                    <span className="font-pphatton font-bold text-gray-900 text-sm">Yalla Flash</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => downloadCard("minimal")} disabled={isDownloading === "minimal"}>
              <DownloadSimple className="w-4 h-4 mr-2" />
              {isDownloading === "minimal" ? "..." : "Download"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
