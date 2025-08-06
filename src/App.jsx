import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { YearProvider } from './contexts/YearContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/Homepage';
import ReceivedItemsPage from './pages/ReceivedItemsPage';
import ExpendituresPage from './pages/ExpendituresPage';
import YearManagementPage from './pages/YearManagementPage';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');

  if (authLoading) { // Use authLoading here
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, show login/register pages
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {currentPage === 'login' && <LoginPage onSwitchToRegister={() => setCurrentPage('register')} />}
        {currentPage === 'register' && <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />}
        {/* Default to login if no specific page is set */}
        {currentPage !== 'login' && currentPage !== 'register' && <LoginPage onSwitchToRegister={() => setCurrentPage('register')} />}
      </div>
    );
  }

  // If authenticated, show main app content wrapped with YearProvider
  return (
    <YearProvider> {/* NEW: Wrap authenticated content with YearProvider */}
      <div className="min-h-screen bg-gray-50">
        <Navbar setCurrentPage={setCurrentPage} />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {(() => {
            switch (currentPage) {
              case 'home':
                return <HomePage />;
              case 'received-items':
                return <ReceivedItemsPage />;
              case 'expenditures':
                return <ExpendituresPage />;
              case 'manage-years': // NEW: Route for YearManagementPage
                return <YearManagementPage />;
              default:
                return <HomePage />; // Default authenticated page
            }
          })()}
        </main>
      </div>
    </YearProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
