"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CardsThree, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface MyWordsSectionProps {
  wordCount: number;
  onAddClick: () => void;
  onFileDrop?: (file: File) => void;
  onTextDrop?: (text: string) => void;
}

export function MyWordsSection({
  wordCount,
  onAddClick,
  onFileDrop,
  onTextDrop,
}: MyWordsSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    // Check for files first
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileDrop?.(file);
      return;
    }

    // Check for text
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      onTextDrop?.(text);
      return;
    }

    // Fallback - just open the dialog
    onAddClick();
  };

  // New user - just show add words card full width
  if (wordCount === 0) {
    return (
      <div
        className={`bg-white border rounded-2xl p-5 transition-all cursor-pointer ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
        onClick={onAddClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus className="w-6 h-6 text-body" />
          </div>
          <div>
            <h3 className="font-medium text-heading">Add your own words</h3>
            <p className="text-sm text-subtle">
              {isDragging ? "Drop here!" : "Drop a photo of your notes, paste text, or type — AI does the rest"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Has words - show both cards side by side
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* My words card */}
      <Link href="/my-words" className="block">
        <div className="bg-white border rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group h-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CardsThree className="w-6 h-6 text-body" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-heading">My words</h3>
              <p className="text-sm text-body">
                {wordCount} personal {wordCount === 1 ? "word" : "words"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              View →
            </Button>
          </div>
        </div>
      </Link>

      {/* Add words card */}
      <div
        className={`bg-white border rounded-2xl p-5 transition-all cursor-pointer h-full ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
        onClick={onAddClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-4 h-full">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus className="w-6 h-6 text-body" />
          </div>
          <div>
            <h3 className="font-medium text-heading">Add words</h3>
            <p className="text-sm text-subtle">
              {isDragging ? "Drop here!" : "Drop a photo of your notes, paste text, or type"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
