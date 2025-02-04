import { sql } from '~/utils/db.server';

export const listCondition = (userId?: number | null) => {
  return userId ? 
    sql`EXISTS (
      SELECT 1 FROM user_list 
      WHERE user_id = ${userId} AND ent_seq = e.ent_seq
    )` 
    : sql`FALSE`;
}; 