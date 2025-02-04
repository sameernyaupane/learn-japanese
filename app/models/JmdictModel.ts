import { sql } from '~/utils/db.server';
import { JMdictEntry } from '~/types/jmdict';
import { presentEntries } from '~/presenters/jmdictPresenter';
import { frequencyCondition } from '~/queries/frequencyCondition';
import { searchCondition } from '~/queries/searchCondition';
import { orderByCondition } from '~/queries/orderByCondition';

export async function getEntries(
  page: number = 1,
  perPage: number = 50,
  searchQuery: string = '',
  frequencyFilter: string = '',
  userId?: number | null
): Promise<{ entries: JMdictEntry[], totalEntries: number }> {
  const offset = (page - 1) * perPage;
  
  const [entriesResult, countResult] = await Promise.all([
    sql`
      SELECT
        e.id,
        e.ent_seq,
        ${
          userId ? 
          sql`EXISTS (
            SELECT 1 FROM user_list 
            WHERE user_id = ${userId} AND ent_seq = e.ent_seq
          )` 
          : sql`FALSE`
        } as is_in_list,
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
      ${searchCondition(searchQuery)}
      ${frequencyCondition(frequencyFilter, searchQuery)}
      ${orderByCondition(searchQuery)}
      LIMIT ${perPage}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) 
      FROM jmdict_entries e
      ${searchCondition(searchQuery)}
      ${frequencyCondition(frequencyFilter, searchQuery)}
    `
  ]);

  const totalEntries = Number(countResult[0].count);
  
  return { 
    entries: await presentEntries(entriesResult),
    totalEntries 
  };
} 