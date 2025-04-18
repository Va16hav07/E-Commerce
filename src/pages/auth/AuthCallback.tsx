import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import React from 'react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    // Firebase auth is handled by the AuthContext useEffect already
    // Just wait for it to complete and then redirect accordingly
    if (!isLoading && currentUser) {
      // Redirect based on user role
      if (currentUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (currentUser.role === 'RIDER') {
        navigate('/rider/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else if (!isLoading && !currentUser) {
      // If auth failed
      navigate('/login', { 
        replace: true, 
        state: { message: 'Authentication failed. Please try again.' }
      });
    }
  }, [currentUser, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Completing authentication...</p>
    </div>
  );
}
