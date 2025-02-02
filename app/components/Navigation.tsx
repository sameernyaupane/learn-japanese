import { NavLink } from '@remix-run/react';

export default function Navigation() {
  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex space-x-8">
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
    </nav>
  );
}