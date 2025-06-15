
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Database } from '@/integrations/supabase/types';

type AdminRole = Database['public']['Enums']['admin_role'] | null;

interface AdminContextType {
  isAdmin: boolean;
  adminRole: AdminRole;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  adminRole: null,
  loading: true,
});

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('Checking admin status for user:', user?.id);
      
      if (!user) {
        console.log('No user found, setting admin to false');
        setIsAdmin(false);
        setAdminRole(null);
        setLoading(false);
        return;
      }

      try {
        // For the specific admin email, allow admin access
        if (user.email === 'debdasupadhyay2004@gmail.com') {
          console.log('Admin email detected, granting admin access');
          setIsAdmin(true);
          setAdminRole('super_admin');
          setLoading(false);
          return;
        }

        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        console.log('Admin query result:', { adminData, error });

        if (adminData && !error) {
          console.log('User is admin with role:', adminData.role);
          setIsAdmin(true);
          setAdminRole(adminData.role);
        } else {
          console.log('User is not admin or query failed:', error);
          setIsAdmin(false);
          setAdminRole(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  console.log('AdminContext state:', { isAdmin, adminRole, loading, userId: user?.id });

  return (
    <AdminContext.Provider value={{ isAdmin, adminRole, loading }}>
      {children}
    </AdminContext.Provider>
  );
};
