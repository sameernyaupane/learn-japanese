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
};

type PhraseWithImage = Phrase & {
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
        pw.position,
        w.id as word_id,
        t.text,
        t.language
      FROM phrases p
      JOIN sentences s ON p.sentence_id = s.id
      JOIN phrase_words pw ON p.id = pw.phrase_id
      JOIN words w ON pw.word_id = w.id
      JOIN translations t ON w.id = t.word_id
      ORDER BY p.order_number, pw.position
    )
    SELECT 
      id,
      order_number,
      english_text,
      image_url,
      json_build_object(
        'japanese', array_agg(CASE WHEN language = 'japanese' THEN text ELSE NULL END ORDER BY position),
        'japanese_romaji', array_agg(CASE WHEN language = 'japanese_romaji' THEN text ELSE NULL END ORDER BY position),
        'english', array_agg(CASE WHEN language = 'english' THEN text ELSE NULL END ORDER BY position),
        'nepali', array_agg(CASE WHEN language = 'nepali' THEN text ELSE NULL END ORDER BY position)
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

export async function getPhraseWithImage(phraseId: number): Promise<PhraseWithImage | null> {
  const [phrase] = await sql<PhraseWithImage[]>`
    SELECT 
      p.id,
      p.order_number,
      s.english_text,
      s.image_url,
      json_build_object(
        'japanese', array_agg(CASE WHEN t.language = 'japanese' THEN t.text ELSE NULL END ORDER BY pw.position),
        'japanese_romaji', array_agg(CASE WHEN t.language = 'japanese_romaji' THEN t.text ELSE NULL END ORDER BY pw.position),
        'english', array_agg(CASE WHEN t.language = 'english' THEN t.text ELSE NULL END ORDER BY pw.position),
        'nepali', array_agg(CASE WHEN t.language = 'nepali' THEN t.text ELSE NULL END ORDER BY pw.position)
      ) as translations
    FROM phrases p
    JOIN sentences s ON p.sentence_id = s.id
    JOIN phrase_words pw ON p.id = pw.phrase_id
    JOIN words w ON pw.word_id = w.id
    JOIN translations t ON w.id = t.word_id
    WHERE p.id = ${phraseId}
    GROUP BY p.id, p.order_number, s.english_text, s.image_url;
  `;

  if (!phrase) return null;

  return {
    ...phrase,
    translations: {
      japanese: phrase.translations.japanese.filter(x => x !== null),
      japanese_romaji: phrase.translations.japanese_romaji.filter(x => x !== null),
      english: phrase.translations.english.filter(x => x !== null),
      nepali: phrase.translations.nepali.filter(x => x !== null)
    }
  };
} 