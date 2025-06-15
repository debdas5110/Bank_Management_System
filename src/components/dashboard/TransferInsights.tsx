
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useBankData } from '@/hooks/useBankData';

const TransferInsights = () => {
  const { transfers, account, loading } = useBankData();

  const transferData = useMemo(() => {
    if (!account || !transfers.length) return null;

    const outgoingTransfers = transfers.filter(t => t.from_account_id === account.id);
    const incomingTransfers = transfers.filter(t => t.to_account_id === account.id);

    const totalOutgoing = outgoingTransfers.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncoming = incomingTransfers.reduce((sum, t) => sum + Number(t.amount), 0);

    // Pie chart data
    const pieData = [
      { name: 'Outgoing', value: totalOutgoing, fill: '#ef4444' },
      { name: 'Incoming', value: totalIncoming, fill: '#22c55e' }
    ];

    // Top recipients data
    const recipientMap = new Map();
    outgoingTransfers.forEach(transfer => {
      const recipient = transfer.to_account_number;
      const currentAmount = recipientMap.get(recipient) || 0;
      recipientMap.set(recipient, currentAmount + Number(transfer.amount));
    });

    const topRecipients = Array.from(recipientMap.entries())
      .map(([account_number, amount]) => ({ account_number, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly transfer data
    const monthlyData = new Map();
    transfers.forEach(transfer => {
      const month = new Date(transfer.created_at).toLocaleDateString('en-IN', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { month, outgoing: 0, incoming: 0 });
      }
      
      const data = monthlyData.get(month);
      if (transfer.from_account_id === account.id) {
        data.outgoing += Number(transfer.amount);
      } else {
        data.incoming += Number(transfer.amount);
      }
    });

    const monthlyArray = Array.from(monthlyData.values()).slice(-6);

    return {
      pieData,
      topRecipients,
      monthlyData: monthlyArray,
      totalOutgoing,
      totalIncoming,
      outgoingCount: outgoingTransfers.length,
      incomingCount: incomingTransfers.length
    };
  }, [transfers, account]);

  if (loading) {
    return <div>Loading transfer insights...</div>;
  }

  if (!transferData || transferData.pieData.every(d => d.value === 0)) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Insights</h2>
          <p className="text-gray-600">Analyze your transfer patterns and top recipients</p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-gray-500">No transfer data available</p>
              <p className="text-sm text-gray-400 mt-2">Make some transfers to see insights</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartConfig = {
    outgoing: {
      label: "Outgoing",
      color: "#ef4444",
    },
    incoming: {
      label: "Incoming", 
      color: "#22c55e",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Insights</h2>
        <p className="text-gray-600">Analyze your transfer patterns and top recipients</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              ₹{transferData.totalOutgoing.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-600">Total Outgoing</p>
            <p className="text-xs text-gray-500">{transferData.outgoingCount} transfers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              ₹{transferData.totalIncoming.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-600">Total Incoming</p>
            <p className="text-xs text-gray-500">{transferData.incomingCount} transfers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {transferData.topRecipients.length}
            </div>
            <p className="text-sm text-gray-600">Unique Recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              ₹{(transferData.totalOutgoing / (transferData.outgoingCount || 1)).toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-600">Avg. Transfer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Outgoing vs Incoming */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Distribution</CardTitle>
            <CardDescription>Outgoing vs Incoming transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transferData.pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ₹${value.toLocaleString('en-IN')}`}
                    labelLine={false}
                  >
                    {transferData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Transfer Recipients</CardTitle>
            <CardDescription>Accounts you transfer to most</CardDescription>
          </CardHeader>
          <CardContent>
            {transferData.topRecipients.length > 0 ? (
              <div className="space-y-4">
                {transferData.topRecipients.map((recipient, index) => (
                  <div key={recipient.account_number} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">Account {recipient.account_number}</p>
                        <p className="text-sm text-gray-600">
                          ₹{recipient.amount.toLocaleString('en-IN')} total transferred
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recipients yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Transfer Trends */}
      {transferData.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Transfer Trends</CardTitle>
            <CardDescription>Transfer activity over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transferData.monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="outgoing" fill="#ef4444" name="Outgoing" />
                  <Bar dataKey="incoming" fill="#22c55e" name="Incoming" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransferInsights;
