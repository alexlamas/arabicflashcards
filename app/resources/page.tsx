import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { PublicFooter } from "../components/PublicFooter";

export const metadata: Metadata = {
  title: "Lebanese Arabic Learning Resources | Yalla Flash",
  description:
    "Curated collection of the best resources for learning Lebanese Arabic: YouTube channels, podcasts, apps, dictionaries, tutors, and more.",
  openGraph: {
    title: "Lebanese Arabic Learning Resources",
    description:
      "Curated collection of the best resources for learning Lebanese Arabic: YouTube channels, podcasts, apps, dictionaries, tutors, and more.",
    url: "https://yallaflash.com/resources",
    siteName: "Yalla Flash",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Lebanese Arabic Learning Resources",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lebanese Arabic Learning Resources",
    description:
      "Curated collection of the best resources for learning Lebanese Arabic.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://yallaflash.com/resources",
  },
};

interface Resource {
  name: string;
  url: string;
  description: string;
}

interface ResourceCategory {
  title: string;
  icon: string;
  resources: Resource[];
}

const resourceCategories: ResourceCategory[] = [
  {
    title: "Dictionaries",
    icon: "📖",
    resources: [
      {
        name: "Arwords",
        url: "https://arwords.com",
        description:
          "Comprehensive Lebanese Arabic dictionary with audio pronunciations and example sentences.",
      },
    ],
  },
  {
    title: "YouTube Channels",
    icon: "📺",
    resources: [
      {
        name: "Learn Lebanese Arabic with Heba",
        url: "https://www.youtube.com/@LearnLebaneseArabicwithHeba",
        description:
          "Popular channel with engaging lessons about everyday Lebanese Arabic from the suburbs of Beirut.",
      },
      {
        name: "The Nassra Arabic Method",
        url: "https://www.youtube.com/@nassraarabicmethod",
        description:
          "Over 600 videos covering Levantine Arabic including Lebanese, Syrian, Palestinian, and Jordanian dialects.",
      },
      {
        name: "ArabicPod101",
        url: "https://www.youtube.com/@ArabicPod101",
        description:
          "Structured Arabic lessons for all levels with a mix of Modern Standard and dialect content.",
      },
    ],
  },
  {
    title: "Podcasts",
    icon: "🎧",
    resources: [
      {
        name: "Levantine Arabic, Made Easier",
        url: "https://podcasts.apple.com/us/podcast/levantine-arabic-made-easier/id1516944621",
        description:
          "Lebanese native Carol Haidar interviews people in Arabic on various topics. Great for intermediate to advanced learners.",
      },
      {
        name: "The Arabic We Speak",
        url: "https://thearabicwespeak.com/",
        description:
          "Created by Jordanian teachers Amani and Dalal, covering Levantine Arabic for all levels with free transcripts.",
      },
      {
        name: "Learn Levantine Arabic On The Go",
        url: "https://podcasts.apple.com/us/podcast/learn-levantine-arabic-on-the-go/id1489820598",
        description:
          "Audio lessons with transcripts by Khaled Nassra for beginners to intermediate learners.",
      },
    ],
  },
  {
    title: "Apps",
    icon: "📱",
    resources: [
      {
        name: "Tandem",
        url: "https://www.tandem.net/",
        description:
          "Language exchange app to practice speaking with native Lebanese Arabic speakers.",
      },
      {
        name: "HelloTalk",
        url: "https://www.hellotalk.com/",
        description:
          "Connect with native speakers for text and voice conversations with built-in translation tools.",
      },
      {
        name: "Memrise",
        url: "https://www.memrise.com/",
        description:
          "Vocabulary building app with spaced repetition. Search for user-created Lebanese Arabic courses.",
      },
    ],
  },
  {
    title: "Online Tutors",
    icon: "👩‍🏫",
    resources: [
      {
        name: "italki - Lebanese Arabic Teachers",
        url: "https://www.italki.com/en/teachers/lebanese-arabic",
        description:
          "Find native Lebanese Arabic tutors for one-on-one online lessons at various price points.",
      },
      {
        name: "Levantine Online",
        url: "https://www.levantineonline.com/",
        description:
          "Dedicated platform for learning Levantine Arabic with native teachers.",
      },
    ],
  },
  {
    title: "Courses",
    icon: "🎓",
    resources: [
      {
        name: "Pimsleur Eastern Arabic",
        url: "https://www.pimsleur.com/learn-arabic-eastern",
        description:
          "Audio-based course focusing on Levantine Arabic. Great for building conversation skills and pronunciation.",
      },
      {
        name: "Simple and Easy Arabic",
        url: "https://www.patreon.com/c/simpleandeasyarabic",
        description:
          "Patreon community with Lebanese Arabic lessons and resources.",
      },
    ],
  },
  {
    title: "Textbooks",
    icon: "📚",
    resources: [
      {
        name: "Shwayy 'an Haali",
        url: "https://www.amazon.com/Shwayy-Haali-Listening-Reading-Levantine/dp/1626166366",
        description:
          "Listening and reading practice for Levantine Arabic with accompanying audio.",
      },
      {
        name: "Arabic Express: Speak Lebanese",
        url: "https://www.amazon.com/Arabic-Express-Speak-Lebanese-Complete/dp/B0CVTL9YGY",
        description:
          "Comprehensive and user-friendly course for learning Lebanese Arabic from scratch.",
      },
    ],
  },
];

// Generate schema.org ItemList for SEO
const schemaData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Lebanese Arabic Learning Resources",
  description:
    "Curated collection of the best resources for learning Lebanese Arabic",
  numberOfItems: resourceCategories.reduce(
    (sum, cat) => sum + cat.resources.length,
    0
  ),
  itemListElement: resourceCategories.flatMap((category, catIndex) =>
    category.resources.map((resource, resIndex) => ({
      "@type": "ListItem",
      position: catIndex * 10 + resIndex + 1,
      item: {
        "@type": "WebSite",
        name: resource.name,
        url: resource.url,
        description: resource.description,
      },
    }))
  ),
};

export default function ResourcesPage() {
  return (
    <>
      <Script
        id="resources-schema"
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
            Lebanese Arabic Resources
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            A curated collection of the best resources for learning Lebanese
            Arabic. From YouTube channels and podcasts to apps and tutors.
          </p>
        </div>

        {/* Resources */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="space-y-12">
            {resourceCategories.map((category) => (
              <section key={category.title}>
                <h2 className="font-pphatton text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </h2>
                <div className="grid gap-4">
                  {category.resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-5 border border-gray-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {resource.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {resource.description}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-pphatton text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Yalla Flash uses spaced repetition to help you memorize Lebanese
              Arabic vocabulary effectively.
            </p>
            <Link href="/new">
              <Button className="bg-white hover:bg-gray-100 text-gray-900 rounded-full px-8 py-6 text-lg font-medium">
                Start learning free
              </Button>
            </Link>
          </div>
        </div>

        <PublicFooter />
      </div>
    </>
  );
}
