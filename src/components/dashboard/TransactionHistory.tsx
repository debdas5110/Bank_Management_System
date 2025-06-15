
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBankData } from '@/hooks/useBankData';

const TransactionHistory = () => {
  const { transactions, loading } = useBankData();

  if (loading) {
    return <div>Loading transaction history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Complete history of your banking transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={transaction.transaction_type === 'deposit' ? 'default' : 'secondary'}>
                      {transaction.transaction_type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    Transaction ID: {transaction.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'deposit' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Balance: ₹{Number(transaction.balance_after).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400 mt-2">Your transaction history will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
