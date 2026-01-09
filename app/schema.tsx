"use client";

import Script from "next/script";

export function SchemaOrg() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Yalla Flash",
      description: "Learn Lebanese Arabic with smart flashcards",
      url: "https://yallaflash.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Yalla Flash",
      description: "Learn Lebanese Arabic with smart flashcards using spaced repetition. Master vocabulary from basic greetings to fluent conversations.",
      url: "https://yallaflash.com",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "1",
      },
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <Script key={i} id={`schema-org-${i}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </Script>
      ))}
    </>
  );
}
