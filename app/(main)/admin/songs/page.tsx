"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SongService, Song } from "../../../services/songService";
import {
  Plus,
  Loader2,
  Music,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type SongWithCount = Song & { line_count: number };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<SongWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    artist: "",
    slug: "",
    youtube_id: "",
    description: "",
    is_published: false,
  });

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    setIsLoading(true);
    try {
      const data = await SongService.getAllSongs();
      setSongs(data);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load songs",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleTitleChange(title: string) {
    setForm({
      ...form,
      title,
      slug: slugify(title),
    });
  }

  function extractYouTubeId(url: string): string {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct ID
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  }

  async function handleCreate() {
    if (!form.title || !form.artist || !form.youtube_id) {
      toast({
        variant: "destructive",
        title: "Please fill in title, artist, and YouTube URL",
      });
      return;
    }

    setSaving(true);
    try {
      await SongService.createSong({
        ...form,
        youtube_id: extractYouTubeId(form.youtube_id),
      });
      setIsCreating(false);
      setForm({
        title: "",
        artist: "",
        slug: "",
        youtube_id: "",
        description: "",
        is_published: false,
      });
      loadSongs();
      toast({ title: "Song created" });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to create song",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublished(song: SongWithCount) {
    try {
      await SongService.updateSong(song.id, {
        is_published: !song.is_published,
      });
      loadSongs();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to update song",
      });
    }
  }

  async function handleDelete(songId: string) {
    if (!confirm("Delete this song? This cannot be undone.")) return;
    try {
      await SongService.deleteSong(songId);
      loadSongs();
      toast({ title: "Song deleted" });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to delete song",
      });
    }
  }

  return (
    <div className="p-4 pt-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Songs</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" /> New song
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create song</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Bahebak Ya Lebnan"
                />
              </div>
              <div>
                <Label>Artist</Label>
                <Input
                  value={form.artist}
                  onChange={(e) => setForm({ ...form, artist: e.target.value })}
                  placeholder="Fairuz"
                />
              </div>
              <div>
                <Label>YouTube URL or ID</Label>
                <Input
                  value={form.youtube_id}
                  onChange={(e) => setForm({ ...form, youtube_id: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="bahebak-ya-lebnan"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL will be /songs/{form.slug || "..."}
                </p>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                />
                <Label>Published</Label>
              </div>
              <Button onClick={handleCreate} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create song"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No songs yet</p>
          <p className="text-sm">Create your first song to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map((song) => (
            <div
              key={song.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{song.title}</h3>
                    {!song.is_published && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{song.artist}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{song.line_count} lines</span>
                    <span>/songs/{song.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={song.is_published}
                    onCheckedChange={() => handleTogglePublished(song)}
                  />
                  <Link href={`/admin/songs/${song.id}`}>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </Link>
                  {song.is_published && (
                    <Link href={`/songs/${song.slug}`} target="_blank">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(song.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
