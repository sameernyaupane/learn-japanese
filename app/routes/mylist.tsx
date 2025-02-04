import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { getUserList } from '~/models/UserListModel';
import { EntryCard } from '~/components/EntryCard';
import { Pagination } from '~/components/Pagination';
import { getUserId } from "~/services/auth";

const PER_PAGE = 5;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);

  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || 1);
  
  const { entries, totalEntries } = await getUserList(
    userId, 
    page, 
    PER_PAGE
  );
  
  return json({ 
    entries,
    totalEntries,
    currentPage: page,
    perPage: PER_PAGE
  });
};

export default function MyListPage() {
  const { entries, totalEntries, currentPage, perPage } = useLoaderData<typeof loader>();
  const totalPages = Math.ceil(totalEntries / perPage);

  const rootData = useRouteLoaderData('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <div className="min-h-screen bg-gray-50">      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          My Saved Words ({totalEntries})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              // Pass any required audio props here
            />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          className="mt-6"
        />
      </div>
    </div>
  );
} 