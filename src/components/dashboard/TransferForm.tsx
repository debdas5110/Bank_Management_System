
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBankData } from '@/hooks/useBankData';
import { useTransferSuggestions } from '@/hooks/useTransferSuggestions';
import { useToast } from '@/hooks/use-toast';
import { ArrowRightLeft, Clock, Users } from 'lucide-react';

const TransferForm = () => {
  const { account, performTransfer } = useBankData();
  const { suggestions } = useTransferSuggestions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    toAccountNumber: '',
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

    if (!formData.toAccountNumber.trim()) {
      toast({
        title: "Invalid Account Number",
        description: "Please enter the destination account number",
        variant: "destructive",
      });
      return;
    }

    if (formData.toAccountNumber === account.account_number) {
      toast({
        title: "Invalid Transfer",
        description: "Cannot transfer to your own account",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await performTransfer(
        formData.toAccountNumber,
        amount,
        formData.description || `Transfer to ${formData.toAccountNumber}`
      );
      
      if (result.error) {
        toast({
          title: "Transfer Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transfer Successful",
          description: `Successfully transferred ₹${amount.toLocaleString('en-IN')} to account ${formData.toAccountNumber}`,
        });
        setFormData({ toAccountNumber: '', amount: '', description: '' });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during transfer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      toAccountNumber: suggestion.accountNumber,
      description: suggestion.description || ''
    }));
  };

  if (!account) {
    return <div>Loading account information...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Transfer Money
            </CardTitle>
            <CardDescription>Send money to another account instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toAccountNumber">Destination Account Number</Label>
                <Input
                  id="toAccountNumber"
                  type="text"
                  value={formData.toAccountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, toAccountNumber: e.target.value }))}
                  placeholder="Enter account number"
                  required
                />
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
                  placeholder="Enter amount to transfer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter transfer description"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing Transfer...' : 'Transfer Money'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Frequent Recipients
              </CardTitle>
              <CardDescription>Quick access to your recent transfer recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="font-mono text-sm">{suggestion.accountNumber}</div>
                        {suggestion.description && (
                          <div className="text-xs text-gray-500">{suggestion.description}</div>
                        )}
                        <div className="text-xs text-gray-400">
                          Used {suggestion.frequency} times • Last: {new Date(suggestion.lastUsed).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Summary</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{Number(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Your Account Number</p>
              <p className="text-lg font-mono">{account.account_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">IFSC Code</p>
              <p className="text-lg font-mono">{account.ifsc_code}</p>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Transfer Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Transfers are processed instantly</li>
                <li>• Ensure the account number is correct</li>
                <li>• Minimum transfer amount: ₹1</li>
                <li>• Check your balance before transferring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferForm;
