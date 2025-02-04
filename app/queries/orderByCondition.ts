import { sql } from '~/utils/db.server';

export const orderByCondition = (searchQuery: string) => {
  if (!searchQuery) return sql`ORDER BY e.ent_seq ASC`;
  
  return sql`
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
  `;
}; 