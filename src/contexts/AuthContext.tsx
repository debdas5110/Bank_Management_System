
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountType: 'regular' | 'admin' | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  accountType: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState<'regular' | 'admin' | null>(null);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, { user: session?.user?.email, session: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Get account type from localStorage if available
        const storedAccountType = localStorage.getItem('accountType') as 'regular' | 'admin' | null;
        console.log('Stored account type:', storedAccountType);
        setAccountType(storedAccountType);
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', { user: session?.user?.email, session: !!session });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Get account type from localStorage if available
      const storedAccountType = localStorage.getItem('accountType') as 'regular' | 'admin' | null;
      console.log('Initial stored account type:', storedAccountType);
      setAccountType(storedAccountType);
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  console.log('AuthContext state:', { user: user?.email, loading, accountType });

  return (
    <AuthContext.Provider value={{ user, session, loading, accountType }}>
      {children}
    </AuthContext.Provider>
  );
};
