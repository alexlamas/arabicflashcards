// app/components/CategoryFilter.tsx
export function CategoryFilter({ 
    categories, 
    selected, 
    onChange,
    counts
  }: {
    categories: string[];
    selected: string | null;
    onChange: (category: string | null) => void;
    counts: Record<string, number>;
  }) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold mb-4">Categories</h2>
        <button
          onClick={() => onChange(null)}
          className={`block w-full text-left px-4 py-2 rounded ${
            !selected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`block w-full text-left px-4 py-2 rounded ${
              selected === category ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
          >
            {category} ({counts[category]})
          </button>
        ))}
      </div>
    );
  }