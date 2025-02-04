import { useFetcher } from '@remix-run/react';

export function ListControls({ 
  entry, 
  onListToggle 
}: { 
  entry: { ent_seq: number; isInList: boolean };
  onListToggle: (entSeq: number, isInList: boolean) => void;
}) {
  const fetcher = useFetcher();
  const isInList = entry.isInList;

  return (
    <fetcher.Form method="post" className="absolute top-2 right-2">
      <input type="hidden" name="entSeq" value={entry.ent_seq} />
      {isInList ? (
        <button
          name="_action"
          value="removeFromList"
          className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
          title="Remove from list"
          onClick={() => onListToggle(entry.ent_seq, false)}
        >
          ★
        </button>
      ) : (
        <button
          name="_action"
          value="addToList"
          className="p-1.5 bg-gray-100 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
          title="Add to list"
          onClick={() => onListToggle(entry.ent_seq, true)}
        >
          ☆
        </button>
      )}
    </fetcher.Form>
  );
} 