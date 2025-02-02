import { ArrowRightIcon } from '@heroicons/react/24/outline';

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  return (
    <form
      method="get"
      className="mb-4 max-w-2xl mx-auto"
      action={`?q=${initialQuery}`}
    >
      <div className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search..."
          className="flex-1 px-3 py-1.5 text-sm rounded-md border focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  );
} 