import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PublicCTA } from "../components/PublicCTA";
import { PublicFooter } from "../components/PublicFooter";

export const metadata: Metadata = {
  title: "About | Yalla Flash",
  description:
    "Why I built Yalla Flash - a Lebanese Arabic flashcard app created by a diaspora learner who couldn't find tools that taught real spoken Lebanese.",
  openGraph: {
    title: "About Yalla Flash",
    description:
      "Why I built Yalla Flash - a Lebanese Arabic flashcard app created by a diaspora learner who couldn't find tools that taught real spoken Lebanese.",
    url: "https://yallaflash.com/about",
    siteName: "Yalla Flash",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "About Yalla Flash",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Yalla Flash",
    description:
      "Why I built Yalla Flash - created by a diaspora learner who couldn't find tools for real spoken Lebanese.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://yallaflash.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <div className="h-12 flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 pr-1.5 gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/avatars/pomegranate.svg"
              alt="Yalla Flash"
              width={28}
              height={28}
            />
            <span className="font-pphatton font-bold text-lg text-gray-900">
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

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        <h1 className="font-pphatton text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Why I built this
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed">
            I grew up in London speaking Spanish, French, and English — but not Arabic.
            My mum is Venezuelan-Lebanese, my dad is Lebanese, and somehow the language
            never got passed down. I understood swearwords and food — that&apos;s it.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed mt-6">
            A few years ago, I decided to finally learn. I went to Lebanon and took lessons.
            I made progress fast, but kept getting stuck on vocabulary. I&apos;d learn
            something on Tuesday, forget it by Thursday.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed mt-6">
            So I tried the apps. Duolingo? Only teaches Modern Standard Arabic — the
            formal written language that nobody actually speaks. Quizlet? Not built for
            Arabic — the text renders wrong and there&apos;s no transliteration.
            Other &ldquo;Levantine Arabic&rdquo; apps? Levantine isn&apos;t the same as Lebanese.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed mt-6">
            I wanted something that actually works: flashcards with spaced repetition — the scientifically
            proven best way to memorise vocabulary. Real Lebanese words and transliteration. The ability
            to add my own words from lessons. And AI to help with the annoying bits, like
            typing in Arabic or adding example sentences. It didn&apos;t exist, so I built it.
          </p>

          <h2 className="font-pphatton text-2xl font-bold text-gray-900 mt-12 mb-4">
            What makes this different
          </h2>

          <ul className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="text-gray-600">—</span>
              <span>Real Lebanese Arabic, not Modern Standard Arabic or generic &ldquo;Levantine.&rdquo;</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-600">—</span>
              <span>Spaced repetition that shows you words right before you&apos;d forget them.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-600">—</span>
              <span>Add your own words from tutors, shows, or conversations.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-600">—</span>
              <span>Built for Arabic with proper right-to-left text and transliteration.</span>
            </li>
          </ul>

          <h2 className="font-pphatton text-2xl font-bold text-gray-900 mt-12 mb-4">
            For the diaspora
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            If you&apos;re like me — Lebanese but didn&apos;t grow up speaking it — this is for you.
            There are millions of us scattered around the world: Brazil, Australia, France,
            the US, the UK. Some of us want to reconnect with family. Some want to understand
            what teta is saying. Some just feel like something&apos;s missing.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed mt-6">
            Learning a language as an adult is hard. But the right tools make it possible.
            I hope this helps.
          </p>

          <div className="mt-8 pt-8 border-t border-gray-200 flex items-center gap-4">
            <Image
              src="/alex.jpg"
              alt="Alex"
              width={56}
              height={56}
              className="rounded-full"
            />
            <p className="text-lg text-gray-600">
              — Alex
            </p>
          </div>
        </div>
      </div>

      <PublicCTA />

      <PublicFooter maxWidth="max-w-2xl" />
    </div>
  );
}
