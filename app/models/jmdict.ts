import { sql } from '~/utils/db.server';

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
}

export async function getEntries(): Promise<JMdictEntry[]> {
  const entries = await sql`
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
          'pri', ka.pri
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
  `;

  return entries.map(entry => ({
    ...entry,
    kanji_elements: entry.kanji_elements || [],
    kana_elements: entry.kana_elements || [],
    senses: entry.senses?.map(sense => ({
      ...sense,
      pos: sense.pos || [],
      field: sense.field || [],
      misc: sense.misc || [],
      dial: sense.dial || [],
      glosses: sense.glosses || [],
      examples: sense.examples || []
    })) || []
  }));
} 