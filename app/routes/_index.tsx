import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getEntries } from '~/models/jmdict';
import Navigation from '~/components/Navigation';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || 1);
  const searchQuery = url.searchParams.get('q') || '';
  const { entries, totalEntries } = await getEntries(page, 50, searchQuery);
  return { entries, totalEntries, currentPage: page, searchQuery };
};

function SearchForm({ initialQuery }: { initialQuery: string }) {
  return (
    <form 
      method="get" 
      className="mb-4 max-w-2xl mx-auto"
      action={({ formData }) => {
        const query = formData.get('q');
        return `?q=${encodeURIComponent(query as string)}`;
      }}
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

export default function Index() {
  const { entries, totalEntries, currentPage, searchQuery } = useLoaderData<typeof loader>();
  const totalPages = Math.ceil(totalEntries / 50);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleAudioPlay = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const newAudio = new Audio(audioUrl);
    setCurrentAudio(newAudio);
    newAudio.play();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <SearchForm initialQuery={searchQuery} />
        
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
          {entries.map((entry) => {
            const primaryKanji = entry.kanji_elements[0]?.keb;
            const primaryKana = entry.kana_elements[0]?.reb;
            const romaji = entry.kana_elements[0]?.romaji;
            const priority = entry.kana_elements[0]?.pri?.[0];
            const audioUrl = entry.kana_elements[0]?.audio;

            return (
              <div 
                key={entry.id} 
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="p-4">
                  {/* Kanji Header */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-600 -mb-2 leading-tight">
                          {primaryKana}
                        </div>
                        <div className="text-4xl font-bold text-gray-900">
                          {primaryKanji}
                        </div>
                      </div>
                      {priority && (
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {priority}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-sm text-gray-400">
                        {romaji}
                      </div>
                      {entry.kana_elements[0]?.audio && (
                        <button
                          onClick={() => handleAudioPlay(entry.kana_elements[0].audio!)}
                          onMouseEnter={() => {
                            if (entry.kana_elements[0]?.audio) {
                              const timeout = setTimeout(() => {
                                handleAudioPlay(entry.kana_elements[0].audio!);
                              }, 500);
                              setHoverTimeout(timeout);
                            }
                          }}
                          onMouseLeave={() => {
                            if (hoverTimeout) {
                              clearTimeout(hoverTimeout);
                              setHoverTimeout(null);
                            }
                            if (currentAudio) {
                              currentAudio.pause();
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <SpeakerWaveIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Senses */}
                  <div className="space-y-3">
                    {entry.senses.map((sense, senseIndex) => (
                      <div key={sense.id} className="text-sm">
                        {/* Part of Speech */}
                        {sense.pos?.length > 0 && (
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-emerald-600">
                              {sense.pos.join(', ')}
                            </span>
                            {sense.field && (
                              <span className="text-xs text-gray-400">
                                {sense.field}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Definitions */}
                        <div className="space-y-2">
                          {sense.glosses.reduce((acc, gloss) => {
                            const lastGroup = acc[acc.length - 1];
                            const currentType = [gloss.g_type, gloss.g_gend].filter(Boolean).join(' ') || sense.pos?.join(', ');
                            
                            if (lastGroup && lastGroup.type === currentType) {
                              lastGroup.glosses.push(gloss);
                            } else {
                              acc.push({ type: currentType, glosses: [gloss] });
                            }
                            
                            return acc;
                          }, []).map((group, groupIndex) => (
                            <div key={groupIndex} className="relative pl-3">
                              <div className="text-gray-800 leading-snug">
                                <span className="mr-2">•</span>
                                {group.glosses.map((gloss, i) => (
                                  <span key={gloss.id}>
                                    {gloss.gloss}
                                    {i < group.glosses.length - 1 && ', '}
                                  </span>
                                ))}
                                {group.type && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({group.type})
                                  </span>
                                )}
                              </div>
                              {group.glosses[0]?.example && (
                                <div className="mt-2 ml-3 pl-2 border-l-2 border-gray-200 text-gray-600 text-xs italic bg-gray-50 p-1.5 rounded">
                                  "{group.glosses[0].example}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Related Terms */}
                        {sense.xref && senseIndex === entry.senses.length - 1 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <ArrowRightIcon className="h-3 w-3" />
                              <span>Related: {sense.xref}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
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

        <footer className="mt-12 text-center text-sm text-gray-500">
          Audio provided by{' '}
          <a href="https://soundoftext.com" className="text-blue-600 hover:underline">
            Sound of Text
          </a>
        </footer>
      </div>
    </div>
  );
}
