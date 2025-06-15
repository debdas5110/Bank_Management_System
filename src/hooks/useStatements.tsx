
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StatementData {
  transactions: any[];
  transfers: any[];
  account: any;
  profile: any;
  startDate: string;
  endDate: string;
}

export const useStatements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchStatementData = async (startDate: string, endDate: string): Promise<StatementData | null> => {
    if (!user) return null;

    try {
      // Get account info
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get transactions in date range
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', account?.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .order('created_at', { ascending: false });

      // Get transfers in date range
      const { data: transfers } = await supabase
        .from('transfers')
        .select('*')
        .or(`from_account_id.eq.${account?.id},to_account_id.eq.${account?.id}`)
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .order('created_at', { ascending: false });

      return {
        transactions: transactions || [],
        transfers: transfers || [],
        account,
        profile,
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error fetching statement data:', error);
      return null;
    }
  };

  const downloadCSV = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const data = await fetchStatementData(startDate, endDate);
      if (!data) {
        toast({
          title: "Error",
          description: "Failed to fetch statement data",
          variant: "destructive",
        });
        return;
      }

      // Create CSV content
      let csvContent = "Date,Type,Description,Amount,Balance\n";
      
      // Add transactions
      data.transactions.forEach(tx => {
        const date = new Date(tx.created_at).toLocaleDateString();
        const amount = tx.transaction_type === 'withdrawal' ? `-${tx.amount}` : tx.amount;
        csvContent += `${date},${tx.transaction_type},${tx.description || ''},${amount},${tx.balance_after}\n`;
      });

      // Add transfers
      data.transfers.forEach(transfer => {
        const date = new Date(transfer.created_at).toLocaleDateString();
        const isOutgoing = transfer.from_account_id === data.account.id;
        const amount = isOutgoing ? `-${transfer.amount}` : transfer.amount;
        const type = isOutgoing ? 'Transfer Out' : 'Transfer In';
        csvContent += `${date},${type},${transfer.description || ''},${amount},\n`;
      });

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${startDate}_${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "CSV statement downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download CSV statement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const data = await fetchStatementData(startDate, endDate);
      if (!data) {
        toast({
          title: "Error",
          description: "Failed to fetch statement data",
          variant: "destructive",
        });
        return;
      }

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>DebFin Bank Statement</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { max-height: 80px; margin-bottom: 20px; }
            .account-info { margin-bottom: 20px; }
            .statement-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .statement-table th, .statement-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .statement-table th { background-color: #f2f2f2; }
            .credit { color: green; }
            .debit { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DebFin Bank Statement</h1>
            <h2>Empowering Trust, Simplifying Finance</h2>
          </div>
          
          <div class="account-info">
            <p><strong>Account Holder:</strong> ${data.profile.first_name} ${data.profile.last_name}</p>
            <p><strong>Account Number:</strong> ${data.account.account_number}</p>
            <p><strong>IFSC Code:</strong> ${data.account.ifsc_code}</p>
            <p><strong>Statement Period:</strong> ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</p>
            <p><strong>Current Balance:</strong> ₹${Number(data.account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>

          <table class="statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${[...data.transactions, ...data.transfers.map(t => ({
                created_at: t.created_at,
                transaction_type: t.from_account_id === data.account.id ? 'Transfer Out' : 'Transfer In',
                description: t.description || '',
                amount: t.from_account_id === data.account.id ? `-${t.amount}` : t.amount,
                balance_after: ''
              }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(item => `
                <tr>
                  <td>${new Date(item.created_at).toLocaleDateString()}</td>
                  <td>${item.transaction_type}</td>
                  <td>${item.description}</td>
                  <td class="${item.amount.toString().startsWith('-') ? 'debit' : 'credit'}">₹${Math.abs(Number(item.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>${item.balance_after ? '₹' + Number(item.balance_after).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }

      toast({
        title: "Success",
        description: "PDF statement generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF statement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { downloadCSV, downloadPDF, loading };
};
