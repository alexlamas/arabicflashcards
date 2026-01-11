import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { SongPlayer } from "./SongPlayer";
import { SongWithLines, SongLine, SongLineWord } from "@/app/services/songService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSong(slug: string): Promise<SongWithLines | null> {
  const supabase = await createClient(cookies());

  const { data: song, error: songError } = await supabase
    .from("songs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (songError || !song) return null;

  const { data: lines, error: linesError } = await supabase
    .from("song_lines")
    .select("*")
    .eq("song_id", song.id)
    .order("line_order", { ascending: true });

  if (linesError) return null;

  // Get words for all lines
  const lineIds = (lines || []).map((l: SongLine) => l.id);
  if (lineIds.length === 0) {
    return { ...song, lines: [] };
  }

  const { data: words, error: wordsError } = await supabase
    .from("song_line_words")
    .select("*")
    .in("song_line_id", lineIds)
    .order("word_order", { ascending: true });

  if (wordsError) return null;

  // Group words by line
  const wordsByLine = new Map<string, SongLineWord[]>();
  for (const word of words || []) {
    const lineWords = wordsByLine.get(word.song_line_id) || [];
    lineWords.push(word);
    wordsByLine.set(word.song_line_id, lineWords);
  }

  return {
    ...song,
    lines: (lines || []).map((line: SongLine) => ({
      ...line,
      words: wordsByLine.get(line.id) || []
    }))
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSong(slug);

  if (!song) {
    return {
      title: "Song not found | Yalla Flash",
    };
  }

  const title = `${song.title} by ${song.artist} - Learn Lebanese Arabic | Yalla Flash`;
  const description = song.description ||
    `Learn Lebanese Arabic by singing along to "${song.title}" by ${song.artist}. Interactive lyrics with translations, word-by-word breakdowns, and flashcard integration.`;

  const ogImage = song.cover_url || `https://img.youtube.com/vi/${song.youtube_id}/hqdefault.jpg`;

  return {
    title,
    description,
    openGraph: {
      title: `${song.title} by ${song.artist}`,
      description,
      url: `https://yallaflash.com/songs/${slug}`,
      siteName: "Yalla Flash",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 480,
          height: 360,
          alt: `${song.title} by ${song.artist}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${song.title} by ${song.artist}`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://yallaflash.com/songs/${slug}`,
    },
  };
}

export default async function SongPage({ params }: PageProps) {
  const { slug } = await params;
  const song = await getSong(slug);

  if (!song) {
    notFound();
  }

  return <SongPlayer song={song} />;
}
