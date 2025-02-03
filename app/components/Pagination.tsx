export function Pagination({
  currentPage,
  totalPages,
  searchQuery,
  totalEntries,
  perPage,
}: {
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  totalEntries: number;
  perPage: number;
}) {
  const startEntry = Math.min((currentPage - 1) * perPage + 1, totalEntries);
  const endEntry = Math.min(currentPage * perPage, totalEntries);

  return (
    <div className="mt-8 flex justify-between items-center">
      <a
        href={`?page=${currentPage - 1}&q=${encodeURIComponent(searchQuery)}`}
        className={`px-4 py-2 rounded-lg ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        Previous
      </a>
      <div className="flex flex-col items-center">
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <span className="text-sm text-gray-400">
          Showing {startEntry}-{endEntry} of {totalEntries} entries
        </span>
      </div>
      <a
        href={`?page=${currentPage + 1}&q=${encodeURIComponent(searchQuery)}`}
        className={`px-4 py-2 rounded-lg ${
          currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        Next
      </a>
    </div>
  );
} 