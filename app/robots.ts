import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/review/",
        "/my-words/",
        "/this-week/",
        "/this-month/",
        "/onboarding/",
        "/play/",
        "/login",
        "/signup",
        "/auth/",
      ],
    },
    sitemap: "https://yallaflash.com/sitemap.xml",
  };
}
