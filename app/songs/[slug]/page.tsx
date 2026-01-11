"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { PublicFooter } from "@/app/components/PublicFooter";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface LyricLine {
  time: number;
  arabic: string;
  transliteration: string;
  english: string;
  words?: {
    arabic: string;
    transliteration: string;
    english: string;
  }[];
}

interface Song {
  slug: string;
  title: string;
  artist: string;
  youtubeId: string;
  description: string;
  lyrics: LyricLine[];
}

// Sample song data - Fairuz "Bhibbak Ya Lebnan"
const SONGS: Record<string, Song> = {
  "bhibbak-ya-lebnan": {
    slug: "bhibbak-ya-lebnan",
    title: "Bahebak Ya Lebnan",
    artist: "Fairuz",
    youtubeId: "Q5U5eWfsIO4",
    description: "One of Fairuz's most beloved songs, expressing love for Lebanon. Perfect for learning emotional vocabulary and patriotic expressions in Lebanese Arabic.",
    lyrics: [
      {
        time: 87,
        arabic: "بحبك يا لبنان يا وطني بحبك",
        transliteration: "b7ebbak ya lebnen ya watane b7ebbak",
        english: "I love you Lebanon, my homeland I love you",
        words: [
          { arabic: "بحبك", transliteration: "b7ebbak", english: "I love you" },
          { arabic: "يا", transliteration: "ya", english: "oh (vocative)" },
          { arabic: "لبنان", transliteration: "lebnen", english: "Lebanon" },
          { arabic: "وطني", transliteration: "watane", english: "my homeland" },
        ],
      },
      {
        time: 91,
        arabic: "بشمالك، بجنوبك، بسهلك بحبك",
        transliteration: "b shmelak, b jnoubak, b sahlak b7ebbak",
        english: "In your north, your south, your plains I love you",
        words: [
          { arabic: "بشمالك", transliteration: "b shmelak", english: "in your north" },
          { arabic: "بجنوبك", transliteration: "b jnoubak", english: "in your south" },
          { arabic: "بسهلك", transliteration: "b sahlak", english: "in your plains" },
        ],
      },
      {
        time: 98,
        arabic: "بحبك يا لبنان يا وطني بحبك",
        transliteration: "b7ebbak ya lebnen ya watane b7ebbak",
        english: "I love you Lebanon, my homeland I love you",
        words: [
          { arabic: "بحبك", transliteration: "b7ebbak", english: "I love you" },
          { arabic: "يا", transliteration: "ya", english: "oh (vocative)" },
          { arabic: "لبنان", transliteration: "lebnen", english: "Lebanon" },
          { arabic: "وطني", transliteration: "watane", english: "my homeland" },
        ],
      },
      {
        time: 103,
        arabic: "بشمالك، بجنوبك، بسهلك بحبك",
        transliteration: "b shmelak, b jnoubak, b sahlak b7ebbak",
        english: "In your north, your south, your plains I love you",
        words: [
          { arabic: "بشمالك", transliteration: "b shmelak", english: "in your north" },
          { arabic: "بجنوبك", transliteration: "b jnoubak", english: "in your south" },
          { arabic: "بسهلك", transliteration: "b sahlak", english: "in your plains" },
        ],
      },
      {
        time: 108,
        arabic: "تسأل شو بني وشو اللي ما بني",
        transliteration: "tes2al shu fiye w shu lli ma fiye",
        english: "You ask what's wrong with me and what isn't",
        words: [
          { arabic: "تسأل", transliteration: "tes2al", english: "you ask" },
          { arabic: "شو", transliteration: "shu", english: "what" },
          { arabic: "فيي", transliteration: "fiye", english: "in me / with me" },
          { arabic: "ما", transliteration: "ma", english: "not" },
        ],
      },
      {
        time: 113,
        arabic: "بحبك يا لبنان يا وطني",
        transliteration: "b7ebbak ya lebnen ya watane",
        english: "I love you Lebanon, my homeland",
        words: [
          { arabic: "بحبك", transliteration: "b7ebbak", english: "I love you" },
          { arabic: "يا", transliteration: "ya", english: "oh (vocative)" },
          { arabic: "لبنان", transliteration: "lebnen", english: "Lebanon" },
          { arabic: "وطني", transliteration: "watane", english: "my homeland" },
        ],
      },
      {
        time: 118,
        arabic: "بحبك يا لبنان يا وطني بحبك",
        transliteration: "b7ebbak ya lebnen ya watane b7ebbak",
        english: "I love you Lebanon, my homeland I love you",
        words: [
          { arabic: "بحبك", transliteration: "b7ebbak", english: "I love you" },
          { arabic: "يا", transliteration: "ya", english: "oh (vocative)" },
          { arabic: "لبنان", transliteration: "lebnen", english: "Lebanon" },
          { arabic: "وطني", transliteration: "watane", english: "my homeland" },
        ],
      },
      {
        time: 123,
        arabic: "بشمالك، بجنوبك، بسهلك بحبك",
        transliteration: "b shmelak, b jnoubak, b sahlak b7ebbak",
        english: "In your north, your south, your plains I love you",
        words: [
          { arabic: "بشمالك", transliteration: "b shmelak", english: "in your north" },
          { arabic: "بجنوبك", transliteration: "b jnoubak", english: "in your south" },
          { arabic: "بسهلك", transliteration: "b sahlak", english: "in your plains" },
        ],
      },
      {
        time: 128,
        arabic: "تسأل شو بني وشو اللي ما بني",
        transliteration: "tes2al shu fiye w shu lli ma fiye",
        english: "You ask what's wrong with me and what isn't",
        words: [
          { arabic: "تسأل", transliteration: "tes2al", english: "you ask" },
          { arabic: "شو", transliteration: "shu", english: "what" },
          { arabic: "فيي", transliteration: "fiye", english: "in me / with me" },
          { arabic: "ما", transliteration: "ma", english: "not" },
        ],
      },
      {
        time: 134,
        arabic: "بحبك يا لبنان يا وطني",
        transliteration: "b7ebbak ya lebnen ya watane",
        english: "I love you Lebanon, my homeland",
        words: [
          { arabic: "بحبك", transliteration: "b7ebbak", english: "I love you" },
          { arabic: "يا", transliteration: "ya", english: "oh (vocative)" },
          { arabic: "لبنان", transliteration: "lebnen", english: "Lebanon" },
          { arabic: "وطني", transliteration: "watane", english: "my homeland" },
        ],
      },
      {
        time: 148,
        arabic: "عندك بدي إبقى ويغيبوا الغياب",
        transliteration: "3endak badde eb2a w ygheebu l ghiyeb",
        english: "With you I want to stay, let the absent be gone",
        words: [
          { arabic: "عندك", transliteration: "3endak", english: "with you" },
          { arabic: "بدي", transliteration: "badde", english: "I want" },
          { arabic: "إبقى", transliteration: "eb2a", english: "to stay" },
          { arabic: "يغيبوا", transliteration: "ygheebu", english: "let them be absent" },
          { arabic: "الغياب", transliteration: "l ghiyeb", english: "the absence" },
        ],
      },
      {
        time: 154,
        arabic: "إتعذب و إشقى ويا محلا العذاب",
        transliteration: "et3azzab w esh2a w ya ma7la l 3azeb",
        english: "I'll suffer and toil, and how sweet is the suffering",
        words: [
          { arabic: "إتعذب", transliteration: "et3azzab", english: "I suffer" },
          { arabic: "إشقى", transliteration: "esh2a", english: "I toil" },
          { arabic: "محلا", transliteration: "ma7la", english: "how sweet" },
          { arabic: "العذاب", transliteration: "l 3azeb", english: "the suffering" },
        ],
      },
      {
        time: 160,
        arabic: "عندك بدي إبقى ويغيبوا الغياب",
        transliteration: "3endak badde eb2a w ygheebu l ghiyeb",
        english: "With you I want to stay, let the absent be gone",
        words: [
          { arabic: "عندك", transliteration: "3endak", english: "with you" },
          { arabic: "بدي", transliteration: "badde", english: "I want" },
          { arabic: "إبقى", transliteration: "eb2a", english: "to stay" },
          { arabic: "يغيبوا", transliteration: "ygheebu", english: "let them be absent" },
          { arabic: "الغياب", transliteration: "l ghiyeb", english: "the absence" },
        ],
      },
      {
        time: 164,
        arabic: "إتعذب و إشقى ويا محلا العذاب",
        transliteration: "et3azzab w esh2a w ya ma7la l 3azeb",
        english: "I'll suffer and toil, and how sweet is the suffering",
        words: [
          { arabic: "إتعذب", transliteration: "et3azzab", english: "I suffer" },
          { arabic: "إشقى", transliteration: "esh2a", english: "I toil" },
          { arabic: "محلا", transliteration: "ma7la", english: "how sweet" },
          { arabic: "العذاب", transliteration: "l 3azeb", english: "the suffering" },
        ],
      },
      {
        time: 170,
        arabic: "وإذا أنت بتتركني يا أغلى الأحباب",
        transliteration: "w iza enta btetrukne ya aghla l a7beb",
        english: "And if you leave me, oh dearest of loved ones",
        words: [
          { arabic: "إذا", transliteration: "iza", english: "if" },
          { arabic: "أنت", transliteration: "enta", english: "you" },
          { arabic: "بتتركني", transliteration: "btetrukne", english: "you leave me" },
          { arabic: "أغلى", transliteration: "aghla", english: "dearest" },
          { arabic: "الأحباب", transliteration: "l a7beb", english: "loved ones" },
        ],
      },
      {
        time: 174,
        arabic: "الدنيي بترجع كذبة وتاج الأرض تراب",
        transliteration: "l denye bterje3 kizbeh w tej l ard trab",
        english: "The world becomes a lie, and earth's crown turns to dust",
        words: [
          { arabic: "الدنيي", transliteration: "l denye", english: "the world" },
          { arabic: "بترجع", transliteration: "bterje3", english: "becomes/returns" },
          { arabic: "كذبة", transliteration: "kizbeh", english: "a lie" },
          { arabic: "تاج", transliteration: "tej", english: "crown" },
          { arabic: "الأرض", transliteration: "l ard", english: "the earth" },
          { arabic: "تراب", transliteration: "trab", english: "dust" },
        ],
      },
      {
        time: 182,
        arabic: "وإذا أنت بتتركني يا أغلى الأحباب",
        transliteration: "w iza enta btetrukne ya aghla l a7beb",
        english: "And if you leave me, oh dearest of loved ones",
        words: [
          { arabic: "إذا", transliteration: "iza", english: "if" },
          { arabic: "أنت", transliteration: "enta", english: "you" },
          { arabic: "بتتركني", transliteration: "btetrukne", english: "you leave me" },
          { arabic: "أغلى", transliteration: "aghla", english: "dearest" },
          { arabic: "الأحباب", transliteration: "l a7beb", english: "loved ones" },
        ],
      },
    ],
  },
};

// YouTube Player types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export default function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [lineProgress, setLineProgress] = useState(0);
  const [selectedWord, setSelectedWord] = useState<{
    arabic: string;
    transliteration: string;
    english: string;
  } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const justClickedRef = useRef(false);
  const lyricRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const [showTopFade, setShowTopFade] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const song = slug ? SONGS[slug] : null;

  // Initialize YouTube Player
  useEffect(() => {
    if (!song) return;

    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player("youtube-player", {
        videoId: song.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    // If API is already loaded
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [song]);

  // Sync lyrics with playback
  useEffect(() => {
    if (!player || !song) return;

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        // Skip if user just clicked a line (let the seek complete)
        if (justClickedRef.current) return;

        const time = player.getCurrentTime();

        // Find current lyric line
        let lineIndex = -1;
        for (let i = song.lyrics.length - 1; i >= 0; i--) {
          if (time >= song.lyrics[i].time) {
            lineIndex = i;
            break;
          }
        }
        setCurrentLineIndex(lineIndex);

        // Calculate progress within current line (finish slightly before next)
        if (lineIndex >= 0) {
          const lineStart = song.lyrics[lineIndex].time;
          const lineEnd = song.lyrics[lineIndex + 1]?.time || lineStart + 10;
          const duration = (lineEnd - lineStart) * 0.9; // Finish at 90% of interval
          const elapsed = time - lineStart;
          setLineProgress(Math.min(100, (elapsed / duration) * 100));
        } else {
          setLineProgress(0);
        }
      }, 50);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, player, song]);

  // Auto-scroll to current lyric (keep it centered)
  useEffect(() => {
    if (currentLineIndex >= 0 && lyricRefs.current[currentLineIndex]) {
      lyricRefs.current[currentLineIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex]);

  const handlePlayPause = useCallback(() => {
    if (!player || !song) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      // If before first lyric, skip to it
      const currentTime = player.getCurrentTime();
      const firstLyricTime = song.lyrics[0]?.time || 0;
      if (currentTime < firstLyricTime - 2) {
        player.seekTo(firstLyricTime, true);
      }
      player.playVideo();
    }
  }, [player, isPlaying, song]);

  const handleRestart = useCallback(() => {
    if (!player || !song) return;
    // Restart from first lyric, not from 0
    const firstLyricTime = song.lyrics[0]?.time || 0;
    player.seekTo(firstLyricTime, true);
    player.playVideo();
  }, [player, song]);

  const handleLineClick = useCallback(
    (index: number) => {
      if (!player || !song) return;
      setCurrentLineIndex(index); // Highlight immediately
      justClickedRef.current = true; // Prevent interval from overriding
      player.seekTo(song.lyrics[index].time, true);
      player.playVideo();
      // Allow interval to take over after seek completes
      setTimeout(() => {
        justClickedRef.current = false;
      }, 500);
    },
    [player, song]
  );

  if (!slug) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Song not found</h1>
          <Link href="/songs" className="text-emerald-600 hover:underline">
            Browse all songs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="h-12 flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 pr-1.5 gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/avatars/pomegranate.svg"
              alt="Yalla Flash"
              width={28}
              height={28}
            />
            <span className="font-pphatton font-bold text-lg text-heading">
              Yalla<span className="hidden sm:inline"> Flash</span>
            </span>
          </Link>

          <div className="flex-1" />

          <Link href="/songs" className="text-sm text-gray-600 hover:text-gray-900 mr-2">
            All songs
          </Link>
          <Link href="/">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 text-sm font-medium">
              Start learning
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content - Fixed height layout */}
      <div className="max-w-7xl mx-auto px-4 pt-24 h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="pb-4">
          <p className="text-emerald-600 font-medium mb-1">{song.artist}</p>
          <h1 className="font-pphatton text-2xl sm:text-3xl font-bold text-heading">
            {song.title}
          </h1>
        </div>

        {/* Content - Side by Side */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
          {/* Left Side - Video */}
          <div className="lg:w-1/2 flex-shrink-0">
            <div className="space-y-4">
              {/* YouTube Player */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <div id="youtube-player" className="w-full h-full" />
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={handleRestart}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" /> Play
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>

          {/* Right Side - Lyrics (Scrollable) */}
          <div className="lg:w-1/2 flex flex-col min-h-0 relative">
            {/* Fade gradient at top - only visible when scrolled */}
            {showTopFade && (
              <div className="absolute top-0 left-0 right-4 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            )}
            {/* Fade gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-4 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            <div
              ref={lyricsContainerRef}
              onScroll={(e) => setShowTopFade(e.currentTarget.scrollTop > 10)}
              className="overflow-y-auto flex-1 space-y-2 pr-4"
            >
              {song.lyrics.map((line, index) => (
                <button
                  key={index}
                  ref={(el) => { lyricRefs.current[index] = el; }}
                  onClick={() => handleLineClick(index)}
                  className={`relative w-full text-left p-4 rounded-xl transition-all overflow-hidden border ${
                    currentLineIndex === index
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  {/* Progress circle */}
                  {currentLineIndex === index && (
                    <div
                      className="absolute bottom-0 left-0 bg-emerald-200/20 rounded-full blur-xl transition-all duration-100"
                      style={{
                        width: `${lineProgress * 2.5}%`,
                        aspectRatio: '1',
                        transform: `translateX(-50%) translateY(50%)`
                      }}
                    />
                  )}
                  <div className="relative space-y-1">
                    <p
                      className={`text-2xl font-arabic ${
                        currentLineIndex === index ? "text-emerald-900" : "text-heading"
                      }`}
                    >
                      {line.arabic}
                    </p>
                    {currentLineIndex === index ? (
                      <p
                        className="text-sm bg-clip-text text-transparent w-fit"
                        style={{
                          backgroundImage: `linear-gradient(to right, #10b981 ${lineProgress}%, #374151 ${lineProgress}%)`
                        }}
                      >
                        {line.transliteration}
                      </p>
                    ) : (
                      <p className="text-sm text-subtle">
                        {line.transliteration}
                      </p>
                    )}
                    <p
                      className={`${
                        currentLineIndex === index ? "text-emerald-800" : "text-body"
                      }`}
                    >
                      {line.english}
                    </p>

                    {/* Word breakdown */}
                    <AnimatePresence>
                      {currentLineIndex === index && line.words && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-emerald-200">
                            <p className="text-xs text-emerald-600 font-medium mb-2">
                              TAP A WORD TO LEARN IT
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {line.words.map((word, wordIndex) => (
                                <button
                                  key={wordIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWord(word);
                                  }}
                                  className="px-3 py-2 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
                                >
                                  <span className="text-lg font-arabic">{word.arabic}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {word.english}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              ))}

              {/* CTA */}
              <div className="p-6 bg-gray-50 rounded-xl text-center mt-4">
                <p className="text-body mb-3">
                  Want to learn all these words with flashcards?
                </p>
                <Link href="/">
                  <Button className="rounded-full bg-gray-900 hover:bg-gray-800 px-6">
                    Start learning free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      {/* Word Detail Modal */}
      {selectedWord && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWord(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-4xl font-arabic text-center mb-2">
              {selectedWord.arabic}
            </p>
            <p className="text-center text-gray-600 mb-1">
              {selectedWord.transliteration}
            </p>
            <p className="text-center text-lg font-medium mb-6">
              {selectedWord.english}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setSelectedWord(null)}
              >
                Close
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700">
                  Learn this word
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
