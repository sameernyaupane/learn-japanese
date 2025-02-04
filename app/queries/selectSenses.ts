import { sql } from '~/utils/db.server';

export const selectSenses = sql`
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
`; 