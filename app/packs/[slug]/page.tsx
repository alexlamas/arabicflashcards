import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Button } from "@/components/ui/button";

// Create a Supabase client for server-side static generation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Pack {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  image_url: string | null;
  icon: string | null;
}

interface PackWord {
  id: string;
  arabic: string;
  english: string;
  transliteration: string | null;
  type: string | null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getPackBySlug(slug: string): Promise<{ pack: Pack; words: PackWord[] } | null> {
  const { data: packs } = await supabase
    .from("packs")
    .select("id, name, description, level, image_url, icon")
    .eq("is_active", true);

  const pack = (packs || []).find((p) => slugify(p.name) === slug);
  if (!pack) return null;

  const { data: words } = await supabase
    .from("words")
    .select("id, arabic, english, transliteration, type")
    .eq("pack_id", pack.id)
    .order("english");

  return { pack, words: words || [] };
}

async function getAllPacks(): Promise<Pack[]> {
  const { data } = await supabase
    .from("packs")
    .select("id, name, description, level, image_url, icon")
    .eq("is_active", true)
    .order("name");

  return data || [];
}

// Generate static params for all packs
export async function generateStaticParams() {
  const packs = await getAllPacks();
  return packs.map((pack) => ({
    slug: slugify(pack.name),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPackBySlug(slug);

  if (!data) {
    return {
      title: "Pack Not Found | Yalla Flash",
    };
  }

  const { pack, words } = data;
  const wordCount = words.length;
  const sampleWords = words
    .slice(0, 5)
    .map((w) => w.english)
    .join(", ");

  const description =
    pack.description ||
    `Learn ${wordCount} essential Lebanese Arabic words including ${sampleWords}. Master ${pack.name} with smart flashcards and spaced repetition.`;

  return {
    title: `${pack.name} - Lebanese Arabic Vocabulary | Yalla Flash`,
    description,
    openGraph: {
      title: `${pack.name} - Lebanese Arabic Vocabulary`,
      description,
      url: `https://yallaflash.com/packs/${slug}`,
      siteName: "Yalla Flash",
      type: "website",
      images: [
        {
          url: pack.image_url || "/og.png",
          width: 1200,
          height: 630,
          alt: pack.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pack.name} - Lebanese Arabic Vocabulary`,
      description,
      images: [pack.image_url || "/og.png"],
    },
  };
}

export default async function PackPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPackBySlug(slug);

  if (!data) {
    notFound();
  }

  const { pack, words } = data;
  const allPacks = await getAllPacks();
  const otherPacks = allPacks
    .filter((p) => p.id !== pack.id)
    .slice(0, 3);

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: pack.name,
    description:
      pack.description ||
      `Learn ${words.length} essential Lebanese Arabic words with smart flashcards.`,
    provider: {
      "@type": "Organization",
      name: "Yalla Flash",
      url: "https://yallaflash.com",
    },
    numberOfCredits: `${words.length} words`,
    educationalLevel: pack.level || "beginner",
    inLanguage: ["en", "ar"],
    isAccessibleForFree: true,
  };

  return (
    <>
      <Script
        id="pack-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
          <div className="h-12 flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 pr-1.5 gap-2">
            <Link href="/new" className="flex items-center gap-2">
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

            <Link href="/new">
              <Button variant="ghost" className="rounded-full">
                Log in
              </Button>
            </Link>
            <Link href="/new">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 text-sm font-medium">
                Start free
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Pack Image */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex-shrink-0">
              {pack.image_url ? (
                <Image
                  src={pack.image_url}
                  alt={pack.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {pack.icon || "📚"}
                </div>
              )}
            </div>

            {/* Pack Info */}
            <div className="flex-1">
              <h1 className="font-pphatton text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {pack.name}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {pack.description ||
                  `Master ${words.length} essential Lebanese Arabic words with smart flashcards and spaced repetition.`}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {pack.level && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full capitalize">
                    {pack.level}
                  </span>
                )}
                <span>{words.length} words</span>
              </div>
            </div>
          </div>
        </div>

        {/* Words Grid */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-pphatton text-2xl font-bold text-gray-900 mb-6">
              Words in this pack
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="bg-white rounded-xl p-4 border border-gray-200"
                >
                  <div className="text-2xl font-arabic mb-1">{word.arabic}</div>
                  <div className="text-gray-900 font-medium">{word.english}</div>
                  {word.transliteration && (
                    <div className="text-gray-500 text-sm">
                      {word.transliteration}
                    </div>
                  )}
                  {word.type && (
                    <div className="text-xs text-gray-400 mt-2 capitalize">
                      {word.type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Other Packs */}
        {otherPacks.length > 0 && (
          <div className="py-12">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="font-pphatton text-2xl font-bold text-gray-900 mb-6">
                More packs you might like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {otherPacks.map((p) => (
                  <Link
                    key={p.id}
                    href={`/packs/${slugify(p.name)}`}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex-shrink-0">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {p.icon || "📚"}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{p.name}</div>
                        {p.level && (
                          <div className="text-xs text-gray-500 capitalize">
                            {p.level}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-pphatton text-3xl font-bold text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Join thousands of learners mastering Lebanese Arabic with Yalla Flash.
            </p>
            <Link href="/new">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 rounded-full px-8 text-lg font-semibold"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Yalla Flash</p>
          </div>
        </footer>
      </div>
    </>
  );
}
