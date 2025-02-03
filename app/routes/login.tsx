import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await authenticator.authenticate("user-pass", request, {
      successRedirect: "/",
      throwOnError: true,
    });
  } catch (error) {
    return json({ error: "Invalid email or password" });
  }
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