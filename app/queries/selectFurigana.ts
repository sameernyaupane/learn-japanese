import { sql } from '~/utils/db.server';

export const selectFurigana = sql`
  (
    SELECT json_agg(json_build_object(
      'ruby', elem->>'ruby',
      'rt', elem->>'rt'
    ))
    FROM jmdict_furigana jf
    CROSS JOIN jsonb_array_elements(jf.furigana) AS elem
    WHERE jf.entry_id = e.id
  ) as furigana
`; 