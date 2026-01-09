"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserRoles } from "../../hooks/useUserRoles";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AdminService,
  AdminUser,
  AdminWord,
} from "../../services/adminService";
import {
  StarterPack,
  StarterPackWord,
} from "../../services/starterPackService";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

type PackWithCounts = StarterPack & { word_count: number };

export default function AdminPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isAdmin, isLoading: isRolesLoading } = useUserRoles();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [words, setWords] = useState<AdminWord[]>([]);
  const [packs, setPacks] = useState<PackWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("packs");

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

  // Redirect non-admins
  useEffect(() => {
    if (!isAuthLoading && !isRolesLoading) {
      if (!session || !isAdmin) {
        router.push("/");
      }
    }
  }, [session, isAdmin, isAuthLoading, isRolesLoading, router]);

  // Load data
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

  async function loadData() {
    setIsLoading(true);
    try {
      if (activeTab === "users") {
        const usersData = await AdminService.getAllUsers();
        setUsers(usersData);
      } else if (activeTab === "words") {
        const wordsData = await AdminService.getAllWords();
        setWords(wordsData);
      } else if (activeTab === "packs") {
        const packsData = await AdminService.getAllStarterPacks();
        setPacks(packsData);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPackContents(packId: string) {
    try {
      const contents = await AdminService.getPackContents(packId);
      setPackContents(contents);
    } catch (error) {
      console.error("Error loading pack contents:", error);
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

  // Pack CRUD
  async function handleCreatePack() {
    setSaving(true);
    try {
      await AdminService.createStarterPack(packForm);
      setIsCreatingPack(false);
      setPackForm({ name: "", description: "", level: "beginner", is_active: true });
      loadData();
    } catch (error) {
      console.error("Error creating pack:", error);
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
    } catch (error) {
      console.error("Error updating pack:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePack(packId: string) {
    if (!confirm("Delete this pack? This cannot be undone.")) return;
    try {
      await AdminService.deleteStarterPack(packId);
      loadData();
    } catch (error) {
      console.error("Error deleting pack:", error);
    }
  }

  // Word CRUD
  async function handleAddWord() {
    if (!expandedPack) return;
    setSaving(true);
    try {
      await AdminService.addStarterPackWord(expandedPack, wordForm);
      setIsAddingWord(false);
      setWordForm({ arabic: "", english: "", transliteration: "", type: "noun", notes: "" });
      loadPackContents(expandedPack);
      loadData();
    } catch (error) {
      console.error("Error adding word:", error);
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
    } catch (error) {
      console.error("Error updating word:", error);
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
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  }

  // Show loading while checking auth
  if (isAuthLoading || isRolesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b shadow-xs px-4 sticky top-0 backdrop-blur-lg bg-white/70 z-30">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <TabsList>
            <TabsTrigger value="packs">Starter Packs</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="words">Words</TabsTrigger>
          </TabsList>
          {activeTab === "packs" && (
            <div className="ml-auto">
              <Dialog open={isCreatingPack} onOpenChange={setIsCreatingPack}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> New Pack
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Starter Pack</DialogTitle>
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
          )}
        </header>
        <div className="p-4">
          {/* Starter Packs Tab */}
          <TabsContent value="packs" className="mt-0">
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

                    {/* Expanded Pack Contents */}
                    {expandedPack === pack.id && packContents && (
                      <div className="border-t p-4 bg-gray-50">
                        {/* Words Section */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Words</h4>
                            <Button size="sm" variant="outline" onClick={() => setIsAddingWord(true)}>
                              <Plus className="h-3 w-3 mr-1" /> Add Word
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
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <p className="font-medium mb-2">Admin RLS policies not configured</p>
                <p>Run the SQL in <code className="bg-amber-100 px-1 rounded">supabase/005_admin_rls_policies.sql</code> in your Supabase SQL editor to enable admin access to all user data.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Last Review</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.email_confirmed ? (
                          <span className="text-green-600 text-xs">Confirmed</span>
                        ) : (
                          <span className="text-amber-600 text-xs">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>{user.word_count}</TableCell>
                      <TableCell>
                        {user.last_review_date
                          ? new Date(user.last_review_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Words Tab */}
          <TabsContent value="words" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : words.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <p className="font-medium mb-2">Admin RLS policies not configured</p>
                <p>Run the SQL in <code className="bg-amber-100 px-1 rounded">supabase/005_admin_rls_policies.sql</code> in your Supabase SQL editor to enable admin access to all user data.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arabic</TableHead>
                    <TableHead>English</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {words.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-arabic">{word.arabic}</TableCell>
                      <TableCell>{word.english}</TableCell>
                      <TableCell>{word.type}</TableCell>
                      <TableCell className="font-mono text-xs">{word.user_id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        {new Date(word.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Edit Pack Dialog */}
      <Dialog open={!!editingPack} onOpenChange={() => setEditingPack(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Starter Pack</DialogTitle>
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
            <DialogTitle>Add Word</DialogTitle>
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
            <DialogTitle>Edit Word</DialogTitle>
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
    </>
  );
}
