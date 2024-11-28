// app/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { words } from './data/words.json';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { WordGrid } from './components/WordGrid';
import { Stats } from './components/Stats';
import { ViewToggle } from './components/ViewToggle';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'flashcard'>('list');
  const [progress, setProgress] = useState<Record<string, 'learned' | 'learning' | 'new'>>({});

  // Get unique categories
  const categories = useMemo(() => 
    [...new Set(words.map(word => word.category))], 
    []
  );

  // Filter words based on category and search
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const matchesCategory = !selectedCategory || word.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.arabic.includes(searchTerm) ||
        word.transliteration.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: words.length,
    filtered: filteredWords.length,
    learned: Object.values(progress).filter(p => p === 'learned').length,
    learning: Object.values(progress).filter(p => p === 'learning').length,
    new: words.length - Object.values(progress).length,
    byCategory: Object.fromEntries(
      categories.map(cat => [
        cat, 
        words.filter(w => w.category === cat).length
      ])
    )
  }), [categories, filteredWords.length, progress]);

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Arabic Learning Tool</h1>
        
        <div className="flex justify-between items-center mb-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <ViewToggle current={view} onChange={setView} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Stats stats={stats} />
            <CategoryFilter 
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
              counts={stats.byCategory}
            />
          </div>

          <div className="lg:col-span-3">
            <WordGrid 
              words={filteredWords}
              view={view}
              progress={progress}
              onProgressChange={setProgress}
            />
          </div>
        </div>
      </div>
    </main>
  );
}