import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Button } from "@/components/ui/button";

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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getAllPacks(): Promise<Pack[]> {
  const { data } = await supabase
    .from("packs")
    .select("id, name, description, level, image_url, icon")
    .eq("is_active", true)
    .order("level")
    .order("name");

  return data || [];
}

async function getPackWordCounts(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("words")
    .select("pack_id")
    .not("pack_id", "is", null);

  const counts: Record<string, number> = {};
  (data || []).forEach((row) => {
    if (row.pack_id) {
      counts[row.pack_id] = (counts[row.pack_id] || 0) + 1;
    }
  });

  return counts;
}

export const metadata: Metadata = {
  title: "Lebanese Arabic Vocabulary Packs | Yalla Flash",
  description:
    "Browse our collection of Lebanese Arabic vocabulary packs. From essential phrases to advanced topics, find the perfect pack to boost your Arabic fluency.",
  openGraph: {
    title: "Lebanese Arabic Vocabulary Packs",
    description:
      "Browse our collection of Lebanese Arabic vocabulary packs. From essential phrases to advanced topics, find the perfect pack to boost your Arabic fluency.",
    url: "https://yallaflash.com/packs",
    siteName: "Yalla Flash",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lebanese Arabic Vocabulary Packs | Yalla Flash",
    description:
      "Browse our collection of Lebanese Arabic vocabulary packs for all levels.",
    images: ["/og.png"],
  },
};

export default async function PacksIndexPage() {
  const [packs, wordCounts] = await Promise.all([
    getAllPacks(),
    getPackWordCounts(),
  ]);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Lebanese Arabic Vocabulary Packs",
    description:
      "Browse our collection of Lebanese Arabic vocabulary packs for all levels.",
    provider: {
      "@type": "Organization",
      name: "Yalla Flash",
      url: "https://yallaflash.com",
    },
    numberOfItems: packs.length,
  };

  return (
    <>
      <Script
        id="packs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
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
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
          <h1 className="font-pphatton text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Vocabulary Packs
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Browse our collection of Lebanese Arabic vocabulary packs. Each pack
            is designed to help you learn words that actually matter, from
            everyday essentials to specific topics.
          </p>
        </div>

        {/* Packs Grid */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 space-y-10">
            {["beginner", "intermediate", "advanced"].map((level) => {
              const levelPacks = packs
                .filter((p) => p.level === level)
                .sort((a, b) => a.name.localeCompare(b.name));

              if (levelPacks.length === 0) return null;

              return (
                <div key={level}>
                  <h2 className="font-pphatton text-xl font-bold text-gray-900 mb-4 capitalize">
                    {level}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelPacks.map((pack) => (
                      <Link
                        key={pack.id}
                        href={`/packs/${slugify(pack.name)}`}
                        className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex-shrink-0">
                            {pack.image_url ? (
                              <Image
                                src={pack.image_url}
                                alt={pack.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                {pack.icon || "📚"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {pack.name}
                            </h3>
                            {wordCounts[pack.id] && (
                              <p className="text-sm text-gray-500 mt-1">
                                {wordCounts[pack.id]} words
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <Link href="/new" className="flex items-center gap-3">
                <Image
                  src="/avatars/pomegranate.svg"
                  alt="Yalla Flash"
                  width={32}
                  height={32}
                />
                <span className="font-pphatton font-bold text-gray-900">
                  Yalla Flash
                </span>
              </Link>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <Link
                  href="/new"
                  className="hover:text-gray-900 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/packs"
                  className="hover:text-gray-900 transition-colors"
                >
                  All Packs
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} Yalla Flash</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
