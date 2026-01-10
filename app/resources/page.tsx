import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { PublicCTA } from "../components/PublicCTA";
import { PublicFooter } from "../components/PublicFooter";

export const metadata: Metadata = {
  title: "Lebanese Arabic Learning Resources | Yalla Flash",
  description:
    "Curated collection of the best resources for learning Lebanese Arabic including dictionaries and courses.",
  openGraph: {
    title: "Lebanese Arabic Learning Resources",
    description:
      "Curated collection of the best resources for learning Lebanese Arabic including dictionaries and courses.",
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
  image?: string;
}

interface ResourceCategory {
  title: string;
  resources: Resource[];
}

const resourceCategories: ResourceCategory[] = [
  {
    title: "Dictionaries",
    resources: [
      {
        name: "Arwords",
        url: "https://arwords.com",
        description:
          "Comprehensive Lebanese Arabic dictionary with audio pronunciations and example sentences.",
        image: "/resources/arwords.png",
      },
    ],
  },
  {
    title: "Tutors",
    resources: [
      {
        name: "Lea on Preply",
        url: "https://preply.com/en/tutor/3401447",
        description:
          "My Lebanese Arabic teacher. She's patient, fun, and great at explaining things. Highly recommend!",
        image: "/resources/lea.jpg",
      },
    ],
  },
  {
    title: "Courses",
    resources: [
      {
        name: "Simple and Easy Arabic",
        url: "https://www.patreon.com/c/simpleandeasyarabic",
        description:
          "Patreon community focused on Levantine Arabic with lessons and resources.",
        image: "/resources/sae.png",
      },
    ],
  },
  {
    title: "YouTube",
    resources: [
      {
        name: "Beirut I Love You",
        url: "https://www.youtube.com/watch?v=eJYAwC_4yRc&list=PLs0AE9DVDiVW1gk07ke2PT8_PDE2fxIGO",
        description:
          "Lebanese Arabic video series with real conversations and cultural content.",
        image: "/resources/beirut.jpg",
      },
    ],
  },
  {
    title: "Books",
    resources: [
      {
        name: "Saifi Arabic",
        url: "https://store.saifiarabic.com/",
        description:
          "Lebanese Arabic textbooks and learning materials from the Saifi Institute in Beirut.",
        image: "/resources/saifi-books.png",
      },
    ],
  },
  {
    title: "Schools",
    resources: [
      {
        name: "Saifi Institute",
        url: "https://saifiarabic.com/",
        description:
          "Arabic language school in Beirut offering Lebanese Arabic courses.",
        image: "/resources/saifi.jpeg",
      },
      {
        name: "Levantine Institute",
        url: "https://www.levantineinstitute.com/",
        description:
          "Language school specializing in Levantine Arabic with locations in Lebanon and Jordan.",
        image: "/resources/levit.png",
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

        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
          <h1 className="font-pphatton text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lebanese Arabic Resources
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            A curated collection of resources for learning Lebanese Arabic.
          </p>
        </div>

        {/* Resources */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="space-y-12">
            {resourceCategories.map((category) => (
              <section key={category.title}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  {category.title}
                </h2>
                <div className="grid gap-4">
                  {category.resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {resource.image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                            <Image
                              src={resource.image}
                              alt={resource.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {resource.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">
                            {resource.description}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {new URL(resource.url).hostname.replace("www.", "")}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
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

        <PublicCTA />

        <PublicFooter />
      </div>
    </>
  );
}
