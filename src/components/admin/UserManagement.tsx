
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAllUsers, useAllAccounts } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserX, RotateCcw, IndianRupee, Users2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserManagement = () => {
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useAllUsers();
  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts } = useAllAccounts();
  const [searchTerm, setSearchTerm] = useState('');

  if (usersLoading || accountsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-midnight-blue">Loading user data...</div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const filteredAccounts = accounts.filter(account =>
    account.account_number?.includes(searchTerm) ||
    account.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success('Password reset email sent successfully');
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(`User ${userName} has been deleted`);
      await refetchUsers();
      await refetchAccounts();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const totalBalance = accounts.reduce((total, account) => total + Number(account.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-midnight-blue">User Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-black/60 h-4 w-4" />
            <Input
              placeholder="Search users or accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80 bg-pure-white border-platinum-grey focus:border-royal-blue focus:ring-royal-blue/20"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards with Professional Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-pure-white border-platinum-grey shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-midnight-blue">Total Users</CardTitle>
            <Users2 className="h-4 w-4 text-royal-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-midnight-blue">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-pure-white border-platinum-grey shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-midnight-blue">Total Accounts</CardTitle>
            <IndianRupee className="h-4 w-4 text-gold-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-midnight-blue">{accounts.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-pure-white border-platinum-grey shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-midnight-blue">Total Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-green flex items-center gap-1">
              <IndianRupee className="h-5 w-5" />
              {totalBalance.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clean White Section for Tabs */}
      <div className="bg-pure-white rounded-xl border border-platinum-grey shadow-md p-6">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-platinum-grey/50">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-midnight-blue data-[state=active]:text-pure-white text-charcoal-black"
            >
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="accounts" 
              className="data-[state=active]:bg-midnight-blue data-[state=active]:text-pure-white text-charcoal-black"
            >
              Accounts ({filteredAccounts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-pure-white border-platinum-grey">
              <CardHeader>
                <CardTitle className="text-midnight-blue">All Users</CardTitle>
                <CardDescription className="text-charcoal-black/60">Manage user accounts and access</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-platinum-grey">
                      <TableHead className="text-midnight-blue">Name</TableHead>
                      <TableHead className="text-midnight-blue">Email</TableHead>
                      <TableHead className="text-midnight-blue">Phone</TableHead>
                      <TableHead className="text-midnight-blue">Accounts</TableHead>
                      <TableHead className="text-midnight-blue">Joined</TableHead>
                      <TableHead className="text-midnight-blue">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-platinum-grey hover:bg-soft-mint/10">
                        <TableCell className="font-medium text-charcoal-black">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell className="text-charcoal-black">{user.email}</TableCell>
                        <TableCell className="text-charcoal-black">{user.phone}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.accounts?.map((account: any) => (
                              <Badge key={account.id} variant="outline" className="flex items-center gap-1 border-royal-blue text-royal-blue">
                                {account.account_number} - <IndianRupee className="h-3 w-3" />{Number(account.balance || 0).toFixed(2)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-charcoal-black">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePasswordReset(user.email)}
                              className="flex items-center gap-1 border-sky-blue text-sky-blue hover:bg-sky-blue hover:text-pure-white"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset Password
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex items-center gap-1 bg-sunset-orange hover:bg-sunset-orange/90 text-pure-white">
                                  <UserX className="h-3 w-3" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-pure-white border-platinum-grey">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-midnight-blue">Delete User Account</AlertDialogTitle>
                                  <AlertDialogDescription className="text-charcoal-black/70">
                                    Are you sure you want to permanently delete {user.first_name} {user.last_name}'s account? 
                                    This action cannot be undone and will delete all associated accounts and data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-platinum-grey text-charcoal-black hover:bg-platinum-grey/50">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-sunset-orange hover:bg-sunset-orange/90 text-pure-white"
                                    onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card className="bg-pure-white border-platinum-grey">
              <CardHeader>
                <CardTitle className="text-midnight-blue">All Bank Accounts</CardTitle>
                <CardDescription className="text-charcoal-black/60">View and manage all bank accounts in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-platinum-grey">
                      <TableHead className="text-midnight-blue">Account Number</TableHead>
                      <TableHead className="text-midnight-blue">Account Holder</TableHead>
                      <TableHead className="text-midnight-blue">Type</TableHead>
                      <TableHead className="text-midnight-blue">Balance</TableHead>
                      <TableHead className="text-midnight-blue">IFSC Code</TableHead>
                      <TableHead className="text-midnight-blue">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id} className="border-platinum-grey hover:bg-soft-mint/10">
                        <TableCell className="font-mono font-medium text-charcoal-black">
                          {account.account_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-charcoal-black">
                              {account.profiles?.first_name} {account.profiles?.last_name}
                            </div>
                            <div className="text-sm text-charcoal-black/60">
                              {account.profiles?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-platinum-grey text-midnight-blue">
                            {account.account_type?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium flex items-center gap-1 text-emerald-green">
                          <IndianRupee className="h-4 w-4" />
                          {Number(account.balance || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-mono text-charcoal-black">
                          {account.ifsc_code}
                        </TableCell>
                        <TableCell className="text-charcoal-black">
                          {new Date(account.created_at).toLocaleDateString()}
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
    </div>
  );
};

export default UserManagement;
