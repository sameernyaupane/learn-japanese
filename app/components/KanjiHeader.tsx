export function KanjiHeader({
  primaryKana,
  primaryKanji,
  priority
}: {
  primaryKana: string;
  primaryKanji: string;
  priority?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="text-sm text-gray-600 leading-tight">{primaryKana}</div>
        <div className="text-4xl font-bold text-gray-900">{primaryKanji}</div>
      </div>
      {priority && (
        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {priority}
        </span>
      )}
    </div>
  );
} 