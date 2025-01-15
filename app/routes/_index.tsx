import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getPhrases } from '~/models/phrase.server';
import Navigation from '~/components/Navigation';

export const loader = async () => {
  const phrases = await getPhrases();
  return { phrases };
};

export default function Index() {
  const { phrases } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-xl mx-auto p-4 font-mono">
        {phrases.map((phrase) => (
          <div key={phrase.id} className="mb-4 p-3 rounded-xl bg-gray-50 shadow-md border border-gray-300">
            <h2 className="text-lg font-bold mb-2 text-black">
              {phrase.order_number}. {phrase.english_text}
            </h2>
            
            {phrase.image_url && (
              <div className="mb-4 flex justify-center">
                <img 
                  src={phrase.image_url} 
                  alt={phrase.english_text}
                  className="rounded-lg shadow-md max-h-[280px] object-cover"
                />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      Romaji:
                    </td>
                    {phrase.translations.japanese_romaji.map((word, i) => (
                      <td key={i} className="px-2 py-2 text-center text-black">{word || '\u00A0'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      Japanese:
                    </td>
                    {phrase.translations.japanese.map((word, i) => (
                      <td key={i} className="px-2 py-2 text-center text-black">{word || '\u00A0'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      Nepali:
                    </td>
                    {phrase.translations.nepali.map((word, i) => (
                      <td key={i} className="px-2 py-2 text-center text-black">{word || '\u00A0'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      English:
                    </td>
                    {phrase.translations.english.map((word, i) => (
                      <td key={i} className="px-2 py-2 text-center text-black">{word || '\u00A0'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
