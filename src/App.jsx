// src/App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { YearProvider } from './contexts/YearContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ReceivedItemsPage from './pages/ReceivedItemsPage.jsx';
import ExpendituresPage from './pages/ExpendituresPage.jsx';
import YearManagementPage from './pages/YearManagementPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import Navbar from './components/Navbar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

const AppContent = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('gallery');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('token')) {
      setCurrentPage('reset-password');
    } else if (isAuthenticated) {
      setCurrentPage('home');
    } else {
      setCurrentPage('gallery');
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle routing for all users
  if (!isAuthenticated) {
    // Unauthenticated routes
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <YearProvider>
        <Navbar setCurrentPage={setCurrentPage} />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex items-center justify-center">
          {(() => {
            switch (currentPage) {
              case 'login':
                return <LoginPage onSwitchToRegister={() => setCurrentPage('register')} onSwitchToForgotPassword={() => setCurrentPage('forgot-password')} />;
              case 'register':
                return <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />;
              case 'gallery':
                return <GalleryPage />;
              default:
                return <GalleryPage />;

            }
          })()}
        </main>
        </YearProvider>
      </div>
    );
  } else {
    // Authenticated routes
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <YearProvider>
          <Navbar setCurrentPage={setCurrentPage} />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
            {(() => {
              switch (currentPage) {
                case 'home':
                  return <HomePage />;
                case 'received-items':
                  return <ReceivedItemsPage />;
                case 'expenditures':
                  return <ExpendituresPage />;
                case 'manage-years':
                  return <YearManagementPage />;
                case 'gallery':
                  return <GalleryPage />;
                default:
                  return <HomePage />;
              }
            })()}
          </main>
        </YearProvider>
      </div>
    );
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
