import { Link, Form } from '@remix-run/react';
import { NavLink } from '@remix-run/react';

export default function Navigation({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-gray-800">
            Japanese Dictionary
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link to="/mylist" className="text-sm text-gray-600 hover:text-gray-800">
                  My List
                </Link>
                <Form method="post" action="/logout">
                  <button 
                    type="submit" 
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Logout
                  </button>
                </Form>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
            
            {/* Main navigation links - moved outside user conditional */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center border-b-2 px-1 pt-1 pb-2 text-sm font-medium`
              }
            >
              Entries
            </NavLink>
            <NavLink
              to="/words"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center border-b-2 px-1 pt-1 pb-2 text-sm font-medium`
              }
            >
              Practice
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}