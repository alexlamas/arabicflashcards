// app/components/SearchBar.tsx
export function SearchBar({ value, onChange }: { 
    value: string; 
    onChange: (value: string) => void 
  }) {
    return (
      <input
        type="text"
        placeholder="Search words..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border rounded w-full max-w-md"
      />
    );
  }