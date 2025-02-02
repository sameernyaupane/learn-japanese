import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getEntries } from '~/models/jmdict';
import Navigation from '~/components/Navigation';

export const loader = async () => {
  const entries = await getEntries();
  return { entries };
};

export default function Index() {
  const { entries } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-xl mx-auto p-4 font-mono">
        {entries.map((entry) => (
          <div key={entry.id} className="mb-8 overflow-hidden rounded-xl bg-gray-50 shadow-md border border-gray-300">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-2 text-black">
                Entry #{entry.ent_seq}
              </h2>
              
              {/* Kanji Elements */}
              {entry.kanji_elements.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Kanji:</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.kanji_elements.map((kanji) => (
                      <span key={kanji.id} className="bg-blue-100 px-2 py-1 rounded">
                        {kanji.keb}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kana Elements */}
              {entry.kana_elements.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Kana:</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.kana_elements.map((kana) => (
                      <span key={kana.id} className="bg-green-100 px-2 py-1 rounded">
                        {kana.reb}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Senses */}
              {entry.senses.map((sense) => (
                <div key={sense.id} className="mb-4 p-3 bg-white rounded border">
                  {/* Parts of Speech */}
                  {sense.pos?.length > 0 && (
                    <div className="mb-2">
                      <span className="font-semibold">Parts of Speech:</span>{' '}
                      {sense.pos.join(', ')}
                    </div>
                  )}

                  {/* Glosses */}
                  <div className="mb-2">
                    <h4 className="font-semibold">Meanings:</h4>
                    <ul className="list-disc pl-5">
                      {sense.glosses.map((gloss) => (
                        <li key={gloss.id} className="text-black">
                          {gloss.gloss} ({gloss.lang})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  {sense.examples.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-semibold">Examples:</h4>
                      {sense.examples.map((example) => (
                        <div key={example.id} className="ml-2">
                          <p className="text-sm">{example.text}</p>
                          <p className="text-sm text-gray-600">- {example.translation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
