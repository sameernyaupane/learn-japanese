import { sql } from '~/utils/db.server';
import { JMdictEntry } from '~/types/jmdict';
import { presentEntries } from '~/presenters/jmdictPresenter';
import { frequencyCondition } from '~/queries/frequencyCondition';
import { searchCondition } from '~/queries/searchCondition';
import { orderByCondition } from '~/queries/orderByCondition';
import { selectKanjiElements } from '~/queries/selectKanjiElements';
import { selectKanaElements } from '~/queries/selectKanaElements';
import { selectFurigana } from '~/queries/selectFurigana';
import { selectSenses } from '~/queries/selectSenses';
import { listCondition } from '~/queries/listCondition';
import { userListCondition } from '~/queries/userListCondition';

export async function getEntries(
  page: number = 1,
  perPage: number = 50,
  searchQuery: string = '',
  frequencyFilter: string = '',
  userId?: number | null,
  requireUserList: boolean = false
): Promise<{ entries: JMdictEntry[], totalEntries: number }> {
  const offset = (page - 1) * perPage;
  
  const [entriesResult, countResult] = await Promise.all([
    sql`
      SELECT
        e.id,
        e.ent_seq,
        ${listCondition(userId)} as is_in_list,
        ${selectKanjiElements},
        ${selectKanaElements},
        ${selectFurigana},
        ${selectSenses}
      FROM jmdict_entries e
      ${searchCondition(searchQuery)}
      ${frequencyCondition(frequencyFilter, searchQuery)}
      ${userListCondition(requireUserList, userId, searchQuery, frequencyFilter)}
      ${orderByCondition(searchQuery)}
      LIMIT ${perPage}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) 
      FROM jmdict_entries e
      ${searchCondition(searchQuery)}
      ${frequencyCondition(frequencyFilter, searchQuery)}
      ${userListCondition(requireUserList, userId, searchQuery, frequencyFilter)}
    `
  ]);

  const totalEntries = Number(countResult[0].count);
  
  return { 
    entries: await presentEntries(entriesResult),
    totalEntries 
  };
} 