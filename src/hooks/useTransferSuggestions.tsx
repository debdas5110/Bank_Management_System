
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TransferSuggestion {
  accountNumber: string;
  frequency: number;
  lastUsed: string;
  description?: string;
}

export const useTransferSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<TransferSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's account
      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!account) return;

      // Get transfer history
      const { data: transfers } = await supabase
        .from('transfers')
        .select('to_account_number, created_at, description')
        .eq('from_account_id', account.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!transfers) return;

      // Process transfers to create suggestions
      const transferMap = new Map<string, { count: number; lastUsed: string; description?: string }>();

      transfers.forEach(transfer => {
        const existing = transferMap.get(transfer.to_account_number);
        if (existing) {
          existing.count += 1;
          if (new Date(transfer.created_at) > new Date(existing.lastUsed)) {
            existing.lastUsed = transfer.created_at;
            existing.description = transfer.description;
          }
        } else {
          transferMap.set(transfer.to_account_number, {
            count: 1,
            lastUsed: transfer.created_at,
            description: transfer.description
          });
        }
      });

      // Convert to suggestions and sort by frequency
      const suggestions: TransferSuggestion[] = Array.from(transferMap.entries())
        .map(([accountNumber, data]) => ({
          accountNumber,
          frequency: data.count,
          lastUsed: data.lastUsed,
          description: data.description
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching transfer suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  return { suggestions, loading, refreshSuggestions: fetchSuggestions };
};
