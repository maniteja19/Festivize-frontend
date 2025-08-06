import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/Authform';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage = ({ onSwitchToLogin }) => {
  const { register, loading } = useAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (formData) => {
    setError('');
    setSuccessMessage('');
    const result = await register(formData.name, formData.email, formData.password, formData.role);
    if (result.success) {
      setSuccessMessage(result.message);
      // Optionally, switch to login page after successful registration
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } else {
      setError(result.message);
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}
      <AuthForm type="register" onSubmit={handleRegister} />
      <p className="text-center text-gray-600 mt-6">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
        >
          Login here
        </button>
      </p>
    </div>
  );
};

export default RegisterPage;
