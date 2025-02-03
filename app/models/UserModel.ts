import * as argon2 from "argon2";
import { sql } from "~/utils/db.server";

type User = {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

export async function createUser(email: string, password: string) {
  const passwordHash = await argon2.hash(password);
  
  const [user] = await sql<User[]>`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email, created_at
  `;
  
  return user;
}

export async function findByEmail(email: string) {
  const [user] = await sql<User[]>`
    SELECT * FROM users 
    WHERE email = ${email}
    LIMIT 1
  `;
  return user || null;
}

export async function verifyLogin(email: string, password: string) {
  const user = await findByEmail(email);
  if (!user) return null;
  
  const isValid = await argon2.verify(user.password_hash, password);
  if (!isValid) return null;

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function getUserById(id: string) {
  const [user] = await sql<User[]>`
    SELECT id, email, created_at 
    FROM users 
    WHERE id = ${id}
    LIMIT 1
  `;
  return user || null;
}

export async function updateUser(
  id: string, 
  updates: { email?: string; password?: string }
) {
  let updatesQuery = sql``;
  
  if (updates.email) {
    updatesQuery = sql`email = ${updates.email}`;
  }
  
  if (updates.password) {
    const passwordHash = await argon2.hash(updates.password);
    updatesQuery = sql`
      ${updatesQuery}
      ${updatesQuery.text ? sql`,` : sql``} 
      password_hash = ${passwordHash}
    `;
  }

  const [user] = await sql<User[]>`
    UPDATE users
    SET ${updatesQuery}
    WHERE id = ${id}
    RETURNING id, email, created_at
  `;
  
  return user || null;
} 