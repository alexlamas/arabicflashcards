"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminService } from "../../../services/adminService";
import {
  StarterPack,
  StarterPackWord,
} from "../../../services/starterPackService";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PackWithCounts = StarterPack & { word_count: number };

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<PackWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pack expansion state
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [packContents, setPackContents] = useState<{
    words: StarterPackWord[];
  } | null>(null);

  // Editing state
  const [editingPack, setEditingPack] = useState<PackWithCounts | null>(null);
  const [editingWord, setEditingWord] = useState<StarterPackWord | null>(null);
  const [isCreatingPack, setIsCreatingPack] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);

  // Form states
  const [packForm, setPackForm] = useState({
    name: "",
    description: "",
    level: "beginner",
    is_active: true,
  });
  const [wordForm, setWordForm] = useState({
    arabic: "",
    english: "",
    transliteration: "",
    type: "noun",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const packsData = await AdminService.getAllStarterPacks();
      setPacks(packsData);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load packs",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPackContents(packId: string) {
    try {
      const contents = await AdminService.getPackContents(packId);
      setPackContents(contents);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load pack contents",
      });
    }
  }

  function handleExpandPack(packId: string) {
    if (expandedPack === packId) {
      setExpandedPack(null);
      setPackContents(null);
    } else {
      setExpandedPack(packId);
      loadPackContents(packId);
    }
  }

  async function handleCreatePack() {
    setSaving(true);
    try {
      await AdminService.createStarterPack(packForm);
      setIsCreatingPack(false);
      setPackForm({ name: "", description: "", level: "beginner", is_active: true });
      loadData();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to create pack",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePack() {
    if (!editingPack) return;
    setSaving(true);
    try {
      await AdminService.updateStarterPack(editingPack.id, packForm);
      setEditingPack(null);
      loadData();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to update pack",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePack(packId: string) {
    if (!confirm("Delete this pack? This cannot be undone.")) return;
    try {
      await AdminService.deleteStarterPack(packId);
      loadData();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to delete pack",
      });
    }
  }

  async function handleAddWord() {
    if (!expandedPack) return;
    setSaving(true);
    try {
      await AdminService.addStarterPackWord(expandedPack, wordForm);
      setIsAddingWord(false);
      setWordForm({ arabic: "", english: "", transliteration: "", type: "noun", notes: "" });
      loadPackContents(expandedPack);
      loadData();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to add word",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateWord() {
    if (!editingWord || !expandedPack) return;
    setSaving(true);
    try {
      await AdminService.updateStarterPackWord(editingWord.id, wordForm);
      setEditingWord(null);
      loadPackContents(expandedPack);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to update word",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWord(wordId: string) {
    if (!expandedPack) return;
    if (!confirm("Delete this word?")) return;
    try {
      await AdminService.deleteStarterPackWord(wordId);
      loadPackContents(expandedPack);
      loadData();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to delete word",
      });
    }
  }

  return (
    <div className="p-4 pt-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Starter packs</h1>
        <Dialog open={isCreatingPack} onOpenChange={setIsCreatingPack}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" /> New pack
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create starter pack</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={packForm.name}
                  onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={packForm.description}
                  onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Level</Label>
                <Input
                  value={packForm.level}
                  onChange={(e) => setPackForm({ ...packForm, level: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={packForm.is_active}
                  onCheckedChange={(checked) => setPackForm({ ...packForm, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleCreatePack} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {packs.map((pack) => (
            <div key={pack.id} className="border rounded-lg">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleExpandPack(pack.id)}
              >
                <div className="flex items-center gap-2">
                  {expandedPack === pack.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <div>
                    <div className="font-medium">{pack.name}</div>
                    <div className="text-sm text-gray-500">
                      {pack.word_count} words
                      {!pack.is_active && (
                        <span className="ml-2 text-orange-500">(inactive)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingPack(pack);
                      setPackForm({
                        name: pack.name,
                        description: pack.description || "",
                        level: pack.level || "beginner",
                        is_active: pack.is_active,
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleDeletePack(pack.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedPack === pack.id && packContents && (
                <div className="border-t p-4 bg-gray-50">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Words</h4>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingWord(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Add word
                      </Button>
                    </div>
                    {packContents.words.length === 0 ? (
                      <p className="text-sm text-gray-500">No words yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Arabic</TableHead>
                            <TableHead>English</TableHead>
                            <TableHead>Transliteration</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {packContents.words.map((word) => (
                            <TableRow key={word.id}>
                              <TableCell className="font-arabic">{word.arabic}</TableCell>
                              <TableCell>{word.english}</TableCell>
                              <TableCell>{word.transliteration}</TableCell>
                              <TableCell>{word.type}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingWord(word);
                                      setWordForm({
                                        arabic: word.arabic,
                                        english: word.english,
                                        transliteration: word.transliteration || "",
                                        type: word.type || "noun",
                                        notes: word.notes || "",
                                      });
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500"
                                    onClick={() => handleDeleteWord(word.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Pack Dialog */}
      <Dialog open={!!editingPack} onOpenChange={() => setEditingPack(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit starter pack</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={packForm.name}
                onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={packForm.description}
                onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Level</Label>
              <Input
                value={packForm.level}
                onChange={(e) => setPackForm({ ...packForm, level: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={packForm.is_active}
                onCheckedChange={(checked) => setPackForm({ ...packForm, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
            <Button onClick={handleUpdatePack} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Word Dialog */}
      <Dialog open={isAddingWord} onOpenChange={setIsAddingWord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add word</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arabic</Label>
              <Input
                value={wordForm.arabic}
                onChange={(e) => setWordForm({ ...wordForm, arabic: e.target.value })}
                className="font-arabic"
                dir="rtl"
              />
            </div>
            <div>
              <Label>English</Label>
              <Input
                value={wordForm.english}
                onChange={(e) => setWordForm({ ...wordForm, english: e.target.value })}
              />
            </div>
            <div>
              <Label>Transliteration</Label>
              <Input
                value={wordForm.transliteration}
                onChange={(e) => setWordForm({ ...wordForm, transliteration: e.target.value })}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Input
                value={wordForm.type}
                onChange={(e) => setWordForm({ ...wordForm, type: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={wordForm.notes}
                onChange={(e) => setWordForm({ ...wordForm, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleAddWord} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Word Dialog */}
      <Dialog open={!!editingWord} onOpenChange={() => setEditingWord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit word</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arabic</Label>
              <Input
                value={wordForm.arabic}
                onChange={(e) => setWordForm({ ...wordForm, arabic: e.target.value })}
                className="font-arabic"
                dir="rtl"
              />
            </div>
            <div>
              <Label>English</Label>
              <Input
                value={wordForm.english}
                onChange={(e) => setWordForm({ ...wordForm, english: e.target.value })}
              />
            </div>
            <div>
              <Label>Transliteration</Label>
              <Input
                value={wordForm.transliteration}
                onChange={(e) => setWordForm({ ...wordForm, transliteration: e.target.value })}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Input
                value={wordForm.type}
                onChange={(e) => setWordForm({ ...wordForm, type: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={wordForm.notes}
                onChange={(e) => setWordForm({ ...wordForm, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleUpdateWord} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
