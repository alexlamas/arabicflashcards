import { Analytics } from "@vercel/analytics/react";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: {
    default: "Learn Lebanese Arabic",
    template: "%s | Learn Lebanese Arabic",
  },
  description:
    "Learn Lebanese Arabic with our interactive spaced repetition system. Master vocabulary, pronunciation, and everyday phrases.",
  keywords: [
    "Lebanese Arabic",
    "language learning",
    "Arabic vocabulary",
    "spaced repetition",
    "Arabic pronunciation",
  ],
  openGraph: {
    title: "Learn Lebanese Arabic",
    description:
      "Master Lebanese Arabic with our interactive learning platform",
    url: "https://yourdomain.com",
    siteName: "Learn Lebanese Arabic",
    locale: "en_US",
    type: "website",
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
  verification: {
    google: "your-google-verification-code", // Get this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-50">
      <meta
        name="google-site-verification"
        content="rSU7GMMmHm5j4KHAcS3QjX1PMwFA3NGGnaOJLFJn_kY"
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
        <Analytics />
        <SchemaOrg />
      </body>
    </html>
  );
}
