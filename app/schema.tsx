"use client";

import Script from "next/script";

export function SchemaOrg() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Yalla Flash",
    description:
      "Learn Lebanese Arabic with our interactive spaced repetition system",
    url: "https://yallaflash.com",
  };

  return (
    <Script id="schema-org" type="application/ld+json">
      {JSON.stringify(schema)}
    </Script>
  );
}
