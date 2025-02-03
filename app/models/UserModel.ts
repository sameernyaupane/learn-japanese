import { hash, compare } from "bcryptjs";
import { sql } from "~/utils/db.server";

type User = {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

export async function createUser(email: string, password: string) {
  const passwordHash = await hash(password, 10);
  
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
  
  const isValid = await compare(password, user.password_hash);
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
    const passwordHash = await hash(updates.password, 10);
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