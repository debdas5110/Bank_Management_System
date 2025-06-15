
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AuthPage from '@/components/auth/AuthPage';

const AuthPageWrapper = () => {
  const { user, loading, accountType } = useAuth();

  console.log('AuthPageWrapper state:', { user: !!user, loading, accountType });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user && accountType) {
    console.log('User is authenticated, redirecting based on account type:', accountType);
    // Redirect based on account type
    if (accountType === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('Rendering auth page for unauthenticated user');
  return <AuthPage />;
};

export default AuthPageWrapper;
