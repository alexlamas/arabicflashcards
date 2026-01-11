"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SongService,
  SongWithLines,
  SongLine,
  SongLineWord,
} from "../../../../services/songService";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Clock,
  Play,
  Pause,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// YouTube Player types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function parseTime(timeStr: string): number {
  // Handle MM:SS.ms or SS.ms or just SS
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return mins * 60 + secs;
  }
  return parseFloat(timeStr) || 0;
}

export default function SongEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [songId, setSongId] = useState<string | null>(null);
  const [song, setSong] = useState<SongWithLines | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [timestampMode, setTimestampMode] = useState(false);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Edit states
  const [editingSong, setEditingSong] = useState(false);
  const [songForm, setSongForm] = useState({
    title: "",
    artist: "",
    slug: "",
    youtube_id: "",
    description: "",
    is_published: false,
  });

  // Line editing
  const [addingLine, setAddingLine] = useState(false);
  const [editingLine, setEditingLine] = useState<SongLine | null>(null);
  const [lineForm, setLineForm] = useState({
    start_time: "",
    end_time: "",
    arabic: "",
    transliteration: "",
    english: "",
  });

  // Word editing
  const [addingWord, setAddingWord] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<SongLineWord | null>(null);
  const [wordForm, setWordForm] = useState({
    arabic: "",
    transliteration: "",
    english: "",
  });

  // Unwrap params
  useEffect(() => {
    params.then((p) => setSongId(p.id));
  }, [params]);

  // Load song
  useEffect(() => {
    if (songId) {
      loadSong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  async function loadSong() {
    if (!songId) return;
    setIsLoading(true);
    try {
      const data = await SongService.getSongWithLines(songId);
      if (!data) {
        toast({ variant: "destructive", title: "Song not found" });
        router.push("/admin/songs");
        return;
      }
      setSong(data);
      setSongForm({
        title: data.title,
        artist: data.artist,
        slug: data.slug,
        youtube_id: data.youtube_id,
        description: data.description || "",
        is_published: data.is_published,
      });
    } catch {
      toast({ variant: "destructive", title: "Failed to load song" });
    } finally {
      setIsLoading(false);
    }
  }

  // Initialize YouTube Player
  useEffect(() => {
    if (!song) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player("youtube-player-admin", {
        videoId: song.youtube_id,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => setPlayer(event.target),
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.youtube_id]);

  // Track current time
  useEffect(() => {
    if (isPlaying && player) {
      timeIntervalRef.current = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
      }, 100);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    }
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [isPlaying, player]);


  const captureStartTime = useCallback(() => {
    if (player) {
      setLineForm({ ...lineForm, start_time: formatTime(player.getCurrentTime()) });
    }
  }, [player, lineForm]);

  const captureEndTime = useCallback(() => {
    if (player) {
      setLineForm({ ...lineForm, end_time: formatTime(player.getCurrentTime()) });
    }
  }, [player, lineForm]);

  const seekTo = useCallback((time: number) => {
    if (player) {
      player.seekTo(time, true);
    }
  }, [player]);

  // Song CRUD
  async function handleUpdateSong() {
    if (!song) return;
    setSaving(true);
    try {
      await SongService.updateSong(song.id, songForm);
      loadSong();
      setEditingSong(false);
      toast({ title: "Song updated" });
    } catch {
      toast({ variant: "destructive", title: "Failed to update song" });
    } finally {
      setSaving(false);
    }
  }

  // Line CRUD
  async function handleAddLine() {
    if (!song) return;
    setSaving(true);
    try {
      await SongService.addLine(song.id, {
        start_time: parseTime(lineForm.start_time),
        end_time: lineForm.end_time ? parseTime(lineForm.end_time) : undefined,
        arabic: lineForm.arabic,
        transliteration: lineForm.transliteration,
        english: lineForm.english,
        line_order: song.lines.length,
      });
      loadSong();
      setAddingLine(false);
      setLineForm({ start_time: "", end_time: "", arabic: "", transliteration: "", english: "" });
      toast({ title: "Line added" });
    } catch {
      toast({ variant: "destructive", title: "Failed to add line" });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateLine() {
    if (!editingLine) return;
    setSaving(true);
    try {
      await SongService.updateLine(editingLine.id, {
        start_time: parseTime(lineForm.start_time),
        end_time: lineForm.end_time ? parseTime(lineForm.end_time) : null,
        arabic: lineForm.arabic,
        transliteration: lineForm.transliteration,
        english: lineForm.english,
      });
      loadSong();
      setEditingLine(null);
      toast({ title: "Line updated" });
    } catch {
      toast({ variant: "destructive", title: "Failed to update line" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLine(lineId: string) {
    if (!confirm("Delete this line?")) return;
    try {
      await SongService.deleteLine(lineId);
      loadSong();
      toast({ title: "Line deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete line" });
    }
  }

  // Set timestamp on a line (used in timestamp mode)
  async function handleSetTimestamp(lineId: string, field: 'start_time' | 'end_time') {
    if (!player || !song) return;
    const time = player.getCurrentTime();
    try {
      await SongService.updateLine(lineId, {
        [field]: time,
      });
      // Update local state instead of reloading
      setSong({
        ...song,
        lines: song.lines.map(line =>
          line.id === lineId
            ? { ...line, [field]: time }
            : line
        )
      });
      toast({ title: `Set ${field === 'start_time' ? 'start' : 'end'} time to ${formatTime(time)}` });
    } catch {
      toast({ variant: "destructive", title: "Failed to set timestamp" });
    }
  }

  // Word CRUD
  async function handleAddWord() {
    if (!addingWord) return;
    setSaving(true);
    try {
      const line = song?.lines.find((l) => l.id === addingWord);
      await SongService.addWord(addingWord, {
        arabic: wordForm.arabic,
        transliteration: wordForm.transliteration,
        english: wordForm.english,
        word_order: line?.words?.length || 0,
      });
      loadSong();
      setAddingWord(null);
      setWordForm({ arabic: "", transliteration: "", english: "" });
      toast({ title: "Word added" });
    } catch {
      toast({ variant: "destructive", title: "Failed to add word" });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateWord() {
    if (!editingWord) return;
    setSaving(true);
    try {
      await SongService.updateWord(editingWord.id, wordForm);
      loadSong();
      setEditingWord(null);
      toast({ title: "Word updated" });
    } catch {
      toast({ variant: "destructive", title: "Failed to update word" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWord(wordId: string) {
    if (!confirm("Delete this word?")) return;
    try {
      await SongService.deleteWord(wordId);
      loadSong();
      toast({ title: "Word deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete word" });
    }
  }

  if (isLoading || !song) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-4 pt-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/songs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{song.title}</h1>
          <p className="text-sm text-gray-500">{song.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={song.is_published}
            onCheckedChange={async (checked) => {
              await SongService.updateSong(song.id, { is_published: checked });
              loadSong();
            }}
          />
          <span className="text-sm text-gray-600">
            {song.is_published ? "Published" : "Draft"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditingSong(true)}>
          Edit details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video Player */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden sticky top-4">
            <div id="youtube-player-admin" className="w-full h-full" />
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => (isPlaying ? player?.pauseVideo() : player?.playVideo())}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <span className="text-sm font-mono">{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={timestampMode}
                onCheckedChange={setTimestampMode}
              />
              <span className={`text-sm ${timestampMode ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {timestampMode ? 'Timestamp mode ON' : 'Timestamp mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Lines Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Lyrics ({song.lines.length} lines)</h2>
            <Button
              size="sm"
              onClick={() => {
                setLineForm({
                  start_time: formatTime(currentTime),
                  end_time: "",
                  arabic: "",
                  transliteration: "",
                  english: "",
                });
                setAddingLine(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add line
            </Button>
          </div>

          {song.lines.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              <p>No lyrics yet</p>
              <p className="text-sm">Add your first line to get started</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {song.lines.map((line, index) => (
                <div
                  key={line.id}
                  className="border rounded-lg bg-white overflow-hidden"
                >
                  {/* Line header */}
                  <div
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedLine(expandedLine === line.id ? null : line.id)
                    }
                  >
                    <div className="flex items-center gap-1 text-gray-400">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-xs w-4">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          className={`text-xs font-mono hover:underline ${
                            timestampMode
                              ? 'text-red-600 bg-red-50 px-1 rounded'
                              : 'text-blue-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (timestampMode) {
                              handleSetTimestamp(line.id, 'start_time');
                            } else {
                              seekTo(line.start_time);
                            }
                          }}
                          title={timestampMode ? 'Click to set start time' : 'Click to seek'}
                        >
                          {formatTime(line.start_time)}
                        </button>
                        <span className="text-gray-400">-</span>
                        <button
                          className={`text-xs font-mono hover:underline ${
                            timestampMode
                              ? 'text-red-600 bg-red-50 px-1 rounded'
                              : 'text-blue-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (timestampMode) {
                              handleSetTimestamp(line.id, 'end_time');
                            } else if (line.end_time) {
                              seekTo(line.end_time);
                            }
                          }}
                          title={timestampMode ? 'Click to set end time' : 'Click to seek'}
                        >
                          {line.end_time ? formatTime(line.end_time) : '--:--'}
                        </button>
                      </div>
                      {line.arabic ? (
                        <>
                          <p className="font-arabic text-lg truncate">{line.arabic}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {line.transliteration}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{line.english}</p>
                        </>
                      ) : (
                        <p className="text-sm text-orange-500 italic">Click to add lyrics...</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {line.words && line.words.length > 0 && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {line.words.length} words
                        </span>
                      )}
                      {expandedLine === line.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedLine === line.id && (
                    <div className="border-t bg-gray-50 p-3 space-y-3">
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingLine(line);
                            setLineForm({
                              start_time: formatTime(line.start_time),
                              end_time: line.end_time
                                ? formatTime(line.end_time)
                                : "",
                              arabic: line.arabic,
                              transliteration: line.transliteration,
                              english: line.english,
                            });
                          }}
                        >
                          Edit line
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => handleDeleteLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Words */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Learnable words</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAddingWord(line.id);
                              setWordForm({ arabic: "", transliteration: "", english: "" });
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add word
                          </Button>
                        </div>
                        {line.words && line.words.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {line.words.map((word) => (
                              <div
                                key={word.id}
                                className="group relative bg-white border rounded-lg px-3 py-2 text-sm"
                              >
                                <span className="font-arabic">{word.arabic}</span>
                                <span className="text-gray-500 ml-2">
                                  {word.english}
                                </span>
                                <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                                  <button
                                    className="p-1 bg-white border rounded shadow-sm hover:bg-gray-50"
                                    onClick={() => {
                                      setEditingWord(word);
                                      setWordForm({
                                        arabic: word.arabic,
                                        transliteration: word.transliteration,
                                        english: word.english,
                                      });
                                    }}
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                  <button
                                    className="p-1 bg-white border rounded shadow-sm hover:bg-red-50 text-red-500"
                                    onClick={() => handleDeleteWord(word.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">
                            No words defined. Add words users can learn from this line.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Song Dialog */}
      <Dialog open={editingSong} onOpenChange={setEditingSong}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit song details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={songForm.title}
                onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Artist</Label>
              <Input
                value={songForm.artist}
                onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
              />
            </div>
            <div>
              <Label>YouTube ID</Label>
              <Input
                value={songForm.youtube_id}
                onChange={(e) => setSongForm({ ...songForm, youtube_id: e.target.value })}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={songForm.slug}
                onChange={(e) => setSongForm({ ...songForm, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={songForm.description}
                onChange={(e) => setSongForm({ ...songForm, description: e.target.value })}
              />
            </div>
            <Button onClick={handleUpdateSong} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Line Dialog */}
      <Dialog
        open={addingLine || !!editingLine}
        onOpenChange={() => {
          setAddingLine(false);
          setEditingLine(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLine ? "Edit line" : "Add line"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start time</Label>
                <div className="flex gap-1">
                  <Input
                    value={lineForm.start_time}
                    onChange={(e) =>
                      setLineForm({ ...lineForm, start_time: e.target.value })
                    }
                    placeholder="1:27.00"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={captureStartTime}
                    title="Capture current time"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>End time (optional)</Label>
                <div className="flex gap-1">
                  <Input
                    value={lineForm.end_time}
                    onChange={(e) =>
                      setLineForm({ ...lineForm, end_time: e.target.value })
                    }
                    placeholder="1:31.00"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={captureEndTime}
                    title="Capture current time"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label>Arabic</Label>
              <Input
                value={lineForm.arabic}
                onChange={(e) => setLineForm({ ...lineForm, arabic: e.target.value })}
                className="font-arabic text-xl"
                dir="rtl"
                placeholder="بحبك يا لبنان"
              />
            </div>
            <div>
              <Label>Transliteration</Label>
              <Input
                value={lineForm.transliteration}
                onChange={(e) =>
                  setLineForm({ ...lineForm, transliteration: e.target.value })
                }
                placeholder="b7ebbak ya lebnen"
              />
            </div>
            <div>
              <Label>English</Label>
              <Input
                value={lineForm.english}
                onChange={(e) => setLineForm({ ...lineForm, english: e.target.value })}
                placeholder="I love you Lebanon"
              />
            </div>
            <Button
              onClick={editingLine ? handleUpdateLine : handleAddLine}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingLine ? (
                "Save"
              ) : (
                "Add line"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Word Dialog */}
      <Dialog
        open={!!addingWord || !!editingWord}
        onOpenChange={() => {
          setAddingWord(null);
          setEditingWord(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWord ? "Edit word" : "Add word"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arabic</Label>
              <Input
                value={wordForm.arabic}
                onChange={(e) => setWordForm({ ...wordForm, arabic: e.target.value })}
                className="font-arabic text-xl"
                dir="rtl"
              />
            </div>
            <div>
              <Label>Transliteration</Label>
              <Input
                value={wordForm.transliteration}
                onChange={(e) =>
                  setWordForm({ ...wordForm, transliteration: e.target.value })
                }
              />
            </div>
            <div>
              <Label>English</Label>
              <Input
                value={wordForm.english}
                onChange={(e) => setWordForm({ ...wordForm, english: e.target.value })}
              />
            </div>
            <Button
              onClick={editingWord ? handleUpdateWord : handleAddWord}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingWord ? (
                "Save"
              ) : (
                "Add word"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
