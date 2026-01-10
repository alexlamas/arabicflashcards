"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Shuffle, DownloadSimple, Sun, Moon, Circle, Square } from "@phosphor-icons/react";
import html2canvas from "html2canvas";

const EXAMPLE_IMAGE = "https://illustrations.popsy.co/amber/cup-of-tea.svg";

export default function InstagramTemplate() {
  const [arabic, setArabic] = useState("قهوة");
  const [transliteration, setTransliteration] = useState("ahwe");
  const [english, setEnglish] = useState("coffee");
  const [imageUrl, setImageUrl] = useState(EXAMPLE_IMAGE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [caption, setCaption] = useState("");

  // Style controls
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showLogo, setShowLogo] = useState(true);
  const [imageCrop, setImageCrop] = useState<"rounded" | "circle">("rounded");

  const cardRef = useRef<HTMLDivElement>(null);

  const prompt = `${english}, simple illustration, black ink on white background`;

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `yallaflash-${english.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error downloading:", error);
    } finally {
      setIsDownloading(false);
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

  const isDark = theme === "dark";
  const isCircle = imageCrop === "circle";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl p-4 space-y-4">
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

          {/* Style Controls */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="gap-2"
            >
              {isDark ? <Moon className="w-4 h-4" weight="fill" /> : <Sun className="w-4 h-4" weight="fill" />}
              {isDark ? "Dark" : "Light"}
            </Button>

            {/* Crop Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImageCrop(isCircle ? "rounded" : "circle")}
              className="gap-2"
            >
              {isCircle ? <Circle className="w-4 h-4" weight="fill" /> : <Square className="w-4 h-4" weight="fill" />}
              {isCircle ? "Circle" : "Rounded"}
            </Button>

            {/* Logo Toggle */}
            <Button
              variant={showLogo ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLogo(!showLogo)}
              className="gap-2"
            >
              Logo {showLogo ? "On" : "Off"}
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

        {/* Card Preview */}
        <div className="flex flex-col items-center gap-4">
          <div
            ref={cardRef}
            className="relative overflow-hidden"
            style={{
              width: 400,
              height: 400,
              background: isDark
                ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
                : "#fafafa",
            }}
          >
            {imageUrl ? (
              <>
                {/* Image */}
                <div
                  className={`absolute overflow-hidden ${
                    isCircle
                      ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-44 h-44 rounded-full"
                      : "top-6 left-6 right-6 bottom-28 rounded-2xl"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={english} className="w-full h-full object-cover" />
                </div>

                {/* Text */}
                <div
                  className={`absolute left-0 right-0 ${
                    isCircle ? "bottom-8 text-center px-8" : "bottom-0 p-6"
                  } ${!isCircle && isDark ? "bg-gradient-to-t from-black/90 to-transparent" : ""}`}
                >
                  <h1
                    className={`font-arabic mb-1 ${isCircle ? "text-4xl" : "text-4xl"} ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                    dir="rtl"
                  >
                    {arabic}
                  </h1>
                  <p className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {transliteration} · {english}
                  </p>
                </div>

                {/* Logo */}
                {showLogo && (
                  <div className="absolute bottom-5 right-6 flex items-center gap-2">
                    <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                    <span className={`font-pphatton font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Yalla Flash
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* No image state */
              <div className="h-full flex flex-col items-center justify-center px-10">
                <p
                  className={`text-sm uppercase tracking-widest mb-6 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Word of the Day
                </p>
                <h1
                  className={`text-6xl font-arabic mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                  dir="rtl"
                >
                  {arabic}
                </h1>
                <p className={`text-xl mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {transliteration}
                </p>
                <p className={`text-xl font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {english}
                </p>

                {showLogo && (
                  <div className="absolute bottom-6 flex items-center gap-2">
                    <Image src="/avatars/pomegranate.svg" alt="" width={16} height={16} />
                    <span className={`font-pphatton font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Yalla Flash
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full max-w-[400px]"
            onClick={downloadCard}
            disabled={isDownloading}
          >
            <DownloadSimple className="w-4 h-4 mr-2" />
            {isDownloading ? "..." : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}
