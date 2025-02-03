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
          const visiblePages = 10; // Show 10 pages at a time
          const startPage = Math.max(1, currentPage - 5);
          const endPage = Math.min(totalPages, currentPage + 4);
          
          return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNumber = startPage + i;
            return (
              <Link
                key={pageNumber}
                to={`?q=${searchQuery}&page=${pageNumber}&frequency=${frequencyFilter}`}
                className={`px-3 py-1 rounded ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                {pageNumber}
              </Link>
            );
          });
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
        Showing {(currentPage - 1) * perPage + 1} -{' '}
        {Math.min(currentPage * perPage, totalEntries)} of {totalEntries} entries
      </div>
    </div>
  );
} 