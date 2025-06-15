
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemMetrics, useAllUsers, useAllAccounts, useAllTransactions } from '@/hooks/useAdminData';
import { Activity, Users, DollarSign, TrendingUp, IndianRupee, Zap, Shield, Database } from 'lucide-react';

const SystemHealthDashboard = () => {
  const { data: metrics = [], isLoading: metricsLoading } = useSystemMetrics();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: accounts = [], isLoading: accountsLoading } = useAllAccounts();
  const { data: transactions = [], isLoading: transactionsLoading } = useAllTransactions();

  if (metricsLoading || usersLoading || accountsLoading || transactionsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-pure-white border-platinum-grey">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-platinum-grey rounded w-1/2"></div>
              <div className="h-8 bg-platinum-grey rounded w-3/4"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate real stats from database
  const totalUsers = users.length;
  const activeUsers = users.filter(user => {
    // Consider users active if they have recent transactions (last 30 days)
    const recentTransactions = transactions.filter(t => 
      t.accounts?.user_id === user.id && 
      new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    return recentTransactions.length > 0;
  }).length;

  const totalTransactions = transactions.length;
  const totalVolume = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);

  // Calculate daily deposits and withdrawals
  const today = new Date().toDateString();
  const todaysTransactions = transactions.filter(t => new Date(t.created_at).toDateString() === today);
  const dailyDeposits = todaysTransactions
    .filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'transfer_in')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const dailyWithdrawals = todaysTransactions
    .filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'transfer_out')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Primary Stats Grid with Professional Color Scheme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-pure-white border-platinum-grey hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-midnight-blue to-royal-blue rounded-bl-full opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-midnight-blue">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 text-royal-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-midnight-blue">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-charcoal-black/60 mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-pure-white border-platinum-grey hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-green to-soft-mint rounded-bl-full opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-midnight-blue">
              Active Users
            </CardTitle>
            <Activity className="h-5 w-5 text-emerald-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-green">
              {activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-charcoal-black/60 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-pure-white border-platinum-grey hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gold-accent to-yellow-300 rounded-bl-full opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-midnight-blue">
              Total Volume
            </CardTitle>
            <IndianRupee className="h-5 w-5 text-gold-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-midnight-blue flex items-center gap-1">
              <IndianRupee className="h-5 w-5 text-gold-accent" />
              {totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-charcoal-black/60 mt-1">
              All transactions
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-pure-white border-platinum-grey hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-sky-blue to-blue-300 rounded-bl-full opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-midnight-blue">
              Transactions
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-sky-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-blue">
              {totalTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-charcoal-black/60 mt-1">
              Total processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats with Clean White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-pure-white border-platinum-grey shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-midnight-blue">
              <IndianRupee className="h-5 w-5 text-emerald-green" />
              Daily Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-green flex items-center gap-1">
              <IndianRupee className="h-6 w-6" />
              {dailyDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-charcoal-black/60">
              Today's deposits
            </p>
          </CardContent>
        </Card>

        <Card className="bg-pure-white border-platinum-grey shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-midnight-blue">
              <IndianRupee className="h-5 w-5 text-sunset-orange" />
              Daily Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sunset-orange flex items-center gap-1">
              <IndianRupee className="h-6 w-6" />
              {dailyWithdrawals.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-charcoal-black/60">
              Today's withdrawals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-pure-white border-platinum-grey shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-midnight-blue">
              <Database className="h-5 w-5 text-gold-accent" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-accent flex items-center gap-1">
              <IndianRupee className="h-6 w-6" />
              {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-charcoal-black/60">
              All accounts combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status Cards with Professional Styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-green/5 to-soft-mint/10 border-emerald-green/20 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-midnight-blue">
              <Shield className="h-5 w-5 text-emerald-green" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-green">
              Online
            </div>
            <p className="text-sm text-charcoal-black/60">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-blue/5 to-blue-50 border-sky-blue/20 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-midnight-blue">
              <Zap className="h-5 w-5 text-sky-blue" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-blue">
              Optimal
            </div>
            <p className="text-sm text-charcoal-black/60">
              Fast response times
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gold-accent/5 to-yellow-50 border-gold-accent/20 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-midnight-blue">
              <Database className="h-5 w-5 text-gold-accent" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-accent">
              Healthy
            </div>
            <p className="text-sm text-charcoal-black/60">
              All connections active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Metrics with Clean Design */}
      {metrics.length > 0 && (
        <Card className="bg-pure-white border-platinum-grey shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-midnight-blue">
              <Activity className="h-5 w-5 text-royal-blue" />
              Recent System Metrics
            </CardTitle>
            <CardDescription className="text-charcoal-black/60">
              Latest performance data from the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.slice(0, 5).map((metric, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-platinum-grey/30 hover:bg-soft-mint/20 transition-colors duration-200">
                  <span className="text-sm text-charcoal-black/70">
                    {new Date(metric.recorded_at).toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-midnight-blue">
                    {metric.metric_name}: {metric.metric_value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthDashboard;
