"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Shuffle, DownloadSimple, Circle, Square, MusicNotes, TextAa } from "@phosphor-icons/react";
import html2canvas from "html2canvas";

const EXAMPLE_IMAGE = "/instagram-example.webp";

type ThemeStyle = "auto" | "dark" | "light";
type PostMode = "word" | "lyric";

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface SongLine {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  line_order: number;
}

// Extract dominant colors from an image using canvas
function extractColors(imageUrl: string): Promise<{ primary: string; secondary: string }> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ primary: "#1a1a1a", secondary: "#2d2d2d" });
        return;
      }

      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      const colors: { r: number; g: number; b: number; count: number }[] = [];

      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        const brightness = (r + g + b) / 3;
        if (brightness < 30 || brightness > 225) continue;

        const existing = colors.find(
          (c) => Math.abs(c.r - r) < 30 && Math.abs(c.g - g) < 30 && Math.abs(c.b - b) < 30
        );
        if (existing) {
          existing.count++;
        } else {
          colors.push({ r, g, b, count: 1 });
        }
      }

      colors.sort((a, b) => b.count - a.count);

      const darken = (c: { r: number; g: number; b: number }, amount: number) => ({
        r: Math.max(0, Math.floor(c.r * amount)),
        g: Math.max(0, Math.floor(c.g * amount)),
        b: Math.max(0, Math.floor(c.b * amount)),
      });

      const primary = colors[0] ? darken(colors[0], 0.3) : { r: 26, g: 26, b: 26 };
      const secondary = colors[1] ? darken(colors[1], 0.4) : { r: 45, g: 45, b: 45 };

      resolve({
        primary: `rgb(${primary.r}, ${primary.g}, ${primary.b})`,
        secondary: `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`,
      });
    };
    img.onerror = () => {
      resolve({ primary: "#1a1a1a", secondary: "#2d2d2d" });
    };
    img.src = imageUrl;
  });
}

const THEMES: Record<ThemeStyle, { bg: string; text: string; subtext: string; label: string }> = {
  auto: {
    bg: "auto",
    text: "text-white",
    subtext: "text-white/70",
    label: "Auto",
  },
  dark: {
    bg: "#1a1a1a",
    text: "text-white",
    subtext: "text-gray-400",
    label: "Dark",
  },
  light: {
    bg: "#fafafa",
    text: "text-gray-900",
    subtext: "text-gray-500",
    label: "Light",
  },
};

export function InstagramTab() {
  // Mode toggle
  const [mode, setMode] = useState<PostMode>("word");

  // Word mode state
  const [arabic, setArabic] = useState("قهوة");
  const [transliteration, setTransliteration] = useState("ahwe");
  const [english, setEnglish] = useState("coffee");
  const [customWord, setCustomWord] = useState("");

  // Lyric mode state
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string>("");
  const [songLines, setSongLines] = useState<SongLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<SongLine | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Shared state
  const [imageUrl, setImageUrl] = useState(EXAMPLE_IMAGE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [caption, setCaption] = useState("");
  const [captionContext, setCaptionContext] = useState("");

  const [theme, setTheme] = useState<ThemeStyle>("auto");
  const [showLogo, setShowLogo] = useState(true);
  const [imageCrop, setImageCrop] = useState<"rounded" | "circle">("rounded");
  const [extractedColors, setExtractedColors] = useState<{ primary: string; secondary: string }>({
    primary: "#1a1a1a",
    secondary: "#2d2d2d",
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Load songs on mount
  useEffect(() => {
    async function loadSongs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("songs")
        .select("id, title, artist")
        .order("title");
      if (data) setSongs(data);
    }
    loadSongs();
  }, []);

  // Load song lines when song is selected
  useEffect(() => {
    async function loadLines() {
      if (!selectedSongId) {
        setSongLines([]);
        setSelectedLine(null);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("song_lines")
        .select("id, arabic, transliteration, english, line_order")
        .eq("song_id", selectedSongId)
        .order("line_order");
      if (data) setSongLines(data);

      const song = songs.find(s => s.id === selectedSongId);
      setSelectedSong(song || null);
    }
    loadLines();
  }, [selectedSongId, songs]);

  const currentTheme = THEMES[theme];
  const isAuto = theme === "auto";
  const isCircle = imageCrop === "circle";

  const updateExtractedColors = useCallback(async (url: string) => {
    if (url) {
      const colors = await extractColors(url);
      setExtractedColors(colors);
    }
  }, []);

  useEffect(() => {
    if (imageUrl) {
      updateExtractedColors(imageUrl);
    }
  }, [imageUrl, updateExtractedColors]);

  const backgroundStyle = isAuto ? extractedColors.primary : currentTheme.bg;

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

  const translateWord = async () => {
    if (!customWord.trim()) return;
    setIsTranslating(true);
    try {
      const response = await fetch("/api/words/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: customWord.trim() }),
      });
      const data = await response.json();
      if (data.arabic) {
        setArabic(data.arabic);
        setEnglish(data.english);
        setTransliteration(data.transliteration || "");
        setImageUrl("");
        setCaption("");
        setCustomWord("");
      }
    } catch (error) {
      console.error("Error translating word:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const generate = async () => {
    setIsGenerating(true);
    setCaption("");
    setImageUrl("");

    const currentArabic = mode === "lyric" && selectedLine ? selectedLine.arabic : arabic;
    const currentTranslit = mode === "lyric" && selectedLine ? selectedLine.transliteration : transliteration;
    const currentEnglish = mode === "lyric" && selectedLine ? selectedLine.english : english;
    const imagePrompt = mode === "lyric"
      ? `${currentEnglish}, atmospheric moody background, cinematic lighting, abstract`
      : `${currentEnglish}, simple illustration, black ink on white background`;

    try {
      const [imageResponse, captionResponse] = await Promise.all([
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePrompt }),
        }),
        fetch("/api/generate-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            arabic: currentArabic,
            transliteration: currentTranslit,
            english: currentEnglish,
            context: mode === "lyric" && selectedSong
              ? `This is a lyric from "${selectedSong.title}" by ${selectedSong.artist}. ${captionContext}`
              : captionContext
          }),
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

  // Get current display values based on mode
  const displayArabic = mode === "lyric" && selectedLine ? selectedLine.arabic : arabic;
  const displayTranslit = mode === "lyric" && selectedLine ? selectedLine.transliteration : transliteration;
  const displayEnglish = mode === "lyric" && selectedLine ? selectedLine.english : english;

  const cycleTheme = () => {
    const themes: ThemeStyle[] = ["auto", "dark", "light"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col lg:flex-row lg:gap-8 lg:items-start gap-6">
      {/* Controls */}
      <div className="bg-white rounded-xl p-4 space-y-4 border lg:flex-1 lg:max-w-md">
        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setMode("word")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "word" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <TextAa className="w-4 h-4" />
            Word
          </button>
          <button
            onClick={() => setMode("lyric")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "lyric" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MusicNotes className="w-4 h-4" />
            Lyric
          </button>
        </div>

        {mode === "word" ? (
          <>
            {/* Word Mode Controls */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && translateWord()}
                placeholder="Type any word in English..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                disabled={isTranslating}
              />
              <Button
                variant="outline"
                onClick={translateWord}
                disabled={isTranslating || !customWord.trim()}
              >
                {isTranslating ? "..." : "Translate"}
              </Button>
            </div>

            <div className="text-center py-4 border rounded-lg bg-gray-50">
              <p className="text-3xl font-arabic mb-1" dir="rtl">{arabic}</p>
              <p className="text-gray-500">{transliteration}</p>
              <p className="text-gray-700 font-medium">{english}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={shuffleWord}
                disabled={isShuffling || isGenerating || isTranslating}
                className="flex-1"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                {isShuffling ? "..." : "Shuffle"}
              </Button>
              <Button
                onClick={generate}
                disabled={isGenerating || isShuffling || isTranslating}
                className="flex-1"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Lyric Mode Controls */}
            <div className="space-y-3">
              <select
                value={selectedSongId}
                onChange={(e) => {
                  setSelectedSongId(e.target.value);
                  setSelectedLine(null);
                  setImageUrl("");
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Select a song...</option>
                {songs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.title} - {song.artist}
                  </option>
                ))}
              </select>

              {songLines.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                  {songLines.map((line) => (
                    <button
                      key={line.id}
                      onClick={() => setSelectedLine(line)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                        selectedLine?.id === line.id ? "bg-emerald-50 border-l-2 border-emerald-500" : ""
                      }`}
                    >
                      <p className="font-arabic text-sm" dir="rtl">{line.arabic}</p>
                      <p className="text-xs text-gray-500 truncate">{line.english}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedLine && (
              <div className="text-center py-4 border rounded-lg bg-gray-50">
                <p className="text-2xl font-arabic mb-1" dir="rtl">{selectedLine.arabic}</p>
                <p className="text-gray-500 text-sm">{selectedLine.transliteration}</p>
                <p className="text-gray-700">{selectedLine.english}</p>
                {selectedSong && (
                  <p className="text-xs text-gray-400 mt-2">— {selectedSong.title}, {selectedSong.artist}</p>
                )}
              </div>
            )}

            <Button
              onClick={generate}
              disabled={isGenerating || !selectedLine}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate background"}
            </Button>
          </>
        )}

        {/* Style Controls */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            className="gap-2"
          >
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{
                background: isAuto ? extractedColors.primary : currentTheme.bg
              }}
            />
            {currentTheme.label}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImageCrop(isCircle ? "rounded" : "circle")}
            className="gap-2"
          >
            {isCircle ? <Circle className="w-4 h-4" weight="fill" /> : <Square className="w-4 h-4" weight="fill" />}
            {isCircle ? "Circle" : "Rounded"}
          </Button>

          <Button
            variant={showLogo ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLogo(!showLogo)}
            className="gap-2"
          >
            Logo {showLogo ? "On" : "Off"}
          </Button>
        </div>

        {/* Caption context */}
        <div className="pt-2 border-t">
          <input
            type="text"
            value={captionContext}
            onChange={(e) => setCaptionContext(e.target.value)}
            placeholder="Caption context (e.g. 'make it funny', 'mention coffee culture')"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
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
      <div className="flex flex-col items-center gap-4 lg:flex-1">
        <div
          ref={cardRef}
          className="relative overflow-hidden w-full max-w-[400px] aspect-[4/5]"
          style={{ background: backgroundStyle }}
        >
          {mode === "lyric" && imageUrl ? (
            /* Lyric mode with background image */
            <>
              {/* Full bleed background image */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              </div>

              {/* Lyric content */}
              <div className="absolute inset-0 flex flex-col justify-end p-[8%]">
                <div className="text-center mb-4">
                  <h1
                    className="font-arabic text-[clamp(1.5rem,7vw,2rem)] text-white mb-2 leading-relaxed"
                    dir="rtl"
                  >
                    {displayArabic}
                  </h1>
                  <p className="text-[clamp(0.875rem,3.5vw,1rem)] text-white/80 mb-1">
                    {displayTranslit}
                  </p>
                  <p className="text-[clamp(0.875rem,3.5vw,1rem)] text-white/90 font-medium">
                    {displayEnglish}
                  </p>
                </div>

                {selectedSong && (
                  <p className="text-[clamp(0.65rem,2.5vw,0.75rem)] text-white/60 text-center mb-4">
                    — {selectedSong.title}, {selectedSong.artist}
                  </p>
                )}

                {showLogo && (
                  <div className="flex items-center justify-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/avatars/pomegranate.svg" alt="" className="w-4 h-4" />
                    <span className="font-pphatton font-bold leading-none text-[clamp(0.7rem,3vw,0.875rem)] text-white">
                      Yalla Flash
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : imageUrl ? (
            /* Word mode with image */
            <>
              <div
                className={`absolute overflow-hidden ${
                  isCircle
                    ? "top-[12%] left-[27.5%] w-[45%] aspect-square rounded-full"
                    : "top-[6%] left-[6%] right-[6%] bottom-[28%] rounded-2xl"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={displayEnglish} className="w-full h-full object-cover" />
              </div>

              {isCircle ? (
                <>
                  <div
                    className="absolute left-0 right-0 text-center px-[8%] bottom-[16%]"
                  >
                    <h1
                      className={`font-arabic mb-1 text-[clamp(1.5rem,8vw,2.25rem)] ${currentTheme.text}`}
                      dir="rtl"
                    >
                      {displayArabic}
                    </h1>
                    <p className={`text-[clamp(0.75rem,3.5vw,1rem)] ${currentTheme.subtext}`}>
                      {displayTranslit} · {displayEnglish}
                    </p>
                  </div>
                  {showLogo && (
                    <div className="absolute bottom-[5%] left-0 right-0 flex items-center justify-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/avatars/pomegranate.svg" alt="" className="w-4 h-4" />
                      <span className={`font-pphatton font-bold leading-none text-[clamp(0.7rem,3vw,0.875rem)] ${currentTheme.text}`}>
                        Yalla Flash
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute bottom-0 left-0 right-0 p-[6%] flex items-end justify-between">
                  {showLogo ? (
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/avatars/pomegranate.svg" alt="" className="w-4 h-4" />
                      <span className={`font-pphatton font-bold leading-none text-[clamp(0.7rem,3vw,0.875rem)] ${currentTheme.text}`}>
                        Yalla Flash
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}
                  <div className="text-right">
                    <h1
                      className={`font-arabic text-[clamp(2rem,10vw,3rem)] ${currentTheme.text} mb-1`}
                      dir="rtl"
                    >
                      {displayArabic}
                    </h1>
                    <p className={`text-[clamp(0.75rem,3.5vw,1rem)] ${currentTheme.subtext}`}>
                      {displayTranslit} · {displayEnglish}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : mode === "lyric" && selectedLine ? (
            /* Lyric mode without image */
            <div className="h-full flex flex-col items-center justify-center px-[8%]">
              <h1
                className={`text-[clamp(1.5rem,7vw,2rem)] font-arabic mb-[4%] text-center leading-relaxed ${currentTheme.text}`}
                dir="rtl"
              >
                {displayArabic}
              </h1>
              <p className={`text-[clamp(0.875rem,3.5vw,1rem)] mb-2 ${currentTheme.subtext}`}>
                {displayTranslit}
              </p>
              <p className={`text-[clamp(0.875rem,3.5vw,1rem)] font-medium mb-4 ${currentTheme.subtext}`}>
                {displayEnglish}
              </p>

              {selectedSong && (
                <p className={`text-[clamp(0.65rem,2.5vw,0.75rem)] ${currentTheme.subtext} opacity-60 mb-6`}>
                  — {selectedSong.title}, {selectedSong.artist}
                </p>
              )}

              {showLogo && (
                <div className="absolute bottom-[6%] left-0 right-0 flex items-center justify-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/avatars/pomegranate.svg" alt="" className="w-4 h-4" />
                  <span className={`font-pphatton font-bold leading-none text-[clamp(0.7rem,3vw,0.875rem)] ${currentTheme.text}`}>
                    Yalla Flash
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Word mode without image */
            <div className="h-full flex flex-col items-center justify-center px-[10%]">
              <p
                className={`text-[clamp(0.7rem,3vw,0.875rem)] uppercase tracking-widest mb-[6%] ${currentTheme.subtext}`}
              >
                Word of the Day
              </p>
              <h1
                className={`text-[clamp(2.5rem,12vw,3.75rem)] font-arabic mb-[3%] ${currentTheme.text}`}
                dir="rtl"
              >
                {displayArabic}
              </h1>
              <p className={`text-[clamp(1rem,4vw,1.25rem)] mb-2 ${currentTheme.subtext}`}>
                {displayTranslit}
              </p>
              <p className={`text-[clamp(1rem,4vw,1.25rem)] font-medium ${currentTheme.subtext}`}>
                {displayEnglish}
              </p>

              {showLogo && (
                <div className="absolute bottom-[6%] left-0 right-0 flex items-center justify-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/avatars/pomegranate.svg" alt="" className="w-4 h-4" />
                  <span className={`font-pphatton font-bold leading-none text-[clamp(0.7rem,3vw,0.875rem)] ${currentTheme.text}`}>
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
  );
}
