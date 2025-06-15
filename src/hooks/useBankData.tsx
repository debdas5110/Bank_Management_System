
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  address: string;
}

interface BankAccount {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  ifsc_code: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

interface Transfer {
  id: string;
  from_account_id: string;
  to_account_number: string;
  to_account_id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  completed_at: string;
}

export const useBankData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (accountError) throw accountError;
      setAccount(accountData);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Fetch transfers
      const { data: transfersData, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .or(`from_account_id.eq.${accountData.id},to_account_id.eq.${accountData.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transfersError) throw transfersError;
      setTransfers(transfersData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performTransaction = async (type: 'deposit' | 'withdrawal', amount: number, description?: string) => {
    if (!account) return { error: 'No account found' };

    try {
      const newBalance = type === 'deposit' 
        ? Number(account.balance) + amount 
        : Number(account.balance) - amount;

      if (newBalance < 0) {
        return { error: 'Insufficient funds' };
      }

      // Update account balance
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      if (updateError) throw updateError;

      // Insert transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: account.id,
          transaction_type: type,
          amount: amount,
          balance_after: newBalance,
          description: description || `${type} transaction`,
        });

      if (transactionError) throw transactionError;

      // Refresh data
      await fetchUserData();
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const performTransfer = async (toAccountNumber: string, amount: number, description?: string) => {
    if (!account) return { error: 'No account found' };

    try {
      const { data, error } = await supabase.rpc('process_transfer', {
        p_from_account_id: account.id,
        p_to_account_number: toAccountNumber,
        p_amount: amount,
        p_description: description
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; transfer_id?: string; new_balance?: number };

      if (!result.success) {
        return { error: result.error || 'Transfer failed' };
      }

      // Refresh data after successful transfer
      await fetchUserData();
      return { success: true, transferId: result.transfer_id };
    } catch (error: any) {
      return { error: error.message || 'Transfer failed' };
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  return {
    profile,
    account,
    transactions,
    transfers,
    loading,
    performTransaction,
    performTransfer,
    refreshData: fetchUserData,
  };
};
