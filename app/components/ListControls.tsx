import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';

export function ListControls({ 
  entry, 
  onListToggle 
}: { 
  entry: { ent_seq: number; isInList: boolean };
  onListToggle: (entSeq: number, isInList: boolean) => void;
}) {
  const fetcher = useFetcher();
  const isInList = entry.isInList;
  const isSubmitting = fetcher.state !== 'idle';

  console.log(entry.ent_seq, isInList)

  // Sync state after submission
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      onListToggle(entry.ent_seq, !isInList);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form method="post" className="absolute top-2 right-2">
      <input type="hidden" name="entSeq" value={entry.ent_seq} />
      {isInList ? (
        <button
          name="_action"
          value="removeFromList"
          className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
          title="Remove from list"
          disabled={isSubmitting}
        >
          {isSubmitting ? '...' : '★'}
        </button>
      ) : (
        <button
          name="_action"
          value="addToList"
          className="p-1.5 bg-gray-100 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
          title="Add to list"
          disabled={isSubmitting}
        >
          {isSubmitting ? '...' : '☆'}
        </button>
      )}
    </fetcher.Form>
  );
} 