import { sql } from './db.server';
import phrasesData from '../data/phrases.json';

async function seed() {
  try {
    await sql`TRUNCATE phrases, phrase_indexes, translations, words, sentences CASCADE`;

    const wordMap = new Map<string, number>();

    for (let phraseIndex = 0; phraseIndex < phrasesData.phrases.length; phraseIndex++) {
      const phrase = phrasesData.phrases[phraseIndex];
      
      console.log(`Processing phrase ${phraseIndex + 1}: ${phrase.sentence}`);

      const [sentenceRecord] = await sql`
        INSERT INTO sentences (english_text, image_url)
        VALUES (${phrase.sentence}, ${phrase.image_url || null})
        RETURNING id
      `;

      const [phraseRecord] = await sql`
        INSERT INTO phrases (order_number, sentence_id)
        VALUES (${phraseIndex + 1}, ${sentenceRecord.id})
        RETURNING id
      `;

      const referenceLength = phrase.translations.japanese.length;

      for (let position = 0; position < referenceLength; position++) {
        const japaneseWord = phrase.translations.japanese[position];
        const romajiWord = phrase.translations.japanese_romaji[position];
        const englishWord = phrase.translations.english[position] || '';
        const nepaliWord = phrase.translations.nepali[position] || '';

        // Insert phrase indexes
        await sql`
          INSERT INTO phrase_indexes (phrase_id, index_number, text, language)
          VALUES 
            (${phraseRecord.id}, ${position}, ${japaneseWord}, 'japanese'),
            (${phraseRecord.id}, ${position}, ${romajiWord}, 'japanese_romaji'),
            (${phraseRecord.id}, ${position}, ${englishWord}, 'english'),
            (${phraseRecord.id}, ${position}, ${nepaliWord}, 'nepali')
        `;

        // Only store unique words in the words table
        if (englishWord) {
          if (!wordMap.has(englishWord)) {
            const [wordRecord] = await sql`
              INSERT INTO words (english_text)
              VALUES (${englishWord})
              RETURNING id
            `;
            const wordId = wordRecord.id;
            wordMap.set(englishWord, wordId);

            await sql`
              INSERT INTO translations (word_id, language, text)
              VALUES 
                (${wordId}, 'japanese', ${japaneseWord}),
                (${wordId}, 'japanese_romaji', ${romajiWord}),
                (${wordId}, 'english', ${englishWord}),
                (${wordId}, 'nepali', ${nepaliWord})
            `;
          }
        }
      }
    }

    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
}); 