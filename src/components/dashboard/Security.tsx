
import React from 'react';
import SessionManager from '@/components/auth/SessionManager';
import { useAutoLogout } from '@/hooks/useAutoLogout';

const Security = () => {
  // Initialize auto-logout functionality
  useAutoLogout();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
        <p className="text-gray-600">Manage your account security and active sessions</p>
      </div>
      
      <SessionManager />
    </div>
  );
};

export default Security;
