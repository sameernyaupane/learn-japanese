import { sql } from '~/utils/db.server';
import { presentEntries } from '~/presenters/jmdictPresenter';

export async function addToUserList(userId: number, entSeq: number) {
  return sql`
    INSERT INTO user_list (user_id, ent_seq)
    VALUES (${userId}, ${entSeq})
    ON CONFLICT (user_id, ent_seq) DO NOTHING
  `;
}

export async function removeFromUserList(userId: number, entSeq: number) {
  return sql`
    DELETE FROM user_list
    WHERE user_id = ${userId} AND ent_seq = ${entSeq}
  `;
}

export async function getUserList(
  userId: number,
  page: number,
  pageSize: number,
  searchQuery: string
) {
  const offset = (page - 1) * pageSize;
  
  const [entries, count] = await Promise.all([
    sql`
      SELECT e.* 
      FROM jmdict_entries e
      INNER JOIN user_list ul ON e.ent_seq = ul.ent_seq
      WHERE ul.user_id = ${userId}
      ORDER BY ul.created_at DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*)
      FROM user_list
      WHERE user_id = ${userId}
    `
  ]);

  return {
    entries: await presentEntries(entries),
    totalEntries: Number(count[0].count)
  };
} 