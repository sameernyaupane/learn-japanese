import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getEntries } from '~/models/jmdict';
import Navigation from '~/components/Navigation';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || 1);
  const { entries, totalEntries } = await getEntries(page, 50);
  return { entries, totalEntries, currentPage: page };
};

export default function Index() {
  const { entries, totalEntries, currentPage } = useLoaderData<typeof loader>();
  const totalPages = Math.ceil(totalEntries / 50);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Japanese Dictionary Entries
          <span className="block text-lg font-normal text-gray-500 mt-2">
            {entries.length} entries found
          </span>
        </h1>

        <div className="space-y-6">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100"
            >
              <div className="p-6">
                {/* Entry Header */}
                <div className="mb-4">
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-mono px-3 py-1 rounded-full">
                    Entry #{entry.ent_seq}
                  </span>
                </div>

                {/* Kanji & Kana Grid */}
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  {/* Kanji Elements */}
                  {entry.kanji_elements.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        <span className="mr-2">🈁</span>Kanji Forms
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {entry.kanji_elements.map((kanji) => (
                          <span 
                            key={kanji.id}
                            className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg font-medium text-sm"
                          >
                            {kanji.keb}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Kana Elements */}
                  {entry.kana_elements.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {entry.kana_elements.map((kana) => (
                        <div 
                          key={kana.id}
                          className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="text-2xl font-semibold text-gray-900">
                                {kana.reb}
                              </div>
                              <div className="text-sm text-gray-500 font-mono">
                                {kana.romaji}
                              </div>
                            </div>
                            <button
                              onMouseEnter={async (e) => {
                                e.preventDefault();
                                if (currentAudio) currentAudio.pause();
                                const audio = new Audio(entry.audio[0]);
                                setCurrentAudio(audio);
                                await audio.play();
                              }}
                              onClick={async (e) => {
                                e.preventDefault();
                                if (currentAudio) currentAudio.pause();
                                const audio = new Audio(entry.audio[0]);
                                setCurrentAudio(audio);
                                await audio.play();
                              }}
                              className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <SpeakerWaveIcon className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Senses */}
                <div className="space-y-4">
                  {entry.senses.map((sense, senseIndex) => (
                    <div 
                      key={sense.id}
                      className="p-4 bg-gray-50 rounded-xl border-l-4 border-purple-200"
                    >
                      {/* Parts of Speech */}
                      {sense.pos?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                            Parts of Speech
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {sense.pos.map((pos, posIndex) => (
                              <span 
                                key={posIndex}
                                className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md"
                              >
                                {pos}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meanings */}
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          📖 Meanings
                        </h4>
                        <ul className="space-y-1.5">
                          {sense.glosses.map((gloss) => (
                            <li 
                              key={gloss.id}
                              className="flex items-start text-gray-700"
                            >
                              <span className="text-gray-400 mr-2">•</span>
                              <span className="flex-1">
                                {gloss.gloss}
                                <span className="ml-2 text-xs text-gray-500 font-mono">
                                  ({gloss.lang})
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Examples */}
                      {sense.examples.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                            💬 Examples
                          </h4>
                          <div className="space-y-2">
                            {sense.examples.map((example) => (
                              <div 
                                key={example.id}
                                className="text-sm text-gray-700"
                              >
                                <p className="font-medium">"{example.text}"</p>
                                <p className="text-gray-500 text-sm mt-1">
                                  {example.translation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <a
            href={`?page=${currentPage - 1}`}
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
            href={`?page=${currentPage + 1}`}
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
