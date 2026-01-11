"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { PublicFooter } from "@/app/components/PublicFooter";
import { motion, AnimatePresence } from "framer-motion";
import { SongWithLines } from "@/app/services/songService";

// YouTube Player types
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

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
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface SongPlayerProps {
  song: SongWithLines;
}

export function SongPlayer({ song }: SongPlayerProps) {
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

  // Initialize YouTube Player
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player("youtube-player", {
        videoId: song.youtube_id,
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
  }, [song.youtube_id]);

  // Handle spacebar for play/pause
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (player) {
          if (isPlaying) {
            player.pauseVideo();
          } else {
            player.playVideo();
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, isPlaying]);

  // Sync lyrics with playback
  useEffect(() => {
    if (!player) return;

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        // Skip if user just clicked a line (let the seek complete)
        if (justClickedRef.current) return;

        const time = player.getCurrentTime();

        // Find current lyric line
        let lineIndex = -1;
        for (let i = song.lines.length - 1; i >= 0; i--) {
          if (time >= song.lines[i].start_time) {
            lineIndex = i;
            break;
          }
        }
        setCurrentLineIndex(lineIndex);

        // Calculate progress within current line (finish slightly before next)
        if (lineIndex >= 0) {
          const lineStart = song.lines[lineIndex].start_time;
          const lineEnd = song.lines[lineIndex].end_time || song.lines[lineIndex + 1]?.start_time || lineStart + 10;
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
  }, [isPlaying, player, song.lines]);

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
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      // If before first lyric, skip to it
      const currentTime = player.getCurrentTime();
      const firstLyricTime = song.lines[0]?.start_time || 0;
      if (currentTime < firstLyricTime - 2) {
        player.seekTo(firstLyricTime, true);
      }
      player.playVideo();
    }
  }, [player, isPlaying, song.lines]);

  const handleRestart = useCallback(() => {
    if (!player) return;
    // Restart from first lyric, not from 0
    const firstLyricTime = song.lines[0]?.start_time || 0;
    player.seekTo(firstLyricTime, true);
    player.playVideo();
  }, [player, song.lines]);

  const handleLineClick = useCallback(
    (index: number) => {
      if (!player) return;
      setCurrentLineIndex(index); // Highlight immediately
      justClickedRef.current = true; // Prevent interval from overriding
      player.seekTo(song.lines[index].start_time, true);
      player.playVideo();
      // Allow interval to take over after seek completes
      setTimeout(() => {
        justClickedRef.current = false;
      }, 500);
    },
    [player, song.lines]
  );

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
              {song.lines.map((line, index) => (
                <button
                  key={line.id}
                  ref={(el) => { lyricRefs.current[index] = el; }}
                  onClick={() => handleLineClick(index)}
                  className={`relative w-full text-left p-4 rounded-xl transition-all overflow-hidden border focus:outline-none ${
                    currentLineIndex === index
                      ? "border-emerald-300/40 bg-emerald-50/20"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
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
                        className="text-base bg-clip-text text-transparent w-fit"
                        style={{
                          backgroundImage: `linear-gradient(to right, #0ca270ff ${lineProgress}%, #3741518c ${lineProgress}%)`
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
                        currentLineIndex === index ? "" : "text-body"
                      }`}
                    >
                      {line.english}
                    </p>

                    {/* Word breakdown */}
                    <AnimatePresence>
                      {currentLineIndex === index && line.words && line.words.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gray-900/10">
                            <p className="text-xs text-body/50 font-medium mb-2">
                              Tap a word to learn it
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {line.words.map((word) => (
                                <Button
                                  key={word.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWord(word);
                                  }}
                                  variant="outline"

                                >
                                  <span className="text-lg font-arabic">{word.arabic}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {word.english}
                                  </span>
                                </Button>
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
