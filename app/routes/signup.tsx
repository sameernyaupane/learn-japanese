import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { createUser } from "~/models/UserModel";
import { getSession, commitSession } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // Basic validation
  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Email and password are required" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const user = await createUser(email, password);
    const session = await getSession();
    session.set("userId", user.id);
    session.set("email", user.email);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      },
      status: 302
    });
  } catch (error) {
    let errorMessage = "Registration failed. Please try again.";
    
    // Handle specific database error (PostgreSQL example)
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      errorMessage = "This email is already registered.";
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export default function Signup() {
  const data = useActionData<typeof action>();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Japanese Dictionary</h1>
          <p className="text-gray-600">Create a new account</p>
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
                autoComplete="new-password"
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
            Create Account
          </button>

          {data?.error && (
            <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-lg">
              {data.error}
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
} 