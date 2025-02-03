import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getEntries } from '~/models/jmdict';
import Navigation from '~/components/Navigation';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { SearchForm } from '~/components/SearchForm';
import { Pagination } from '~/components/Pagination';
import { EntryCard } from '~/components/EntryCard';

const PER_PAGE = 5;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || 1);
  const searchQuery = url.searchParams.get('q') || '';
  const frequencyFilter = url.searchParams.get('frequency') || '';
  
  const { entries, totalEntries } = await getEntries(
    page, 
    PER_PAGE, 
    searchQuery,
    frequencyFilter
  );
  
  return { entries, totalEntries, currentPage: page, searchQuery, frequencyFilter, perPage: PER_PAGE };
};

export default function Index() {
  const { entries, totalEntries, currentPage, searchQuery, frequencyFilter, perPage } = useLoaderData<typeof loader>();
  const totalPages = Math.ceil(totalEntries / perPage);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <SearchForm 
          initialQuery={searchQuery} 
          initialFrequency={frequencyFilter} 
        />
        
        <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {searchQuery ? `Results for "${searchQuery}"` : 'Dictionary Entries'}
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
              currentAudio={currentAudio}
              setCurrentAudio={setCurrentAudio}
              hoverTimeout={hoverTimeout}
              setHoverTimeout={setHoverTimeout}
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

        <footer className="mt-12 text-center text-sm text-gray-500">
          Audio provided by{' '}
          <a href="https://soundoftext.com" className="text-blue-600 hover:underline">
            Sound of Text
          </a>
          {' • '}
          Images from{' '}
          <a 
            href="https://pexels.com" 
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pexels
          </a>
        </footer>
      </div>
    </div>
  );
}
