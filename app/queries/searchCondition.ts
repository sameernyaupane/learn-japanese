import { sql } from '~/utils/db.server';

export const searchCondition = (searchQuery: string) => {
  if (!searchQuery) return sql``;
  
  return sql`
    WHERE EXISTS (
      SELECT 1 FROM (
        SELECT keb AS term FROM kanji_elements WHERE entry_id = e.id
        UNION
        SELECT reb AS term FROM kana_elements WHERE entry_id = e.id
        UNION
        SELECT romaji AS term FROM kana_elements WHERE entry_id = e.id
        UNION
        SELECT gloss AS term FROM glosses WHERE sense_id IN (
          SELECT id FROM senses WHERE entry_id = e.id
        )
      ) search_target
      WHERE search_target.term ILIKE '%' || ${searchQuery} || '%'
    )
  `;
}; 