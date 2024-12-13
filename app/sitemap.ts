import { MetadataRoute } from "next";
import { WordService } from "./services/wordService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all words for the sitemap
  const words = await WordService.getAllWords();

  const wordUrls = words.map((word) => ({
    url: `https://yourdomain.com/word/${word.english}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: "https://yourdomain.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://yourdomain.com/review",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...wordUrls,
  ];
}
