
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitResult {
  allowed: boolean;
  attempts_remaining: number;
  lockout_expires?: string;
  message: string;
}

interface UserSession {
  id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
}

export const useSecurity = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);

  const checkRateLimit = async (email: string): Promise<RateLimitResult> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_email: email,
        p_ip_address: null // Browser doesn't have access to real IP
      });

      if (error) throw error;
      
      // Parse the JSON response properly
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      return result as RateLimitResult;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return {
        allowed: true,
        attempts_remaining: 5,
        message: 'Rate limit check failed, allowing attempt'
      };
    }
  };

  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_success: success,
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  };

  const fetchUserSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;
      
      // Refresh sessions list
      await fetchUserSessions();
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  const terminateAllSessions = async () => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .neq('id', 'current'); // Keep current session active

      if (error) throw error;
      
      // Refresh sessions list
      await fetchUserSessions();
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
    }
  };

  return {
    sessions,
    loading,
    checkRateLimit,
    logLoginAttempt,
    fetchUserSessions,
    terminateSession,
    terminateAllSessions
  };
};
