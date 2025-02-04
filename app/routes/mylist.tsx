import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { getUserList } from '~/models/UserListModel';
import { EntryCard } from '~/components/EntryCard';
import { Pagination } from '~/components/Pagination';
import { getUserId } from "~/services/auth";
import { useState, useEffect } from 'react';
import { SearchForm } from '~/components/SearchForm';

const PER_PAGE = 5;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);

  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || 1);
  const searchQuery = url.searchParams.get('q') || '';
  const frequencyFilter = url.searchParams.get('frequency') || '';
  
  const { entries, totalEntries } = await getUserList(
    userId,
    page, 
    PER_PAGE, 
    searchQuery
  );
  
  return { entries, totalEntries, currentPage: page, searchQuery, frequencyFilter, perPage: PER_PAGE };
};

export default function MyListPage() {
  const { entries: loaderEntries, totalEntries, currentPage, searchQuery, frequencyFilter, perPage } = useLoaderData<typeof loader>();

  const [entries, setEntries] = useState(loaderEntries);
  const totalPages = Math.ceil(totalEntries / perPage);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const rootData = useRouteLoaderData('root');
  const isLoggedIn = rootData?.isLoggedIn;

  // Reset entries when authentication state changes
  useEffect(() => {
    setEntries(loaderEntries);
  }, [loaderEntries, isLoggedIn]);

  const handleListToggle = (entSeq: number, isInList: boolean) => {
    setEntries(prevEntries => 
      prevEntries.map(entry => 
        entry.ent_seq === entSeq ? { ...entry, isInList } : entry
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <SearchForm 
          initialQuery={searchQuery} 
          initialFrequency={frequencyFilter} 
        />
        
        <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {searchQuery ? `Results for "${searchQuery}"` : 'My List'}
          <span className="ml-2 text-sm text-gray-500">
            ({totalEntries} entries)
          </span>
        </h1>

        {entries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No entries found matching your search criteria
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isLoggedIn={isLoggedIn}
              currentAudio={currentAudio}
              setCurrentAudio={setCurrentAudio}
              hoverTimeout={hoverTimeout}
              setHoverTimeout={setHoverTimeout}
              onListToggle={handleListToggle}
            />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          frequencyFilter={frequencyFilter}
          totalEntries={totalEntries}
          perPage={perPage}
        />
      </div>
    </div>
  );
} 

export function shouldRevalidate({ formData }: { formData?: FormData }) {
  const action = formData?.get('_action');
  return !(action === 'addToList' || action === 'removeFromList');
}