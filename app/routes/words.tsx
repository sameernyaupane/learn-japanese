import { useLoaderData } from '@remix-run/react';
import { getAllWords } from '~/models/phrase.server';
import Navigation from '~/components/Navigation';

export const loader = async () => {
  const words = await getAllWords();
  return { words };
};

export default function Words() {
  const { words } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-xl mx-auto p-4 font-mono">
        {words.map((word) => (
          <div key={word.id} className="mb-4 p-3 rounded-xl bg-gray-50 shadow-md border border-gray-300">
            <h2 className="text-lg font-bold mb-2 text-black">
              {word.translations.japanese_romaji}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      Romaji:
                    </td>
                    <td className="px-2 py-2 text-center text-black">
                      {word.translations.japanese_romaji || '\u00A0'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      Japanese:
                    </td>
                    <td className="px-2 py-2 text-center text-black">
                      {word.translations.japanese || '\u00A0'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      Nepali:
                    </td>
                    <td className="px-2 py-2 text-center text-black">
                      {word.translations.nepali || '\u00A0'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold w-24 text-black">
                      English:
                    </td>
                    <td className="px-2 py-2 text-center text-black">
                      {word.translations.english || '\u00A0'}
                    </td>
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