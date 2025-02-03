export function KanjiHeader({
  primaryKana,
  primaryKanji,
  priority,
  furigana
}: {
  primaryKana: string;
  primaryKanji: string;
  priority?: string;
  furigana?: Array<{ rt: string; ruby: string }>;
}) {
  console.log('KanjiHeader furigana:', { 
    furigana, 
    primaryKanji, 
    primaryKana 
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        {!(Array.isArray(furigana) && furigana.length > 0) && (
          <div className="text-sm text-gray-600 leading-tight">{primaryKana}</div>
        )}
        <div className="text-4xl font-bold text-gray-900">
          {Array.isArray(furigana) && furigana.length > 0 ? (
            <div className="flex flex-row items-end gap-0.5">
              {furigana.map(({ rt, ruby }, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-sm font-normal text-gray-500 mb-1 min-h-[1.25rem]">
                    {rt || " "}
                  </div>
                  <div className="text-4xl leading-none font-normal">
                    {ruby}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            primaryKanji
          )}
        </div>
      </div>
      {priority && (
        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {priority}
        </span>
      )}
    </div>
  );
} 