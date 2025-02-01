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
          <div key={word.id} className="mb-8 overflow-hidden rounded-xl bg-gray-50 shadow-md border border-gray-300">
            {word.image_url && (
              <div className="w-full h-60 overflow-hidden">
                <img 
                  src={word.image_url} 
                  alt={word.translations.english || word.translations.japanese_romaji}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex flex-row items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-black">
                  {word.translations.japanese_romaji}
                </h2>
                {word.translations.japanese && (
                  <button 
                    onClick={() => document.getElementById(`audio-${word.id}`)?.play()}
                    onMouseEnter={() => document.getElementById(`audio-${word.id}`)?.play()}
                    onMouseLeave={() => {
                      const audio = document.getElementById(`audio-${word.id}`);
                      if (audio) {
                        audio.pause();
                        audio.currentTime = 0;
                      }
                    }}
                    className="p-1 rounded hover:bg-gray-100 transition-colors inline-flex items-center"
                    aria-label="Play pronunciation"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-4 h-4 text-gray-600"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75" 
                      />
                    </svg>
                    <audio 
                      id={`audio-${word.id}`}
                      src={`/audio/${word.translations.japanese}.mp3`}
                      className="hidden"
                    />
                  </button>
                )}
              </div>
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
          </div>
        ))}
      </div>
    </div>
  );
} 