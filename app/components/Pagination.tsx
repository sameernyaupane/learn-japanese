import { Link } from "@remix-run/react";

export function Pagination({
  currentPage,
  totalPages,
  searchQuery,
  frequencyFilter,
  totalEntries,
  perPage,
}: {
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  frequencyFilter: string;
  totalEntries: number;
  perPage: number;
}) {
  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <div className="flex gap-1">
        {/* Previous Button */}
        <Link
          to={`?q=${searchQuery}&page=${currentPage - 1}&frequency=${frequencyFilter}`}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-400 hover:bg-gray-500'
          }`}
          onClick={(e) => currentPage === 1 && e.preventDefault()}
        >
          Previous
        </Link>

        {/* Page Numbers */}
        {(() => {
          const maxVisible = 10; // Max page buttons to show
          const buffer = 3; // Pages to show around current
          
          let start = Math.max(2, currentPage - buffer);
          let end = Math.min(totalPages - 1, currentPage + buffer);
          
          // Adjust if we're near the start/end
          if (currentPage - buffer <= 2) end = maxVisible - 2;
          if (totalPages - currentPage <= buffer) start = totalPages - maxVisible + 2;
          
          // Always show first page
          const pages = [1];
          
          // Add leading ellipsis if needed
          if (start > 2) pages.push(-1);
          
          // Add middle pages
          for (let i = start; i <= end; i++) pages.push(i);
          
          // Add trailing ellipsis if needed
          if (end < totalPages - 1) pages.push(-2);
          
          // Always show last page
          pages.push(totalPages);

          return pages.map((page) => (
            page === -1 || page === -2 ? (
              <span key={page} className="px-3 py-1 text-gray-500">...</span>
            ) : (
              <Link
                key={page}
                to={`?q=${searchQuery}&page=${page}&frequency=${frequencyFilter}`}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                {page}
              </Link>
            )
          ));
        })()}

        {/* Next Button */}
        <Link
          to={`?q=${searchQuery}&page=${currentPage + 1}&frequency=${frequencyFilter}`}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-400 hover:bg-gray-500'
          }`}
          onClick={(e) => currentPage === totalPages && e.preventDefault()}
        >
          Next
        </Link>
      </div>
      <div className="text-sm text-gray-500">
        {totalEntries > 0 ? (
          <>
            Showing {(currentPage - 1) * perPage + 1} -{' '}
            {Math.min(currentPage * perPage, totalEntries)} of {totalEntries} entries
          </>
        ) : (
          'No entries found'
        )}
      </div>
    </div>
  );
} 