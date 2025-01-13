import { sql } from './db.server';
import type { Language } from '~/types';
import phrasesData from '../data/phrases.json';
import { conjugate } from './conjugation';

type PhraseData = typeof phrasesData.phrases[0];

async function seed() {
  try {
    await sql`TRUNCATE phrases, phrase_words, translations, words, sentences, word_forms CASCADE`;

    const wordMap = new Map<string, number>();
    let emptyWordCounter = 0;

    for (let phraseIndex = 0; phraseIndex < phrasesData.phrases.length; phraseIndex++) {
      const phrase = phrasesData.phrases[phraseIndex];
      
      console.log(`Processing phrase ${phraseIndex + 1}: ${phrase.sentence}`);

      const [sentenceRecord] = await sql`
        INSERT INTO sentences (english_text)
        VALUES (${phrase.sentence})
        RETURNING id
      `;

      const [phraseRecord] = await sql`
        INSERT INTO phrases (order_number, sentence_id)
        VALUES (${phraseIndex + 1}, ${sentenceRecord.id})
        RETURNING id
      `;

      // Use Japanese as reference for positions since it has all particles
      const referenceLength = phrase.translations.japanese.length;

      for (let position = 0; position < referenceLength; position++) {
        const japaneseWord = phrase.translations.japanese[position];
        const romajiWord = phrase.translations.japanese_romaji[position];
        const englishWord = phrase.translations.english[position] || '';
        const nepaliWord = phrase.translations.nepali[position] || '';

        let wordId: number;

        // Always create a word record for each position, even if empty
        const wordKey = englishWord || `empty_${position}_${phraseIndex}`;
        
        if (wordMap.has(wordKey)) {
          wordId = wordMap.get(wordKey)!;
        } else {
          const [wordRecord] = await sql`
            INSERT INTO words (english_text)
            VALUES (${wordKey})
            RETURNING id
          `;
          wordId = wordRecord.id;
          wordMap.set(wordKey, wordId);

          // Insert translations
          await sql`
            INSERT INTO translations (word_id, language, text)
            VALUES 
              (${wordId}, 'japanese', ${japaneseWord}),
              (${wordId}, 'japanese_romaji', ${romajiWord}),
              (${wordId}, 'english', ${englishWord}),
              (${wordId}, 'nepali', ${nepaliWord})
          `;

          // Add word forms for each language and tense
          const languages: Language[] = ['japanese', 'japanese_romaji', 'english', 'nepali'];
          const tenses = [
            'simple-present',
            'present-continuous',
            'present-perfect',
            'simple-past',
            'past-continuous',
            'past-perfect',
            'simple-future'
          ] as const;

          for (const language of languages) {
            const baseWord = {
              japanese: japaneseWord,
              japanese_romaji: romajiWord,
              english: englishWord,
              nepali: nepaliWord
            }[language];

            for (const tense of tenses) {
              // Get previous words for context
              const prevWords = position > 0 ? 
                phrase.translations[language].slice(0, position) : 
                [];
              
              const conjugatedForm = conjugate(
                baseWord, 
                language, 
                tense, 
                { prevWords }
              );
              
              if (conjugatedForm !== baseWord) {
                await sql`
                  INSERT INTO word_forms (word_id, language, tense, form)
                  VALUES (${wordId}, ${language}, ${tense}, ${conjugatedForm})
                `;
              }
            }
          }
        }

        // Always insert phrase_words to maintain position
        await sql`
          INSERT INTO phrase_words (phrase_id, word_id, position)
          VALUES (${phraseRecord.id}, ${wordId}, ${position})
        `;
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