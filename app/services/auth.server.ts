import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";

type User = {
  id: string;
  email: string;
};

export const authenticator = new Authenticator<User>(sessionStorage);

// Mock user database
const users: User[] = [
  { id: "1", email: "user@example.com" }
];

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const user = users.find(u => u.email === email);
    
    if (!user) throw new Error("Invalid credentials");
    return user;
  }),
  "user-pass"
); 