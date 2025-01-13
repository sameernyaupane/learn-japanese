import { sql } from '~/utils/db.server';
import type { Tense } from '~/utils/conjugation/types';

type Translation = {
  japanese: string[];
  japanese_romaji: string[];
  english: string[];
  nepali: string[];
};

type Phrase = {
  id: number;
  order_number: number;
  english_text: string;
  translations: Translation;
};

export async function getPhrases(tense: Tense): Promise<Phrase[]> {
  const phrases = await sql`
    WITH phrase_data AS (
      SELECT 
        p.id,
        p.order_number,
        s.english_text,
        pw.position,
        w.id as word_id,
        COALESCE(wf.form, t.text) as text,
        t.language
      FROM phrases p
      JOIN sentences s ON p.sentence_id = s.id
      JOIN phrase_words pw ON p.id = pw.phrase_id
      JOIN words w ON pw.word_id = w.id
      JOIN translations t ON w.id = t.word_id
      LEFT JOIN word_forms wf ON 
        w.id = wf.word_id AND 
        wf.tense = ${tense} AND 
        wf.language = t.language
      ORDER BY p.order_number, pw.position
    )
    SELECT 
      id,
      order_number,
      english_text,
      json_build_object(
        'japanese', array_agg(CASE WHEN language = 'japanese' THEN COALESCE(text, '') ELSE NULL END ORDER BY position),
        'japanese_romaji', array_agg(CASE WHEN language = 'japanese_romaji' THEN COALESCE(text, '') ELSE NULL END ORDER BY position),
        'english', array_agg(CASE WHEN language = 'english' THEN COALESCE(text, '') ELSE NULL END ORDER BY position),
        'nepali', array_agg(CASE WHEN language = 'nepali' THEN COALESCE(text, '') ELSE NULL END ORDER BY position)
      ) as translations
    FROM phrase_data
    GROUP BY id, order_number, english_text
    ORDER BY order_number;
  `;

  return phrases.map(phrase => ({
    ...phrase,
    translations: {
      japanese: phrase.translations.japanese.filter(x => x !== null),
      japanese_romaji: phrase.translations.japanese_romaji.filter(x => x !== null),
      english: phrase.translations.english.filter(x => x !== null),
      nepali: phrase.translations.nepali.filter(x => x !== null)
    }
  }));
} 