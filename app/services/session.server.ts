import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  userId: string;
  email: string;
};

export const { getSession, commitSession, destroySession } = 
  createCookieSessionStorage<SessionData>({
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET || "SECRET_BASE"],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  }); 