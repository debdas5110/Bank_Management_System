
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBankData } from '@/hooks/useBankData';
import { useToast } from '@/hooks/use-toast';

const TransactionForm = () => {
  const { account, performTransaction } = useBankData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await performTransaction(formData.type, amount, formData.description);
      
      if (result.error) {
        toast({
          title: "Transaction Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transaction Successful",
          description: `${formData.type === 'deposit' ? 'Deposited' : 'Withdrawn'} ₹${amount.toLocaleString('en-IN')} successfully`,
        });
        setFormData({ type: 'deposit', amount: '', description: '' });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return <div>Loading account information...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Make a Transaction</CardTitle>
          <CardDescription>Deposit or withdraw money from your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Transaction Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'deposit' | 'withdrawal' }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deposit" id="deposit" />
                  <Label htmlFor="deposit">Deposit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="withdrawal" id="withdrawal" />
                  <Label htmlFor="withdrawal">Withdrawal</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter transaction description"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : `${formData.type === 'deposit' ? 'Deposit' : 'Withdraw'} Money`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Current account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{Number(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Number</p>
              <p className="text-lg font-mono">{account.account_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Type</p>
              <p className="text-lg capitalize">{account.account_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">IFSC Code</p>
              <p className="text-lg font-mono">{account.ifsc_code}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
