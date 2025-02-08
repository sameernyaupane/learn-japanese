import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import sentences from "~/data/sentences.json";

export async function loader() {
  return json(sentences.sentences);
}

export default function SentencesPage() {
  const sentences = useLoaderData<typeof loader>();

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Sentences
        </h1>
        <div className="grid grid-cols-1 gap-6">
        {sentences.map((sentence, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200">
            {sentence.image_url && (
              <div className="w-full h-48 bg-gray-100 overflow-hidden border-b border-gray-200 rounded-t-lg">
                <img
                  src={sentence.image_url}
                  alt={sentence.english}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            <div className="p-4 space-y-2">
              <div className="text-lg font-semibold text-gray-900 line-clamp-2">
                {sentence.english}
              </div>

              <div className="space-y-2">
                <div className="text-base">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {sentence.translations.japanese.map((word, i) => (
                          <th
                            key={i}
                            className="text-sm font-medium text-gray-700 p-2 border-b border-gray-200 text-center align-middle"
                          >
                            {word}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['japanese_romaji'],
                        ['nepali'],
                        ['english']
                      ].map(([key]) => (
                        <tr key={key}>
                          {sentence.translations[key].map((word, i) => (
                            <td
                              key={i}
                              className="p-2 align-middle text-center text-gray-800"
                            >
                              {word}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 