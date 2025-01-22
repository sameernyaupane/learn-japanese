import { sql } from '~/utils/db.server';

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
  image_url: string;
};

export async function getPhrases(): Promise<Phrase[]> {
  const phrases = await sql`
    WITH phrase_data AS (
      SELECT 
        p.id,
        p.order_number,
        s.english_text,
        s.image_url,
        pi.index_number,
        pi.text,
        pi.language
      FROM phrases p
      JOIN sentences s ON p.sentence_id = s.id
      JOIN phrase_indexes pi ON p.id = pi.phrase_id
      ORDER BY p.order_number, pi.index_number
    )
    SELECT 
      id,
      order_number,
      english_text,
      image_url,
      json_build_object(
        'japanese', array_agg(CASE WHEN language = 'japanese' THEN text ELSE NULL END ORDER BY index_number),
        'japanese_romaji', array_agg(CASE WHEN language = 'japanese_romaji' THEN text ELSE NULL END ORDER BY index_number),
        'english', array_agg(CASE WHEN language = 'english' THEN text ELSE NULL END ORDER BY index_number),
        'nepali', array_agg(CASE WHEN language = 'nepali' THEN text ELSE NULL END ORDER BY index_number)
      ) as translations
    FROM phrase_data
    GROUP BY id, order_number, english_text, image_url
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

export async function getAllWords() {
  const words = await sql`
    SELECT 
      w.id,
      w.japanese_text,
      w.image_url,
      json_build_object(
        'japanese', MAX(CASE WHEN t.language = 'japanese' THEN t.text END),
        'japanese_romaji', MAX(CASE WHEN t.language = 'japanese_romaji' THEN t.text END),
        'english', MAX(CASE WHEN t.language = 'english' THEN t.text END),
        'nepali', MAX(CASE WHEN t.language = 'nepali' THEN t.text END)
      ) as translations
    FROM words w
    LEFT JOIN translations t ON w.id = t.word_id
    GROUP BY w.id, w.japanese_text, w.image_url
    ORDER BY w.japanese_text;
  `;

  return words;
}