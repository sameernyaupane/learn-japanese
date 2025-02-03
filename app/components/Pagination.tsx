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
        {(() => {
          const visiblePages = 5; // Show 5 pages at a time
          const startPage = Math.max(1, currentPage - 2);
          const endPage = Math.min(totalPages, currentPage + 2);
          
          return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNumber = startPage + i;
            return (
              <Link
                key={pageNumber}
                to={`?q=${searchQuery}&page=${pageNumber}&frequency=${frequencyFilter}`}
                className={`px-3 py-1 rounded ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {pageNumber}
              </Link>
            );
          });
        })()}
      </div>
      <div className="text-sm text-gray-500">
        Showing {(currentPage - 1) * perPage + 1} -{' '}
        {Math.min(currentPage * perPage, totalEntries)} of {totalEntries} entries
      </div>
    </div>
  );
} 