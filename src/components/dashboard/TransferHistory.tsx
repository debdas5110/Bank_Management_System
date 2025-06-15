
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBankData } from '@/hooks/useBankData';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const TransferHistory = () => {
  const { transfers, account, loading } = useBankData();

  if (loading) {
    return <div>Loading transfer history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer History</CardTitle>
        <CardDescription>Your money transfer activity</CardDescription>
      </CardHeader>
      <CardContent>
        {transfers.length > 0 ? (
          <div className="space-y-4">
            {transfers.map((transfer) => {
              const isOutgoing = transfer.from_account_id === account?.id;
              const isIncoming = transfer.to_account_id === account?.id;
              
              return (
                <div key={transfer.id} className="flex justify-between items-start p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isOutgoing ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                      <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                        {transfer.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(transfer.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="font-medium">
                      {isOutgoing ? `Transfer to ${transfer.to_account_number}` : `Transfer from account`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transfer.description || 'Money transfer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Transfer ID: {transfer.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      isOutgoing ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isOutgoing ? '-' : '+'}₹{Number(transfer.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isOutgoing ? 'Sent' : 'Received'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transfers found</p>
            <p className="text-sm text-gray-400 mt-2">Your transfer history will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferHistory;
