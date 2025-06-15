
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAllTransactions, useAllTransfers, useLoginAttempts } from '@/hooks/useAdminData';
import { Search, Filter, Download, AlertTriangle, Activity, IndianRupee } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TransactionType = Database['public']['Enums']['transaction_type'];

const TransactionMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const filters = {
    type: typeFilter !== 'all' ? typeFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
  };

  const { data: transactions, isLoading: transactionsLoading } = useAllTransactions(filters);
  const { data: transfers, isLoading: transfersLoading } = useAllTransfers();
  const { data: loginAttempts, isLoading: loginAttemptsLoading } = useLoginAttempts();

  const filteredTransactions = transactions?.filter(transaction => {
    const searchMatch = searchTerm === '' || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accounts?.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accounts?.account_number?.includes(searchTerm);
    return searchMatch;
  }) || [];

  // Calculate summary stats from database
  const totalTransactionAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDeposits = filteredTransactions.filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'transfer_in').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalWithdrawals = filteredTransactions.filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'transfer_out').reduce((sum, t) => sum + Number(t.amount), 0);
  const failedTransfers = transfers?.filter(t => t.status === 'failed').length || 0;
  const failedLogins = loginAttempts?.filter(l => !l.success).length || 0;

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
  };

  if (transactionsLoading || transfersLoading || loginAttemptsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading transaction data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction Monitoring</h2>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              {totalTransactionAmount.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
              <IndianRupee className="h-5 w-5" />
              {totalDeposits.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
              <IndianRupee className="h-5 w-5" />
              {totalWithdrawals.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transfers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {failedTransfers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedLogins}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer_in">Transfer In</SelectItem>
                <SelectItem value="transfer_out">Transfer Out</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Min Amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Max Amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="col-span-2"
            >
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions ({filteredTransactions.length})</TabsTrigger>
          <TabsTrigger value="transfers">Transfers ({transfers?.length || 0})</TabsTrigger>
          <TabsTrigger value="security">Security Logs ({loginAttempts?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
              <CardDescription>
                Monitor all user transactions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.accounts?.profiles?.first_name} {transaction.accounts?.profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.accounts?.profiles?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.transaction_type === 'deposit' ? 'default' :
                          transaction.transaction_type === 'withdrawal' ? 'destructive' :
                          transaction.transaction_type === 'transfer_in' ? 'secondary' : 'outline'
                        }>
                          {transaction.transaction_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className={
                        transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_in' 
                          ? 'text-green-600 font-medium' 
                          : 'text-red-600 font-medium'
                      }>
                        <div className="flex items-center gap-1">
                          {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_in' ? '+' : '-'}
                          <IndianRupee className="h-4 w-4" />
                          {transaction.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {transaction.balance_after.toFixed(2)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description || 'No description'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transfers ({transfers?.length || 0})</CardTitle>
              <CardDescription>
                Monitor money transfers between accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From User</TableHead>
                    <TableHead>To Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers?.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        {new Date(transfer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transfer.from_account?.profiles?.first_name} {transfer.from_account?.profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transfer.from_account?.profiles?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {transfer.to_account_number}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        <div className="flex items-center gap-1">
                          -<IndianRupee className="h-4 w-4" />
                          {transfer.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transfer.status === 'completed' ? 'default' :
                          transfer.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {transfer.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transfer.description || 'No description'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Login Security Logs</CardTitle>
              <CardDescription>
                Monitor all login attempts and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginAttempts?.slice(0, 50).map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        {new Date(attempt.attempt_time).toLocaleString()}
                      </TableCell>
                      <TableCell>{attempt.email}</TableCell>
                      <TableCell>
                        <Badge variant={attempt.success ? 'default' : 'destructive'}>
                          {attempt.success ? 'SUCCESS' : 'FAILED'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {attempt.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {attempt.user_agent || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionMonitoring;
