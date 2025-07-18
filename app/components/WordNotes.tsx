import React from "react";
import { NotePencil } from "@phosphor-icons/react";

interface WordNotesProps {
  notes: string;
}

export function WordNotes({ notes }: WordNotesProps) {
  if (!notes) return null;

  return (
    <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-100">
      <NotePencil className="w-4 h-4 text-yellow-600 mt-0.5" />
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
    </div>
  );
}