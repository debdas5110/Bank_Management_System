
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard, History, DollarSign } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-platinum-grey via-sky-blue/10 to-soft-mint/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/2111fd20-9b59-41ee-b4e0-735781d64b5a.png" 
              alt="DebFin Bank Logo" 
              className="h-64 w-auto drop-shadow-2xl"
            />
          </div>
          <h1 className="text-5xl font-bold text-midnight-blue mb-6">
            DebFin Bank Management System
          </h1>
          <p className="text-xl text-charcoal-black mb-8 max-w-2xl mx-auto">
            Empowering Trust, Simplifying Finance. Experience modern banking with our comprehensive management system. 
            Secure, reliable, and user-friendly banking at your fingertips.
          </p>
          <div className="space-x-4">
            <Link to="/auth">
              <Button size="lg" className="bg-royal-blue hover:bg-sky-blue text-pure-white px-8 py-3 rounded-xl shadow-lg transition-all duration-300">
                Get Started
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-pure-white px-8 py-3 rounded-xl transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center bg-pure-white shadow-xl border border-platinum-grey rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Shield className="h-12 w-12 text-royal-blue mx-auto mb-4" />
              <CardTitle className="text-midnight-blue">Secure Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-charcoal-black">
                Multi-factor authentication and advanced security measures to protect your account
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-pure-white shadow-xl border border-platinum-grey rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CreditCard className="h-12 w-12 text-emerald-green mx-auto mb-4" />
              <CardTitle className="text-midnight-blue">Account Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-charcoal-black">
                Complete account overview with real-time balance updates and account details
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-pure-white shadow-xl border border-platinum-grey rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-gold-accent mx-auto mb-4" />
              <CardTitle className="text-midnight-blue">Easy Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-charcoal-black">
                Quick and secure deposits and withdrawals with instant balance updates
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-pure-white shadow-xl border border-platinum-grey rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <History className="h-12 w-12 text-sunset-orange mx-auto mb-4" />
              <CardTitle className="text-midnight-blue">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-charcoal-black">
                Detailed transaction history with search and filter capabilities
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-pure-white shadow-2xl rounded-2xl p-8 border border-platinum-grey">
          <h2 className="text-3xl font-bold text-center text-midnight-blue mb-8">
            Why Choose DebFin Bank?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-royal-blue mb-4">Automatic Account Creation</h3>
              <p className="text-charcoal-black">
                When you sign up, your bank account is automatically created with a unique account number 
                generated from your phone number and our IFSC code.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-emerald-green mb-4">Real-time Updates</h3>
              <p className="text-charcoal-black">
                All transactions are processed instantly with real-time balance updates and 
                immediate transaction confirmations.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gold-accent mb-4">Complete Security</h3>
              <p className="text-charcoal-black">
                Your data is protected with bank-level security, encryption, and row-level 
                security policies to ensure privacy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-midnight-blue text-pure-white py-8 border-t border-royal-blue/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sky-blue">
            © 2024 DebFin Bank. Empowering Trust, Simplifying Finance.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
