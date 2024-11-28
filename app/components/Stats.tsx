// app/components/Stats.tsx
export function Stats({ stats }: { 
    stats: {
      total: number;
      filtered: number;
      learned: number;
      learning: number;
      new: number;
    }
  }) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-4">Statistics</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Words:</span>
            <span>{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span>Currently Showing:</span>
            <span>{stats.filtered}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Learned:</span>
            <span>{stats.learned}</span>
          </div>
          <div className="flex justify-between text-yellow-600">
            <span>Learning:</span>
            <span>{stats.learning}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>New:</span>
            <span>{stats.new}</span>
          </div>
        </div>
      </div>
    );
  }