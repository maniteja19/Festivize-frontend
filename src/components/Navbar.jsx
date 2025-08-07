import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useYear } from '../contexts/YearContext'; // NEW: Import useYear
import { LogOut, Settings } from 'lucide-react'; // Using lucide-react for icons

const Navbar = ({ setCurrentPage }) => {
  const { logout } = useAuth();
  const { currentYear, setCurrentYear, availableYears, yearLoading, isAdmin } = useYear(); // NEW: Use year context

  const handleLogout = () => {
    logout();
    setCurrentPage('login'); // Redirect to login after logout
  };

  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
  };

  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="text-2xl font-bold mb-2 sm:mb-0">
          <button onClick={() => setCurrentPage('home')} className="hover:text-blue-200 transition duration-200">
            Festivize
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <button
            onClick={() => setCurrentPage('home')}
            className="py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('received-items')}
            className="py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Received Items
          </button>
          <button
            onClick={() => setCurrentPage('expenditures')}
            className="py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Expenditures
          </button>

          {/* Year Selector */}
          {!yearLoading && availableYears.length > 0 && (
            <div className="flex items-center space-x-2">
              <label htmlFor="year-select" className="text-white text-sm">Year:</label>
              <select
                id="year-select"
                value={currentYear}
                onChange={handleYearChange}
                className="bg-blue-600 text-white py-1 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {availableYears.map((yearObj) => (
                  <option key={yearObj.year} value={yearObj.year}>
                    {yearObj.year} {yearObj.isClosed ? '(Closed)' : '(Open)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Admin Year Management Link */}
          {isAdmin && (
            <button
              onClick={() => setCurrentPage('manage-years')}
              className="flex items-center py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200"
              title="Manage Years"
            >
              <Settings size={18} className="mr-2" /> Manage Years
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 transition duration-200"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
