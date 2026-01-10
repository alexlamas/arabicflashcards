import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all active packs
  const { data: packs } = await supabase
    .from("packs")
    .select("name, updated_at")
    .eq("is_active", true);

  const packUrls: MetadataRoute.Sitemap = (packs || []).map((pack) => ({
    url: `https://yallaflash.com/packs/${slugify(pack.name)}`,
    lastModified: new Date(pack.updated_at),
    priority: 0.8,
  }));

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
    ...packUrls,
  ];
}
