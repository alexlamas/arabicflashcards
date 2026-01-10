import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SchemaOrg } from "./schema";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// PPHatton custom font
const ppHatton = localFont({
  src: [
    {
      path: "./fonts/PPHatton-Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/PPHatton-UltralightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "./fonts/PPHatton-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/PPHatton-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/PPHatton-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/PPHatton-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-pphatton",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yallaflash.com"),
  title: {
    default: "Yalla! Learn Lebanese Arabic - Fun Flashcards That Actually Work",
    template: "%s | Yalla! Lebanese Arabic",
  },
  description:
    "Finally, a fun way to learn Lebanese Arabic! Smart flashcards that know when you're about to forget. From 'Kifak' to fluent - start your journey today!",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
  },
  keywords: [
    "Lebanese Arabic",
    "language learning",
    "Arabic vocabulary",
    "spaced repetition",
    "Arabic pronunciation",
    "Levantine Arabic",
    "Lebanon language",
    "Arabic flashcards",
  ],
  openGraph: {
    title: "Yalla! Learn Lebanese Arabic - The Fun Way",
    description:
      "Smart flashcards that make learning Lebanese Arabic addictively fun. Your brain will thank you (in Arabic)!",
    url: "https://yallaflash.com",
    siteName: "Yalla Flash",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Yalla Flash - Learn Lebanese Arabic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yalla Flash - Learn Lebanese Arabic",
    description: "Smart flashcards that make learning Lebanese Arabic addictively fun.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="google-site-verification"
          content="rSU7GMMmHm5j4KHAcS3QjX1PMwFA3NGGnaOJLFJn_kY"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ppHatton.variable} antialiased min-h-screen`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
        <SchemaOrg />
      </body>
    </html>
  );
}
