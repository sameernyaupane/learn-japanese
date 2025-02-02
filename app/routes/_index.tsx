import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getEntries } from '~/models/jmdict';
import Navigation from '~/components/Navigation';

const parsePartOfSpeech = (pos: string) => {
  const POS_MAP: { [key: string]: string } = {
    '&unc;': 'Ⓤ Unclassified',
    '&adj-i;': 'い-adjective',
    '&adj-na;': 'な-adjective',
    '&adj-ix;': 'い-adjective (yoi/ii)',
    '&adj-t;': 'たる-adjective',
    '&adv;': 'Adverb',
    '&adv-to;': 'Adverb taking the と particle',
    '&aux;': 'Auxiliary',
    '&aux-adj;': 'Auxiliary adjective',
    '&aux-v;': 'Auxiliary verb',
    '&conj;': 'Conjunction',
    '&cop;': 'Copula',
    '&ctr;': 'Counter',
    '&exp;': 'Expression',
    '&int;': 'Interjection',
    '&n;': 'Noun',
    '&n-adv;': 'Adverbial noun',
    '&n-pr;': 'Proper noun',
    '&n-pref;': 'Noun prefix',
    '&n-suf;': 'Noun suffix',
    '&n-t;': 'Temporal noun',
    '&num;': 'Numeric',
    '&pn;': 'Pronoun',
    '&pref;': 'Prefix',
    '&prt;': 'Particle',
    '&suf;': 'Suffix',
    '&v1;': 'Ichidan verb',
    '&v5;': 'Godan verb',
    '&v5aru;': 'Godan verb - -aru special class',
    '&v5k;': 'Godan verb (iku/yuku)',
    '&v5s;': 'Godan verb - -suru special class',
    '&v5u;': 'Godan verb - -u special class',
    '&v5z;': 'Godan verb - -zuru special class',
    '&vi;': 'Intransitive verb',
    '&vk;': 'Kuru verb',
    '&vn;': 'Irregular nu verb',
    '&vr;': 'Irregular ru verb',
    '&vs;': 'Suru verb',
    '&vs-c;': 'Su verb - precursor to the modern suru',
    '&vs-i;': 'Suru verb - irregular',
    '&vs-s;': 'Suru verb - special class',
    '&vt;': 'Transitive verb',
    '&vz;': 'Zuru verb',
  };

  return POS_MAP[pos] || pos.replace(/^&|;$/g, '');
};

export const loader = async () => {
  const entries = await getEntries();
  return { entries };
};

export default function Index() {
  const { entries } = useLoaderData<typeof loader>();

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
                    <div className="space-y-2">
                      <h3 className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        <span className="mr-2">あ</span>Kana Readings
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {entry.kana_elements.map((kana) => (
                          <span 
                            key={kana.id}
                            className="px-3 py-1.5 bg-green-50 text-green-800 rounded-lg font-medium text-sm"
                          >
                            {kana.reb}
                          </span>
                        ))}
                      </div>
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
                                {parsePartOfSpeech(pos)}
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
      </div>
    </div>
  );
}
