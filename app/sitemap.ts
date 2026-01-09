import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://yallaflash.com",
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: "https://yallaflash.com/new",
      lastModified: new Date(),
      priority: 1.0,
    },
  ];
}
