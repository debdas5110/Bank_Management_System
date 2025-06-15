
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AdminProvider } from '@/contexts/AdminContext';
import AdminPanel from '@/components/admin/AdminPanel';

const AdminPage = () => {
  const { user, loading } = useAuth();

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

  return (
    <AdminProvider>
      <AdminPanel />
    </AdminProvider>
  );
};

export default AdminPage;
