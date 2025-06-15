import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBankData } from '@/hooks/useBankData';
import { useTransactionNotifications } from '@/hooks/useTransactionNotifications';
import { useInitializeNotifications } from '@/hooks/useInitializeNotifications';
import { Bell, CreditCard, ArrowLeftRight, FileText, TrendingUp, Download, Settings, Shield, LogOut, Building2, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import TransferForm from './TransferForm';
import TransactionHistory from './TransactionHistory';
import TransferHistory from './TransferHistory';
import TransferInsights from './TransferInsights';
import NotificationSettings from './NotificationSettings';
import NotificationCenter from './NotificationCenter';
import NotificationBell from './NotificationBell';
import Security from './Security';
import StatementDownloader from './StatementDownloader';

const Dashboard = () => {
  const { profile, account, loading } = useBankData();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  
  // Initialize notification preferences and transaction notifications
  useInitializeNotifications();
  useTransactionNotifications();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-platinum-grey to-sky-blue/20">
        <div className="text-lg text-midnight-blue">Loading your dashboard...</div>
      </div>
    );
  }

  if (!profile || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-platinum-grey to-sky-blue/20">
        <div className="text-lg text-sunset-orange">Error loading dashboard data</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // Clear account type from localStorage first
      localStorage.removeItem('accountType');
      
      // Attempt to sign out, but don't throw error if session is already missing
      const { error } = await supabase.auth.signOut();
      
      // Only throw error if it's not a session missing error
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
      
      navigate('/auth');
    } catch (error: any) {
      console.error('Error signing out:', error);
      
      // If it's a session missing error, still consider it a successful logout
      if (error.message === 'Auth session missing!') {
        toast({
          title: "Success",
          description: "Signed out successfully!",
        });
        navigate('/auth');
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to sign out",
          variant: "destructive",
        });
      }
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-platinum-grey via-sky-blue/10 to-soft-mint/20 dark:from-midnight-blue dark:via-charcoal-black dark:to-midnight-blue">
      {/* Header with Midnight Blue Background */}
      <div className="bg-gradient-to-r from-midnight-blue via-charcoal-black to-midnight-blue border-b border-royal-blue/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <img 
                    src="/lovable-uploads/2111fd20-9b59-41ee-b4e0-735781d64b5a.png" 
                    alt="DebFin Bank" 
                    className="h-16 w-auto mr-4 filter brightness-125 drop-shadow-lg"
                  />
                  <div>
                    <h1 className="text-xl font-semibold text-pure-white">
                      Welcome, {profile.first_name}
                    </h1>
                    <p className="text-sm text-sky-blue flex items-center gap-1">
                      <Wallet className="h-3 w-3 text-gold-accent" />
                      Account: {account.account_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-pure-white">
                <ThemeSwitcher />
              </div>
              <div className="text-pure-white">
                <NotificationBell onClick={() => setShowNotifications(!showNotifications)} />
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={signingOut}
                className="border-royal-blue bg-royal-blue text-pure-white hover:bg-sky-blue hover:border-sky-blue transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {signingOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showNotifications ? (
          <NotificationCenter />
        ) : (
          <>
            {/* Balance Card with Royal Blue Gradient */}
            <Card className="mb-8 bg-gradient-to-r from-royal-blue to-sky-blue border-0 text-pure-white shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-pure-white flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-gold-accent" />
                  Current Balance
                </CardTitle>
                <CardDescription className="text-sky-blue/80">
                  Your available balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-pure-white mb-2">
                  ₹{Number(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sky-blue/90 flex items-center gap-1">
                  <Shield className="h-4 w-4 text-gold-accent" />
                  {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account
                </p>
              </CardContent>
            </Card>

            {/* Main Navigation Tabs */}
            <Tabs defaultValue="transactions" className="space-y-8">
              <div className="w-full overflow-x-auto">
                <TabsList className="inline-flex w-full min-w-max bg-pure-white/95 backdrop-blur-sm border border-platinum-grey shadow-xl p-1 rounded-2xl">
                  <TabsTrigger 
                    value="transactions" 
                    className="flex items-center gap-2 px-4 py-2.5 text-midnight-blue data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-sky-blue data-[state=active]:text-pure-white rounded-xl transition-all duration-300 hover:bg-soft-mint/30"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="whitespace-nowrap font-medium">Transactions</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="transfers" 
                    className="flex items-center gap-2 px-4 py-2.5 text-midnight-blue data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-sky-blue data-[state=active]:text-pure-white rounded-xl transition-all duration-300 hover:bg-soft-mint/30"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="whitespace-nowrap font-medium">Fund Transfers</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex items-center gap-2 px-4 py-2.5 text-midnight-blue data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-sky-blue data-[state=active]:text-pure-white rounded-xl transition-all duration-300 hover:bg-soft-mint/30"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="whitespace-nowrap font-medium">Transaction History</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className="flex items-center gap-2 px-4 py-2.5 text-midnight-blue data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-sky-blue data-[state=active]:text-pure-white rounded-xl transition-all duration-300 hover:bg-soft-mint/30"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="whitespace-nowrap font-medium">Financial Insights</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="statements" 
                    className="flex items-center gap-2 px-4 py-2.5 text-midnight-blue data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-sky-blue data-[state=active]:text-pure-white rounded-xl transition-all duration-300 hover:bg-soft-mint/30"
                  >
                    <Download className="h-4 w-4" />
                    <span className="whitespace-nowrap font-medium">Account Statements</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="flex items-center gap-2 px-4 py-2.5 text-midnight-blue data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-sky-blue data-[state=active]:text-pure-white rounded-xl transition-all duration-300 hover:bg-soft-mint/30"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="whitespace-nowrap font-medium">Notification Settings</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="flex items-center gap-2 px-4 py-2.5 text-midnight-blue data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-sky-blue data-[state=active]:text-pure-white rounded-xl transition-all duration-300 hover:bg-soft-mint/30"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="whitespace-nowrap font-medium">Security Center</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="transactions">
                <TransactionForm />
              </TabsContent>

              <TabsContent value="transfers">
                <TransferForm />
              </TabsContent>

              <TabsContent value="history">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TransactionHistory />
                  <TransferHistory />
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <TransferInsights />
              </TabsContent>

              <TabsContent value="statements">
                <StatementDownloader />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationSettings />
              </TabsContent>

              <TabsContent value="security">
                <Security />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
