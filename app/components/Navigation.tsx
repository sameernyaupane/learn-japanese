import { Link, useFetcher } from '@remix-run/react';
import { NavLink } from '@remix-run/react';

export default function Navigation({ isLoggedIn }: { isLoggedIn: boolean }) {
  const logoutFetcher = useFetcher();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-gray-800">
            Japanese Dictionary
          </Link>
          <div className="flex items-center gap-4">
            <NavLink
                to="/"
                className={({ isActive }) =>
                  `${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium`
                }
              >
                Entries
            </NavLink>

            <NavLink 
              to="/mylist" 
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-200`
              }
            >
              My List
            </NavLink>

            <NavLink
              to="/sentences"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium`
              }
            >
              Sentences
            </NavLink>

            {isLoggedIn ? (
              <>
                <NavLink 
                  to="/logout"
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-200`
                  }
                >
                  Logout
                </NavLink>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-200`
                  }
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/signup" 
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium`
                  }
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}