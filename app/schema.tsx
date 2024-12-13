"use client";

import Script from "next/script";

export function SchemaOrg() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Learn Lebanese Arabic",
    description:
      "Learn Lebanese Arabic with our interactive spaced repetition system",
    url: "https://yourdomain.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://yourdomain.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script id="schema-org" type="application/ld+json">
      {JSON.stringify(schema)}
    </Script>
  );
}
