import { createCookie, createFileSessionStorage } from "@remix-run/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sessionCookie = createCookie("__session", {
  secrets: [process.env.SESSION_SECRET || "SECRET_BASE"],
  sameSite: "lax",
});

const sessionStorage = createFileSessionStorage({
  cookie: sessionCookie,
  dir: process.env.SESSION_DIR || path.join(__dirname, "../../sessions"),
});

export const { getSession, commitSession, destroySession } = sessionStorage; 