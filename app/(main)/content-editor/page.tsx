"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserRoles } from "../../hooks/useUserRoles";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  StarterPack,
  StarterPackWord,
  StarterPackPhrase,
  ReviewStatus,
} from "../../services/starterPackService";
import { createClient } from "@/utils/supabase/client";
import { Check, X, Loader2, RotateCcw } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

type EditingCell = {
  id: string;
  field: string;
  value: string;
} | null;

export default function ContentEditorPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isReviewer, isLoading: isRolesLoading } = useUserRoles();
  const router = useRouter();

  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [words, setWords] = useState<StarterPackWord[]>([]);
  const [phrases, setPhrases] = useState<StarterPackPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("words");
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [saving, setSaving] = useState(false);

  // Redirect non-reviewers
  useEffect(() => {
    if (!isAuthLoading && !isRolesLoading) {
      if (!session || !isReviewer) {
        router.push("/");
      }
    }
  }, [session, isReviewer, isAuthLoading, isRolesLoading, router]);

  // Load packs
  useEffect(() => {
    if (isReviewer) {
      loadPacks();
    }
  }, [isReviewer]);

  // Load content when pack selected
  useEffect(() => {
    if (selectedPack) {
      loadPackContent(selectedPack);
    }
  }, [selectedPack]);

  async function loadPacks() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("starter_packs")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading packs:", error);
      return;
    }
    setPacks(data || []);
    if (data && data.length > 0 && !selectedPack) {
      setSelectedPack(data[0].id);
    }
  }

  async function loadPackContent(packId: string) {
    setIsLoading(true);
    const supabase = createClient();

    const [wordsResult, phrasesResult] = await Promise.all([
      supabase
        .from("starter_pack_words")
        .select("*")
        .eq("pack_id", packId)
        .order("order_index"),
      supabase
        .from("starter_pack_phrases")
        .select("*")
        .eq("pack_id", packId)
        .order("order_index"),
    ]);

    if (wordsResult.error) console.error("Error loading words:", wordsResult.error);
    if (phrasesResult.error) console.error("Error loading phrases:", phrasesResult.error);

    setWords(wordsResult.data || []);
    setPhrases(phrasesResult.data || []);
    setIsLoading(false);
  }

  const handleCellClick = (id: string, field: string, value: string) => {
    setEditingCell({ id, field, value });
  };

  const handleCellChange = (value: string) => {
    if (editingCell) {
      setEditingCell({ ...editingCell, value });
    }
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    setSaving(true);

    const supabase = createClient();
    const table = activeTab === "words" ? "starter_pack_words" : "starter_pack_phrases";

    const { error } = await supabase
      .from(table)
      .update({ [editingCell.field]: editingCell.value })
      .eq("id", editingCell.id);

    if (error) {
      console.error("Error saving:", error);
    } else {
      if (activeTab === "words") {
        setWords(words.map((w) =>
          w.id === editingCell.id ? { ...w, [editingCell.field]: editingCell.value } : w
        ));
      } else {
        setPhrases(phrases.map((p) =>
          p.id === editingCell.id ? { ...p, [editingCell.field]: editingCell.value } : p
        ));
      }
    }

    setEditingCell(null);
    setSaving(false);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleStatusChange = async (id: string, status: ReviewStatus, type: "words" | "phrases") => {
    const supabase = createClient();
    const table = type === "words" ? "starter_pack_words" : "starter_pack_phrases";

    const { error } = await supabase
      .from(table)
      .update({ review_status: status })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      return;
    }

    if (type === "words") {
      setWords(words.map((w) =>
        w.id === id ? { ...w, review_status: status } : w
      ));
    } else {
      setPhrases(phrases.map((p) =>
        p.id === id ? { ...p, review_status: status } : p
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCellSave();
    } else if (e.key === "Escape") {
      handleCellCancel();
    }
  };

  // Split words and phrases by status
  const needsReviewWords = words.filter((w) => !w.review_status || w.review_status === "needs_review");
  const approvedWords = words.filter((w) => w.review_status === "approved");
  const needsReviewPhrases = phrases.filter((p) => !p.review_status || p.review_status === "needs_review");
  const approvedPhrases = phrases.filter((p) => p.review_status === "approved");

  // Loading state
  if (isAuthLoading || isRolesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session || !isReviewer) {
    return null;
  }

  const renderEditableCell = (id: string, field: string, value: string, isArabic = false) => {
    const isEditing = editingCell?.id === id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editingCell.value}
            onChange={(e) => handleCellChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`h-8 ${isArabic ? "font-arabic text-right" : ""}`}
            dir={isArabic ? "rtl" : "ltr"}
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleCellSave} disabled={saving}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCellCancel}>
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className={`cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${isArabic ? "font-arabic text-right" : ""}`}
        onClick={() => handleCellClick(id, field, value || "")}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {value || <span className="text-gray-300 italic">empty</span>}
      </div>
    );
  };

  const renderWordsTable = (wordsList: StarterPackWord[], showApproveButton: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Arabic</TableHead>
          <TableHead>English</TableHead>
          <TableHead>Transliteration</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-32"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wordsList.map((word, index) => (
          <TableRow key={word.id}>
            <TableCell className="text-gray-400">{index + 1}</TableCell>
            <TableCell>{renderEditableCell(word.id, "arabic", word.arabic, true)}</TableCell>
            <TableCell>{renderEditableCell(word.id, "english", word.english)}</TableCell>
            <TableCell>{renderEditableCell(word.id, "transliteration", word.transliteration || "")}</TableCell>
            <TableCell>{renderEditableCell(word.id, "type", word.type || "")}</TableCell>
            <TableCell className="max-w-[200px] truncate">{renderEditableCell(word.id, "notes", word.notes || "")}</TableCell>
            <TableCell>
              {showApproveButton ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => handleStatusChange(word.id, "approved", "words")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500"
                  onClick={() => handleStatusChange(word.id, "needs_review", "words")}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Request Review
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderPhrasesTable = (phrasesList: StarterPackPhrase[], showApproveButton: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Arabic</TableHead>
          <TableHead>English</TableHead>
          <TableHead>Transliteration</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-32"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {phrasesList.map((phrase, index) => (
          <TableRow key={phrase.id}>
            <TableCell className="text-gray-400">{index + 1}</TableCell>
            <TableCell>{renderEditableCell(phrase.id, "arabic", phrase.arabic, true)}</TableCell>
            <TableCell>{renderEditableCell(phrase.id, "english", phrase.english)}</TableCell>
            <TableCell>{renderEditableCell(phrase.id, "transliteration", phrase.transliteration || "")}</TableCell>
            <TableCell className="max-w-[200px] truncate">{renderEditableCell(phrase.id, "notes", phrase.notes || "")}</TableCell>
            <TableCell>
              {showApproveButton ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => handleStatusChange(phrase.id, "approved", "phrases")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500"
                  onClick={() => handleStatusChange(phrase.id, "needs_review", "phrases")}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Request Review
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b shadow-xs px-4 sticky top-0 backdrop-blur-lg bg-white/70 z-30">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="font-semibold">Content Editor</h1>

        <div className="ml-4">
          <Select value={selectedPack || ""} onValueChange={setSelectedPack}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select pack" />
            </SelectTrigger>
            <SelectContent>
              {packs.map((pack) => (
                <SelectItem key={pack.id} value={pack.id}>
                  {pack.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-gray-500">
          {activeTab === "words" ? (
            <>
              <span className="text-amber-600">{needsReviewWords.length} needs review</span>
              <span className="mx-2">|</span>
              <span className="text-green-600">{approvedWords.length} approved</span>
            </>
          ) : (
            <>
              <span className="text-amber-600">{needsReviewPhrases.length} needs review</span>
              <span className="mx-2">|</span>
              <span className="text-green-600">{approvedPhrases.length} approved</span>
            </>
          )}
        </div>
      </header>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="words">Words ({words.length})</TabsTrigger>
            <TabsTrigger value="phrases">Phrases ({phrases.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="words" className="mt-0 space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Needs Review Section */}
                <div>
                  <h2 className="text-lg font-medium mb-3 text-amber-600">
                    Needs Review ({needsReviewWords.length})
                  </h2>
                  {needsReviewWords.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">All words have been reviewed!</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      {renderWordsTable(needsReviewWords, true)}
                    </div>
                  )}
                </div>

                {/* Approved Section */}
                <div>
                  <h2 className="text-lg font-medium mb-3 text-green-600">
                    Approved ({approvedWords.length})
                  </h2>
                  {approvedWords.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">No approved words yet.</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      {renderWordsTable(approvedWords, false)}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="phrases" className="mt-0 space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Needs Review Section */}
                <div>
                  <h2 className="text-lg font-medium mb-3 text-amber-600">
                    Needs Review ({needsReviewPhrases.length})
                  </h2>
                  {needsReviewPhrases.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">All phrases have been reviewed!</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      {renderPhrasesTable(needsReviewPhrases, true)}
                    </div>
                  )}
                </div>

                {/* Approved Section */}
                <div>
                  <h2 className="text-lg font-medium mb-3 text-green-600">
                    Approved ({approvedPhrases.length})
                  </h2>
                  {approvedPhrases.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">No approved phrases yet.</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      {renderPhrasesTable(approvedPhrases, false)}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
