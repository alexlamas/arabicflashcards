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
import {
  StarterPack,
  StarterPackWord,
} from "../../services/starterPackService";
import { createClient } from "@/utils/supabase/client";
import { Check, X, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
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
      .from("packs")
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

    // Get pack words (includes type='phrase')
    const wordsResult = await supabase
      .from("words")
      .select("*")
      .eq("pack_id", packId)
      .order("english");

    if (wordsResult.error) {
      console.error("Error loading words:", wordsResult.error);
      setWords([]);
      setIsLoading(false);
      return;
    }

    setWords(wordsResult.data || []);
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
    const { error } = await supabase
      .from("words")
      .update({ [editingCell.field]: editingCell.value })
      .eq("id", editingCell.id);

    if (error) {
      console.error("Error saving:", error);
    } else {
      setWords(words.map((w) =>
        w.id === editingCell.id ? { ...w, [editingCell.field]: editingCell.value } : w
      ));
    }

    setEditingCell(null);
    setSaving(false);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCellSave();
    } else if (e.key === "Escape") {
      handleCellCancel();
    }
  };


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

  const renderWordsTable = (wordsList: StarterPackWord[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Arabic</TableHead>
          <TableHead>English</TableHead>
          <TableHead>Transliteration</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Notes</TableHead>
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
        <h1 className="font-semibold">Content editor</h1>

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
          <span>{words.length} words</span>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : words.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No words in this pack.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {renderWordsTable(words)}
          </div>
        )}
      </div>
    </>
  );
}
