import { sql } from '~/utils/db.server';

export const selectKanaElements = sql`
  (
    SELECT json_agg(json_build_object(
      'id', ka.id,
      'reb', ka.reb,
      'pri', ka.pri,
      'romaji', ka.romaji
    ))
    FROM kana_elements ka
    WHERE ka.entry_id = e.id
  ) as kana_elements
`; 