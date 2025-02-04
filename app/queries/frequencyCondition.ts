import { sql } from '~/utils/db.server';

export const frequencyCondition = (frequencyFilter: string, searchQuery: string) => {
    if (!frequencyFilter) return sql``;
    
    const hasSearch = !!searchQuery;
    let condition;
    
    switch(frequencyFilter) {
      case 'news1':
      case 'ichi1':
        condition = sql`(
          EXISTS (SELECT 1 FROM kanji_elements ke 
            WHERE ke.entry_id = e.id AND ke.pri @> jsonb_build_array(${frequencyFilter}::text))
          OR EXISTS (SELECT 1 FROM kana_elements ka 
            WHERE ka.entry_id = e.id AND ka.pri @> jsonb_build_array(${frequencyFilter}::text))
        )`;
        break;
      case 'nf01-nf12':
        condition = sql`(
          EXISTS (SELECT 1 FROM kanji_elements ke 
            WHERE ke.entry_id = e.id AND EXISTS (SELECT 1 FROM unnest(ke.pri) p WHERE p BETWEEN 'nf01' AND 'nf12'))
          OR EXISTS (SELECT 1 FROM kana_elements ka 
            WHERE ka.entry_id = e.id AND EXISTS (SELECT 1 FROM unnest(ka.pri) p WHERE p BETWEEN 'nf01' AND 'nf12'))
        )`;
        break;
      case 'nf13-nf24':
        condition = sql`(
          EXISTS (SELECT 1 FROM kanji_elements ke 
            WHERE ke.entry_id = e.id AND EXISTS (SELECT 1 FROM unnest(ke.pri) p WHERE p BETWEEN 'nf13' AND 'nf24'))
          OR EXISTS (SELECT 1 FROM kana_elements ka 
            WHERE ka.entry_id = e.id AND EXISTS (SELECT 1 FROM unnest(ka.pri) p WHERE p BETWEEN 'nf13' AND 'nf24'))
        )`;
        break;
      case 'uncommon':
        condition = sql`(
          NOT EXISTS (SELECT 1 FROM kanji_elements ke 
            WHERE ke.entry_id = e.id AND (ke.pri @> jsonb_build_array('news1'::text, 'ichi1'::text) OR ke.pri::text ~ '^nf'))
          AND NOT EXISTS (SELECT 1 FROM kana_elements ka 
            WHERE ka.entry_id = e.id AND (ka.pri @> jsonb_build_array('news1'::text, 'ichi1'::text) OR ka.pri::text ~ '^nf'))
        )`;
        break;
      default:
        return sql``;
    }

    return hasSearch ? sql`AND ${condition}` : sql`WHERE ${condition}`;
  };