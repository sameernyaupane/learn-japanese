import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { login } from "~/services/auth.server";
import { getSession, commitSession } from "~/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const user = await login(email, password);
  if (!user) return json({ error: "Invalid credentials" });

  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", user.id);
  session.set("email", user.email);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}

export default function Login() {
  const data = useActionData<typeof action>();
  
  return (
    <div className="max-w-md mx-auto p-6">
      <Form method="post" className="space-y-4">
        <div>
          <label>Email</label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" required />
        </div>
        <button type="submit">Sign In</button>
        {data?.error && <p className="text-red-500">{data.error}</p>}
      </Form>
    </div>
  );
} 