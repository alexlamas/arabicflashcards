import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  PencilSimple,
  Trash,
  Check,
  X,
  CircleNotch,
  Sparkle,
} from "@phosphor-icons/react";
import { ExampleSentence } from "../types/word";

interface ExampleSentenceManagerProps {
  sentences: ExampleSentence[];
  onChange: (sentences: ExampleSentence[]) => void;
  wordArabic: string;
  wordEnglish: string;
  wordType?: string;
  wordNotes?: string;
  onUnsavedChanges?: (hasUnsaved: boolean) => void;
}

export function ExampleSentenceManager({
  sentences,
  onChange,
  wordArabic,
  wordEnglish,
  wordType,
  wordNotes,
  onUnsavedChanges,
}: ExampleSentenceManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<ExampleSentence | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notify parent when there are unsaved changes
  React.useEffect(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(editingIndex !== null);
    }
  }, [editingIndex, onUnsavedChanges]);

  const handleAddNew = () => {
    const newSentence: ExampleSentence = {
      transliteration: "",
      english: "",
    };
    onChange([...sentences, newSentence]);
    setEditingIndex(sentences.length);
    setEditFormData(newSentence);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditFormData(sentences[index]);
  };

  const handleSave = () => {
    if (editingIndex === null || !editFormData) return;

    const updated = [...sentences];
    updated[editingIndex] = editFormData;
    onChange(updated);
    setEditingIndex(null);
    setEditFormData(null);
  };

  const handleCancel = () => {
    if (editingIndex === sentences.length) {
      // Remove the newly added empty sentence
      const updated = sentences.slice(0, -1);
      onChange(updated);
    }
    setEditingIndex(null);
    setEditFormData(null);
    setError(null);
  };

  const handleDelete = (index: number) => {
    const updated = sentences.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleGenerateSentence = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: wordArabic,
          english: wordEnglish,
          type: wordType,
          notes: wordNotes,
          existingData: {
            arabic: editFormData?.arabic || "",
            transliteration: editFormData?.transliteration || "",
            english: editFormData?.english || "",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error:", response.status, errorData);
        throw new Error(errorData?.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      setEditFormData({
        ...(data.arabic && { arabic: data.arabic }),
        transliteration: data.transliteration,
        english: data.english,
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate example sentence. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Example Sentences</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddNew}
          className="flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Example
        </Button>
      </div>

      {sentences.map((sentence, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          {editingIndex === index ? (
            <>
              {error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-500">Arabic</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateSentence}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-violet-600 hover:text-violet-700"
                  >
                    {isGenerating ? (
                      <CircleNotch className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkle className="w-3 h-3" />
                    )}
                    Generate with Claude
                  </Button>
                </div>
                <Textarea
                  value={editFormData?.arabic || ""}
                  onChange={(e) =>
                    setEditFormData((prev) =>
                      prev ? { ...prev, arabic: e.target.value } : null
                    )
                  }
                  dir="rtl"
                  className="font-arabic text-lg"
                  placeholder="أدخل الجملة بالعربية"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Transliteration</label>
                <Input
                  value={editFormData?.transliteration || ""}
                  onChange={(e) =>
                    setEditFormData((prev) =>
                      prev ? { ...prev, transliteration: e.target.value } : null
                    )
                  }
                  placeholder="Enter transliteration"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">English</label>
                <Textarea
                  value={editFormData?.english || ""}
                  onChange={(e) =>
                    setEditFormData((prev) =>
                      prev ? { ...prev, english: e.target.value } : null
                    )
                  }
                  placeholder="Enter English translation"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={!editFormData?.transliteration || !editFormData?.english}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                {sentence.arabic && (
                  <p className="font-arabic text-lg">{sentence.arabic}</p>
                )}
                <p className="text-sm text-gray-500">
                  {sentence.transliteration}
                </p>
                <p className="text-sm">{sentence.english}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(index)}
                >
                  <PencilSimple className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(index)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
