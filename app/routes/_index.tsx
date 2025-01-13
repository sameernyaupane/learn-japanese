import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { getPhrases } from '~/models/phrase.server';
import type { Tense } from '~/utils/conjugation/types';
import TenseDropdown from '~/components/TenseDropdown';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const currentTense = (url.searchParams.get('tense') || 'simple-present') as Tense;
  const phrases = await getPhrases(currentTense);
  return json({ 
    phrases,
    currentTense
  });
};

export default function Index() {
  const { phrases, currentTense } = useLoaderData<typeof loader>();

  return (
    <div className="p-8 font-mono">
      <div className="mb-4">
        <Form method="get">
          <TenseDropdown
            value={currentTense}
            onChange={(tense) => {
              const form = document.createElement('form');
              form.method = 'get';
              form.innerHTML = `<input name="tense" value="${tense}">`;
              document.body.appendChild(form);
              form.submit();
            }}
            className="w-full md:w-auto"
          />
        </Form>
      </div>

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
