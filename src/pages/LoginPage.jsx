import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/Authform';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = ({ onSwitchToRegister }) => {
  const { login, loading } = useAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (formData) => {
    setError('');
    setSuccessMessage('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      setSuccessMessage(result.message);
      console.log(result.message)
    } else {
      setError(result.message);
      console.log(result.message)
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}
      <AuthForm type="login" onSubmit={handleLogin} />
      <p className="text-center text-gray-600 mt-6">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
