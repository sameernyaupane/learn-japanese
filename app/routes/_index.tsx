import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getPhrases } from '~/models/phrase.server';

export const loader = async () => {
  const phrases = await getPhrases();
  return json({ phrases });
};

export default function Index() {
  const { phrases } = useLoaderData<typeof loader>();

  return (
    <div className="p-8 font-mono">
      {phrases.map((phrase) => (
        <div key={phrase.id} className="mb-8">
          <h2 className="text-base font-bold mb-2">
            {phrase.order_number}. {phrase.english_text}
          </h2>
          <table className="border-collapse mb-8">
            <tbody>
              <tr>
                <td className="py-2 pr-4 whitespace-nowrap">Japanese (Romaji):</td>
                {phrase.translations.japanese_romaji.map((word, i) => (
                  <td key={i} className="px-3 py-2">{word || '\u00A0'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-4 whitespace-nowrap">Japanese:</td>
                {phrase.translations.japanese.map((word, i) => (
                  <td key={i} className="px-3 py-2">{word || '\u00A0'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-4 whitespace-nowrap">Nepali:</td>
                {phrase.translations.nepali.map((word, i) => (
                  <td key={i} className="px-3 py-2">{word || '\u00A0'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-4 whitespace-nowrap">English:</td>
                {phrase.translations.english.map((word, i) => (
                  <td key={i} className="px-3 py-2">{word || '\u00A0'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
