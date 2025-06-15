
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout

export const useAutoLogout = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef(Date.now());

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    lastActivityRef.current = Date.now();

    // Set warning timer
    warningRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring",
        description: "Your session will expire in 5 minutes due to inactivity.",
        variant: "destructive",
      });
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      try {
        await supabase.auth.signOut();
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
      } catch (error) {
        console.error('Auto logout failed:', error);
      }
    }, INACTIVITY_TIMEOUT);
  };

  const handleActivity = () => {
    if (user) {
      resetTimer();
    }
  };

  useEffect(() => {
    if (!user || !session) return;

    // Start the timer
    resetTimer();

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, session]);

  return { lastActivity: lastActivityRef.current };
};
