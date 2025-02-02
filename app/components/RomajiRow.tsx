export function RomajiRow({
  romaji,
  children
}: {
  romaji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="text-sm text-gray-400">{romaji}</div>
      {children}
    </div>
  );
} 