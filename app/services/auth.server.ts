import type { User } from "@prisma/client";
import { getSession, commitSession, destroySession } from "./session.server";

// Mock user database
const users: User[] = [
  { id: "1", email: "user@example.com" }
];

export async function login(email: string) {
  const user = users.find(u => u.email === email);
  if (!user) return null;
  return user;
}

export async function checkAuth(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("userId") ? { 
    id: session.get("userId"), 
    email: session.get("email") 
  } : null;
}

export async function requireAuth(request: Request) {
  const user = await checkAuth(request);
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}
