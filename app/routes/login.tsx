import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { login } from "~/services/auth.server";
import { getSession, commitSession } from "~/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const response = await login(email, password);

  if (!response) return json({ error: "Invalid credentials" });

  return redirect("/", {
    headers: {
      "Set-Cookie": response.cookie
    }
  });
}

export default function Login() {
  const data = useActionData<typeof action>();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Japanese Dictionary</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Form 
          method="post" 
          className="bg-white shadow-lg rounded-xl p-8 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            Sign in
          </button>

          {data?.error && (
            <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-lg">
              {data.error}
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
} 