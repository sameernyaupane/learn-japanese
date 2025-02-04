import { sql } from '~/utils/db.server';

export const selectKanjiElements = sql`
  (
    SELECT json_agg(json_build_object(
      'id', ke.id,
      'keb', ke.keb,
      'pri', ke.pri
    ))
    FROM kanji_elements ke
    WHERE ke.entry_id = e.id
  ) as kanji_elements
`; 