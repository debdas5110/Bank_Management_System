
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TransactionType = Database['public']['Enums']['transaction_type'];

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['systemMetrics'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('system_metrics')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching system metrics:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            accounts:accounts(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
  });
};

export const useAllTransactions = (filters?: { 
  userId?: string; 
  type?: TransactionType; 
  dateFrom?: string; 
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}) => {
  return useQuery({
    queryKey: ['allTransactions', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('transactions')
          .select(`
            *,
            accounts:accounts(
              account_number,
              user_id,
              profiles:profiles(first_name, last_name, email)
            )
          `)
          .order('created_at', { ascending: false });

        if (filters?.type) {
          query = query.eq('transaction_type', filters.type);
        }

        if (filters?.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }

        if (filters?.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }

        if (filters?.minAmount) {
          query = query.gte('amount', filters.minAmount);
        }

        if (filters?.maxAmount) {
          query = query.lte('amount', filters.maxAmount);
        }

        const { data, error } = await query.limit(1000);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    },
  });
};

export const useAllTransfers = () => {
  return useQuery({
    queryKey: ['allTransfers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('transfers')
          .select(`
            *,
            from_account:accounts!transfers_from_account_id_fkey(
              account_number,
              profiles:profiles(first_name, last_name, email)
            ),
            to_account:accounts!transfers_to_account_id_fkey(
              account_number,
              profiles:profiles(first_name, last_name, email)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(500);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching transfers:', error);
        return [];
      }
    },
  });
};

export const useAllAccounts = () => {
  return useQuery({
    queryKey: ['allAccounts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select(`
            *,
            profiles:profiles(first_name, last_name, email, phone)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
      }
    },
  });
};

export const useLoginAttempts = () => {
  return useQuery({
    queryKey: ['loginAttempts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('login_attempts')
          .select('*')
          .order('attempt_time', { ascending: false })
          .limit(200);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching login attempts:', error);
        return [];
      }
    },
  });
};
