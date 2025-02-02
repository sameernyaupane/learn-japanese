export function SenseGroup({
  group,
  pos
}: {
  group: any;
  pos: string[];
}) {
  return (
    <div className="relative pl-3">
      <div className="text-gray-800 leading-snug">
        <span className="mr-2">•</span>
        {group.glosses.map((gloss: any, i: number) => (
          <span key={gloss.id}>
            {gloss.gloss}
            {i < group.glosses.length - 1 && ', '}
          </span>
        ))}
        {group.type && (
          <span className="ml-2 text-xs text-gray-500">
            ({group.type})
          </span>
        )}
      </div>
      {group.glosses[0]?.example && (
        <ExampleSentence example={group.glosses[0].example} />
      )}
    </div>
  );
} 