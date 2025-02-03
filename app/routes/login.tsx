import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { login, commitSession } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  
  const user = await login(email);
  if (!user) return json({ error: "Invalid email" });

  const session = await getSession();
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
        <button type="submit">Sign In</button>
        {data?.error && <p className="text-red-500">{data.error}</p>}
      </Form>
    </div>
  );
} 