import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { PublicFooter } from "../components/PublicFooter";

export const metadata: Metadata = {
  title: "Learn Lebanese Arabic Through Songs | Yalla Flash",
  description:
    "Learn Lebanese Arabic by singing along to popular songs. Interactive lyrics with translations, word-by-word breakdowns, and flashcard integration.",
  openGraph: {
    title: "Learn Lebanese Arabic Through Songs",
    description:
      "Learn Lebanese Arabic by singing along to popular songs. Interactive lyrics with translations and word-by-word breakdowns.",
    url: "https://yallaflash.com/songs",
    siteName: "Yalla Flash",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Learn Lebanese Arabic Through Songs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Lebanese Arabic Through Songs",
    description:
      "Learn Lebanese Arabic by singing along to popular songs with interactive lyrics.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://yallaflash.com/songs",
  },
};

interface Song {
  slug: string;
  title: string;
  artist: string;
  thumbnail: string;
  wordCount: number;
  level: "beginner" | "intermediate" | "advanced";
}

// This would eventually come from a database
const SONGS: Song[] = [
  {
    slug: "bhibbak-ya-lebnan",
    title: "Bahebak Ya Lebnan",
    artist: "Fairuz",
    thumbnail: "https://img.youtube.com/vi/Q5U5eWfsIO4/maxresdefault.jpg",
    wordCount: 24,
    level: "beginner",
  },
];

export default function SongsPage() {
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

          <Link href="/">
            <Button variant="ghost" className="rounded-full">
              Log in
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 text-sm font-medium">
              Start free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
        <h1 className="font-pphatton text-3xl sm:text-4xl font-bold text-heading mb-4">
          Learn Arabic through songs
        </h1>
        <p className="text-body text-lg max-w-2xl">
          The best way to learn a language? Sing along! Follow the lyrics,
          learn the words, and add them to your flashcards.
        </p>
      </div>

      {/* Songs Grid */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SONGS.map((song) => (
              <Link
                key={song.slug}
                href={`/songs/${song.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="aspect-video relative bg-gray-100">
                  <Image
                    src={song.thumbnail}
                    alt={song.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-emerald-600 text-sm font-medium">
                    {song.artist}
                  </p>
                  <h2 className="font-semibold text-heading text-lg mb-2">
                    {song.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-subtle">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                      {song.level}
                    </span>
                    <span>{song.wordCount} words</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming Soon placeholder */}
            <div className="bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center p-8 text-center">
              <div>
                <p className="text-gray-500 mb-2">More songs coming soon!</p>
                <p className="text-sm text-gray-400">
                  Have a suggestion? Let us know
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pphatton text-2xl font-bold text-heading mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎵</span>
              </div>
              <h3 className="font-semibold text-heading mb-2">
                1. Listen & follow
              </h3>
              <p className="text-body text-sm">
                Play the song and watch the lyrics highlight in real-time as
                you sing along.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">👆</span>
              </div>
              <h3 className="font-semibold text-heading mb-2">
                2. Tap any word
              </h3>
              <p className="text-body text-sm">
                Click on any word to see its meaning, pronunciation, and add it
                to your flashcards.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🧠</span>
              </div>
              <h3 className="font-semibold text-heading mb-2">
                3. Remember forever
              </h3>
              <p className="text-body text-sm">
                Our spaced repetition system shows you words right before you
                forget them.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
