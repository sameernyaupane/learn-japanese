import { sql } from '~/utils/db.server';
import { listCondition } from './listCondition';

export const userListCondition = (
  requireUserList: boolean,
  userId?: number | null,
  searchQuery?: string,
  frequencyFilter?: string
) => {
  if (!requireUserList || !userId) return sql``;
  
  const hasExistingConditions = !!searchQuery || !!frequencyFilter;
  const condition = listCondition(userId);
  
  return hasExistingConditions 
    ? sql`AND ${condition}`
    : sql`WHERE ${condition}`;
}; 