import { sql } from '~/utils/db.server';

export async function addToUserList(userId: string, entSeq: number) {
  return sql`
    INSERT INTO user_list (user_id, ent_seq)
    VALUES (${userId}, ${entSeq})
    ON CONFLICT (user_id, ent_seq) DO NOTHING
  `;
}

export async function removeFromUserList(userId: string, entSeq: number) {
  return sql`
    DELETE FROM user_list
    WHERE user_id = ${userId} AND ent_seq = ${entSeq}
  `;
}

export async function getUserList(userId: string, page: number = 1, perPage: number = 50) {
  const offset = (page - 1) * perPage;
  
  const [entries, count] = await Promise.all([
    sql`
      SELECT e.* 
      FROM jmdict_entries e
      INNER JOIN user_list ul ON e.ent_seq = ul.ent_seq
      WHERE ul.user_id = ${userId}
      ORDER BY ul.created_at DESC
      LIMIT ${perPage}
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