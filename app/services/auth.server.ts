import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { verifyLogin, getUserById } from "~/models/UserModel";

// Session configuration remains the same
const { getSession: getRawSession, commitSession, destroySession } = 
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET || "SECRET_BASE"],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  });

export async function getAuthSession(request: Request) {
  return getRawSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getAuthSession(request);
  return session.get("userId");
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) throw redirect("/login");
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  return userId ? getUserById(userId) : null;
}

export async function login({ email, password }: { email: string; password: string }) {
  const user = await verifyLogin(email, password);
  if (!user) return null;
  
  const session = await getRawSession();
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
