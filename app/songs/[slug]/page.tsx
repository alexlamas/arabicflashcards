"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

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
        time: 0,
        arabic: "بحبك يا لبنان",
        transliteration: "bhibbak ya lebnan",
        english: "I love you, Lebanon",
        words: [
          { arabic: "بحبك", transliteration: "bhibbak", english: "I love you" },
          { arabic: "يا", transliteration: "ya", english: "oh (vocative)" },
          { arabic: "لبنان", transliteration: "lebnan", english: "Lebanon" },
        ],
      },
      {
        time: 5,
        arabic: "يا وطني بحبك",
        transliteration: "ya watani bhibbak",
        english: "Oh my homeland, I love you",
        words: [
          { arabic: "يا", transliteration: "ya", english: "oh" },
          { arabic: "وطني", transliteration: "watani", english: "my homeland" },
          { arabic: "بحبك", transliteration: "bhibbak", english: "I love you" },
        ],
      },
      {
        time: 10,
        arabic: "بشمالك بجنوبك",
        transliteration: "bi shmelak bi jnoubak",
        english: "In your north, in your south",
        words: [
          { arabic: "بشمالك", transliteration: "bi shmelak", english: "in your north" },
          { arabic: "بجنوبك", transliteration: "bi jnoubak", english: "in your south" },
        ],
      },
      {
        time: 15,
        arabic: "بسهلك ببقاعك",
        transliteration: "bi sahlak bi b'a'ak",
        english: "In your plain, in your Bekaa",
        words: [
          { arabic: "بسهلك", transliteration: "bi sahlak", english: "in your plain" },
          { arabic: "ببقاعك", transliteration: "bi b'a'ak", english: "in your Bekaa" },
        ],
      },
      // Add more lyrics with real timestamps when you have them
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
  const [selectedWord, setSelectedWord] = useState<{
    arabic: string;
    transliteration: string;
    english: string;
  } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      }, 100);
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

  const handlePlayPause = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [player, isPlaying]);

  const handleRestart = useCallback(() => {
    if (!player) return;
    player.seekTo(0, true);
    player.playVideo();
  }, [player]);

  const handleLineClick = useCallback(
    (index: number) => {
      if (!player || !song) return;
      player.seekTo(song.lyrics[index].time, true);
      player.playVideo();
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

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <p className="text-emerald-600 font-medium mb-1">{song.artist}</p>
            <h1 className="font-pphatton text-3xl sm:text-4xl font-bold text-heading mb-3">
              {song.title}
            </h1>
            <p className="text-body">{song.description}</p>
          </div>
        </div>
      </div>

      {/* YouTube Player */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden">
          <div id="youtube-player" className="w-full h-full" />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
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

      {/* Lyrics */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-pphatton text-2xl font-bold text-heading mb-6">
            Lyrics
          </h2>

          <div className="space-y-2">
            {song.lyrics.map((line, index) => (
              <button
                key={index}
                onClick={() => handleLineClick(index)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  currentLineIndex === index
                    ? "bg-emerald-100 border-2 border-emerald-500 scale-[1.02]"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                  <div className="flex-1">
                    <p
                      className={`text-2xl font-arabic mb-1 ${
                        currentLineIndex === index ? "text-emerald-900" : "text-heading"
                      }`}
                    >
                      {line.arabic}
                    </p>
                    <p
                      className={`text-sm ${
                        currentLineIndex === index ? "text-emerald-700" : "text-body"
                      }`}
                    >
                      {line.transliteration}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p
                      className={`${
                        currentLineIndex === index ? "text-emerald-800" : "text-body"
                      }`}
                    >
                      {line.english}
                    </p>
                  </div>
                </div>

                {/* Word breakdown */}
                {currentLineIndex === index && line.words && (
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <p className="text-xs text-emerald-600 font-medium mb-2">
                      CLICK A WORD TO LEARN IT
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {line.words.map((word, wordIndex) => (
                        <button
                          key={wordIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWord(word);
                          }}
                          className="px-3 py-2 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <span className="text-lg font-arabic">{word.arabic}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {word.english}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

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

      {/* CTA */}
      <div className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-pphatton text-2xl font-bold text-heading mb-4">
            Want to learn all these words?
          </h2>
          <p className="text-body mb-6">
            Add this song&apos;s vocabulary to your flashcards and master them with
            spaced repetition.
          </p>
          <Link href="/">
            <Button
              size="lg"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8"
            >
              Start learning free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>
            Video from YouTube. Translations by Yalla Flash.
          </p>
        </div>
      </footer>
    </div>
  );
}
