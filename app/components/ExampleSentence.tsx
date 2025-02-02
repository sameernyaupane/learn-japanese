export function ExampleSentence({ example }: { example: string }) {
  return (
    <div className="mt-2 ml-3 pl-2 border-l-2 border-gray-200 text-gray-600 text-xs italic bg-gray-50 p-1.5 rounded">
      "{example}"
    </div>
  );
} 