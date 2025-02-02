import { sql } from '~/utils/db.server';
import { getJapaneseAudioUrl } from '~/utils/text-to-speech.server';

export interface JMdictEntry {
  id: number;
  ent_seq: number;
  kanji_elements: Array<{
    id: number;
    keb: string;
    pri: string[];
  }>;
  kana_elements: Array<{
    id: number;
    reb: string;
    pri: string[];
    romaji: string;
  }>;
  senses: Array<{
    id: number;
    pos: string[];
    field: string[];
    misc: string[];
    dial: string[];
    glosses: Array<{
      id: number;
      gloss: string;
      lang: string;
    }>;
    examples: Array<{
      id: number;
      text: string;
      translation: string;
      source?: string;
    }>;
  }>;
  audio?: string[];
}

export interface JMdictSense {
  id: number;
  pos: string[];
  field: string[];
  misc: string[];
  dial: string[];
  glosses: Array<{
    id: number;
    gloss: string;
    lang: string;
  }>;
  examples: Array<{
    id: number;
    text: string;
    translation: string;
    source?: string;
  }>;
}

export async function getEntries(page: number = 1, perPage: number = 50): Promise<{ entries: JMdictEntry[], totalEntries: number }> {
  const offset = (page - 1) * perPage;
  
  const [entriesResult, countResult] = await Promise.all([
    sql`
      SELECT
        e.id,
        e.ent_seq,
        (
          SELECT json_agg(json_build_object(
            'id', ke.id,
            'keb', ke.keb,
            'pri', ke.pri
          ))
          FROM kanji_elements ke
          WHERE ke.entry_id = e.id
        ) as kanji_elements,
        (
          SELECT json_agg(json_build_object(
            'id', ka.id,
            'reb', ka.reb,
            'pri', ka.pri,
            'romaji', ka.romaji
          ))
          FROM kana_elements ka
          WHERE ka.entry_id = e.id
        ) as kana_elements,
        (
          SELECT json_agg(json_build_object(
            'id', s.id,
            'pos', s.pos,
            'field', s.field,
            'misc', s.misc,
            'dial', s.dial,
            'glosses', (
              SELECT json_agg(json_build_object(
                'id', g.id,
                'gloss', g.gloss,
                'lang', g.lang
              ))
              FROM glosses g
              WHERE g.sense_id = s.id
            ),
            'examples', (
              SELECT json_agg(json_build_object(
                'id', ex.id,
                'text', ex.text,
                'translation', ex.translation,
                'source', ex.source
              ))
              FROM examples ex
              WHERE ex.sense_id = s.id
            )
          ))
          FROM senses s
          WHERE s.entry_id = e.id
        ) as senses
      FROM jmdict_entries e
      ORDER BY e.ent_seq ASC
      LIMIT ${perPage}
      OFFSET ${offset}
    `,
    sql`SELECT COUNT(*) FROM jmdict_entries`
  ]);

  const totalEntries = Number(countResult[0].count);
  
  const parsePartOfSpeech = (pos: string) => {
    const POS_MAP: { [key: string]: string } = {
      '&unc;': 'Ⓤ Unclassified',
      '&adj-i;': 'い-adjective',
      // ... rest of your existing POS mapping ...
    };
    return POS_MAP[pos] || pos.replace(/^&|;$/g, '');
  };

  const entries = await Promise.all(entriesResult.map(async (entry) => ({
    ...entry,
    audio: [
      await getJapaneseAudioUrl(entry.kana_elements[0]?.reb)
    ].filter(Boolean),
    kanji_elements: entry.kanji_elements || [],
    kana_elements: entry.kana_elements || [],
    senses: entry.senses?.map(sense => ({
      ...sense,
      pos: (sense.pos || []).map(parsePartOfSpeech),
      field: sense.field || [],
      misc: sense.misc || [],
      dial: sense.dial || [],
      glosses: sense.glosses || [],
      examples: sense.examples || []
    })) || []
  })));

  return { entries, totalEntries };
} 