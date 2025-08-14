// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useYear } from '../contexts/YearContext.jsx';
import { LogOut, Settings, Image as ImageIcon, Menu, X } from 'lucide-react';

const Navbar = ({ setCurrentPage }) => {
  const { isAuthenticated, logout } = useAuth();
  const { currentYear, setCurrentYear, availableYears, yearLoading, isAdmin } = useYear();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setCurrentPage('gallery'); // Redirect to gallery as public landing page
    setIsMobileMenuOpen(false); // Close menu on logout
  };

  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
    setIsMobileMenuOpen(false); // Close menu on year change
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center relative">
        <div className="text-2xl font-bold">
          <button onClick={() => handleNavClick(isAuthenticated ? 'home' : 'gallery')} className="hover:text-blue-200 transition duration-200">
            Festivize
          </button>
        </div>

        {/* Mobile menu toggle button and login button for public view */}
        
        <div className="xl:hidden flex items-center space-x-4">
          {!isAuthenticated && (
            <button onClick={() => handleNavClick('login')} className="flex items-center py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-800 transition duration-200">
              Login
            </button>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="flex items-center py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 transition duration-200">
              <LogOut size={18} className="mr-2" /> Logout
            </button>
          )}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden xl:flex items-center space-x-6">
          {/* Public links */}
          <button onClick={() => handleNavClick('gallery')} className="py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
            Gallery
          </button>
          {!isAuthenticated && (
            <button onClick={() => handleNavClick('login')} className="py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-800 transition duration-200">
              Login
            </button>
          )}

          {/* Authenticated links */}
          {isAuthenticated && (
            <>
              <button onClick={() => handleNavClick('home')} className="py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
                Dashboard
              </button>
              <button onClick={() => handleNavClick('received-items')} className="py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
                Received Items
              </button>
              <button onClick={() => handleNavClick('expenditures')} className="py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
                Expenditures
              </button>

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

              {isAdmin && (
                <button onClick={() => handleNavClick('manage-years')} className="flex items-center py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200" title="Manage Years">
                  <Settings size={18} className="mr-2" /> Manage Years
                </button>
              )}

              <button onClick={handleLogout} className="flex items-center py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 transition duration-200">
                <LogOut size={18} className="mr-2" /> Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu content */}
        <div className={`absolute top-full right-0 w-full bg-blue-700 shadow-lg p-4 z-50 transition-transform duration-300 ease-in-out xl:hidden ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col space-y-4">
            {/* Public links in mobile menu */}
            <button onClick={() => handleNavClick('gallery')} className="text-left py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
              Gallery
            </button>
            {!isAuthenticated && (
              <button onClick={() => handleNavClick('login')} className="text-left py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-800 transition duration-200">
                Login
              </button>
            )}

            {/* Authenticated links in mobile menu */}
            {isAuthenticated && (
              <>
                <button onClick={() => handleNavClick('home')} className="text-left py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
                  Dashboard
                </button>
                <button onClick={() => handleNavClick('received-items')} className="text-left py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
                  Received Items
                </button>
                <button onClick={() => handleNavClick('expenditures')} className="text-left py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200">
                  Expenditures
                </button>
                
                {!yearLoading && availableYears.length > 0 && (
                  <div className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-blue-600">
                    <label htmlFor="year-select-mobile" className="text-white text-sm">Year:</label>
                    <select
                      id="year-select-mobile"
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

                {isAdmin && (
                  <button onClick={() => handleNavClick('manage-years')} className="flex items-center text-left py-2 px-3 rounded-md hover:bg-blue-600 transition duration-200" title="Manage Years">
                    <Settings size={18} className="mr-2" /> Manage Years
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
