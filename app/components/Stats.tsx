// app/components/Stats.tsx
export function Stats({
  stats,
}: {
  stats: {
    total: number;
    filtered: number;
    learned: number;
    learning: number;
    new: number;
  };
}) {
  // Calculate percentages for the progress bar
  const learnedPercent = (stats.learned / stats.total) * 100;
  const learningPercent = (stats.learning / stats.total) * 100;
  const newPercent = (stats.new / stats.total) * 100;

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h2 className="font-semibold mb-4">Statistics</h2>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div className="h-full flex">
          <div
            style={{ width: `${learnedPercent}%` }}
            className="bg-green-500 transition-all duration-300"
          />
          <div
            style={{ width: `${learningPercent}%` }}
            className="bg-yellow-500 transition-all duration-300"
          />
          <div
            style={{ width: `${newPercent}%` }}
            className="bg-gray-300 transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        {/* Status items with colored dots */}
        <div className="flex justify-between items-center text-green-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Learned:</span>
          </div>
          <span className="font-medium">{stats.learned}</span>
        </div>

        <div className="flex justify-between items-center text-yellow-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Learning:</span>
          </div>
          <span className="font-medium">{stats.learning}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span>Not started:</span>
          </div>
          <span className="font-medium">{stats.new}</span>
        </div>
        <div className="flex justify-between">
          <span>Total:</span>
          <span className="font-medium">{stats.total}</span>
        </div>
      </div>
    </div>
  );
}
