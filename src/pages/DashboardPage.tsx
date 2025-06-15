
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  const { user, loading, accountType } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is logged in as admin, redirect to admin page
  if (accountType === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Dashboard />;
};

export default DashboardPage;
