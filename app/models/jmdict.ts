import { sql } from '~/utils/db.server';
import { JMdictEntry } from '~/types/jmdict';
import { presentEntries } from '~/presenters/jmdictPresenter';

export async function getEntries(
  page: number = 1,
  perPage: number = 50,
  searchQuery: string = ''
): Promise<{ entries: JMdictEntry[], totalEntries: number }> {
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
            'ruby', elem->>'ruby',
            'rt', elem->>'rt'
          ))
          FROM jmdict_furigana jf
          CROSS JOIN jsonb_array_elements(jf.furigana) AS elem
          WHERE jf.entry_id = e.id
        ) as furigana,
        (
          SELECT json_agg(json_build_object(
            'id', s.id,
            'stagk', s.stagk,
            'stagr', s.stagr,
            'pos', s.pos,
            'xref', s.xref,
            'ant', s.ant,
            'field', s.field,
            'misc', s.misc,
            'dial', s.dial,
            'lsource', s.lsource,
            'glosses', (
              SELECT json_agg(json_build_object(
                'id', g.id,
                'gloss', g.gloss,
                'lang', g.lang,
                'g_gend', g.g_gend,
                'g_type', g.g_type
              ))
              FROM glosses g
              WHERE g.sense_id = s.id
            ),
            'examples', (
              SELECT json_agg(json_build_object(
                'id', ex.id,
                'source', ex.source,
                'text', ex.text,
                'sentences', ex.translation
              ))
              FROM examples ex
              WHERE ex.sense_id = s.id
            )
          ))
          FROM senses s
          WHERE s.entry_id = e.id
        ) as senses
      FROM jmdict_entries e
      ${
        searchQuery 
          ? sql`
            WHERE EXISTS (
              SELECT 1 FROM kanji_elements ke 
              WHERE ke.entry_id = e.id AND ke.keb ILIKE '%' || ${searchQuery} || '%'
            )
            OR EXISTS (
              SELECT 1 FROM kana_elements ka 
              WHERE ka.entry_id = e.id AND (
                ka.reb ILIKE '%' || ${searchQuery} || '%' OR 
                ka.romaji ILIKE '%' || ${searchQuery} || '%'
              )
            )
            OR EXISTS (
              SELECT 1 FROM senses s
              JOIN glosses g ON s.id = g.sense_id
              WHERE s.entry_id = e.id AND g.gloss ILIKE '%' || ${searchQuery} || '%'
            )
          `
          : sql``
      }
      ORDER BY
        CASE
          WHEN EXISTS (
            SELECT 1 FROM kana_elements ka 
            WHERE ka.entry_id = e.id 
            AND LOWER(ka.romaji) = LOWER(${searchQuery})
          ) THEN 1
          WHEN EXISTS (
            SELECT 1 FROM kana_elements ka 
            WHERE ka.entry_id = e.id 
            AND ka.romaji ILIKE '%' || ${searchQuery} || '%'
          ) THEN 2
          WHEN EXISTS (
            SELECT 1 FROM kanji_elements ke
            WHERE ke.entry_id = e.id AND ke.keb = ${searchQuery}
          ) THEN 3
          WHEN EXISTS (
            SELECT 1 FROM kana_elements ka
            WHERE ka.entry_id = e.id AND ka.reb = ${searchQuery}
          ) THEN 4
          WHEN EXISTS (
            SELECT 1 FROM kanji_elements ke
            WHERE ke.entry_id = e.id AND ke.keb ILIKE '%' || ${searchQuery} || '%'
          ) THEN 5
          WHEN EXISTS (
            SELECT 1 FROM kana_elements ka
            WHERE ka.entry_id = e.id AND ka.reb ILIKE '%' || ${searchQuery} || '%'
          ) THEN 6
          ELSE 7
        END,
        e.ent_seq ASC
      LIMIT ${perPage}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) 
      FROM jmdict_entries e
      ${
        searchQuery 
          ? sql`
            WHERE EXISTS (
              SELECT 1 FROM kanji_elements ke 
              WHERE ke.entry_id = e.id AND ke.keb ILIKE '%' || ${searchQuery} || '%'
            )
            OR EXISTS (
              SELECT 1 FROM kana_elements ka 
              WHERE ka.entry_id = e.id AND (
                ka.reb ILIKE '%' || ${searchQuery} || '%' OR 
                ka.romaji ILIKE '%' || ${searchQuery} || '%'
              )
            )
            OR EXISTS (
              SELECT 1 FROM senses s
              JOIN glosses g ON s.id = g.sense_id
              WHERE s.entry_id = e.id AND g.gloss ILIKE '%' || ${searchQuery} || '%'
            )
          `
          : sql``
      }
    `
  ]);

  const totalEntries = Number(countResult[0].count);
  
  return { 
    entries: await presentEntries(entriesResult),
    totalEntries 
  };
} 