import { createFileSessionStorage, redirect } from "@remix-run/node";
import { verifyLogin, getUserById } from "~/models/UserModel";
import path from "node:path";

const sessionDir = path.join(process.cwd(), "sessions");

const { getSession, commitSession, destroySession } = 
  createFileSessionStorage({
    dir: sessionDir,
    
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET!],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }
  });

export async function getAuthSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getAuthSession(request);
  return session.get("userId");
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return user;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  return userId ? getUserById(userId) : null;
}

export async function login(email: string, password: string) {
  const user = await verifyLogin(email, password);
  if (!user) return null;
  
  const session = await getSession();
  session.set("userId", user.id);
  session.set("email", user.email);
  
  return { user, cookie: await commitSession(session) };
}

export async function logout(request: Request) {
  const session = await getAuthSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  });
}
