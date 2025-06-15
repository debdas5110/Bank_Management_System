
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserManagement from './UserManagement';
import TransactionMonitoring from './TransactionMonitoring';
import SystemHealthDashboard from './SystemHealthDashboard';
import { Shield, Users, Activity, BarChart3, LogOut, IndianRupee } from 'lucide-react';

const AdminPanel = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  console.log('AdminPanel render:', { isAdmin, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-platinum-grey/20 via-pure-white to-soft-mint/10">
        <div className="flex items-center gap-3 text-xl font-medium">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
          <span className="bg-gradient-to-r from-midnight-blue to-royal-blue bg-clip-text text-transparent">
            Checking admin access...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('User is admin, rendering admin panel');

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
    <div className="min-h-screen bg-gradient-to-br from-platinum-grey/30 via-pure-white to-soft-mint/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Professional Branding */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative bg-gradient-to-br from-midnight-blue to-royal-blue p-4 rounded-2xl shadow-lg">
              <Shield className="h-10 w-10 text-pure-white" />
              <IndianRupee className="h-5 w-5 text-gold-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-midnight-blue via-royal-blue to-sky-blue bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-charcoal-black/70 mt-2 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-green" />
                Manage users, monitor transactions, and view system health metrics
              </p>
            </div>
          </div>
          
          <Button 
            variant="destructive"
            onClick={handleSignOut}
            disabled={signingOut}
            className="group relative overflow-hidden bg-gradient-to-r from-sunset-orange to-red-500 hover:from-sunset-orange/90 hover:to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-pure-white"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sunset-orange/80 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <LogOut className="h-4 w-4 mr-2 relative z-10 group-hover:animate-pulse" />
            <span className="relative z-10">
              {signingOut ? "Signing Out..." : "Sign Out"}
            </span>
          </Button>
        </div>

        {/* Clean White Section with Professional Tabs */}
        <div className="bg-pure-white rounded-2xl shadow-xl border border-platinum-grey p-6">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-platinum-grey/50 backdrop-blur-sm border border-platinum-grey p-1 rounded-xl shadow-md">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-midnight-blue data-[state=active]:to-royal-blue data-[state=active]:text-pure-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-charcoal-black hover:bg-soft-mint/30"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">System Health</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-midnight-blue data-[state=active]:to-royal-blue data-[state=active]:text-pure-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-charcoal-black hover:bg-soft-mint/30"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">User Management</span>
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-midnight-blue data-[state=active]:to-royal-blue data-[state=active]:text-pure-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-charcoal-black hover:bg-soft-mint/30"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Transaction Monitoring</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="animate-fade-in">
              <SystemHealthDashboard />
            </TabsContent>

            <TabsContent value="users" className="animate-fade-in">
              <UserManagement />
            </TabsContent>

            <TabsContent value="transactions" className="animate-fade-in">
              <TransactionMonitoring />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
