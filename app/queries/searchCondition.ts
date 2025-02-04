import { sql } from '~/utils/db.server';

export const searchCondition = (searchQuery: string) => {
  if (!searchQuery) return sql``;
  
  return sql`
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
  `;
}; 