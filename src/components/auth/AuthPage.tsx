import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '@/hooks/useSecurity';
import { Shield, Clock } from 'lucide-react';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkRateLimit, logLoginAttempt } = useSecurity();

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check rate limiting first
      const rateLimitResult = await checkRateLimit(signInForm.email);
      setRateLimitInfo(rateLimitResult);

      if (!rateLimitResult.allowed) {
        const lockoutTime = new Date(rateLimitResult.lockout_expires!);
        const remainingTime = Math.ceil((lockoutTime.getTime() - Date.now()) / 60000);
        
        toast({
          title: "Account Locked",
          description: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
          variant: "destructive",
        });
        return;
      }

      // Determine account type based on password
      let accountType: 'regular' | 'admin' = 'regular';
      let authPassword = signInForm.password;

      if (signInForm.email === 'debdasupadhyay2004@gmail.com') {
        if (signInForm.password === 'Aju@2580') {
          accountType = 'admin';
          authPassword = 'Aju@1234'; // Use the regular password for Supabase auth
        } else if (signInForm.password === 'Aju@1234') {
          accountType = 'regular';
        } else {
          toast({
            title: "Invalid Credentials",
            description: "Invalid password for this account.",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: authPassword,
      });

      // Log the attempt
      await logLoginAttempt(signInForm.email, !error);

      if (error) {
        // Update rate limit info after failed attempt
        const newRateLimitResult = await checkRateLimit(signInForm.email);
        setRateLimitInfo(newRateLimitResult);
        
        throw error;
      }

      // Store account type in localStorage
      localStorage.setItem('accountType', accountType);

      toast({
        title: "Success",
        description: `Signed in successfully as ${accountType}!`,
      });

      // Navigate based on account type
      if (accountType === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!signUpForm.firstName || !signUpForm.lastName || !signUpForm.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (First Name, Last Name, Phone).",
          variant: "destructive",
        });
        return;
      }

      // Validate phone number (basic validation)
      if (signUpForm.phone.length < 10) {
        toast({
          title: "Error",
          description: "Please enter a valid 10-digit phone number.",
          variant: "destructive",
        });
        return;
      }

      if (signUpForm.password !== signUpForm.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }

      if (signUpForm.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }

      const redirectUrl = `${window.location.origin}/`;

      // Prepare user metadata
      const userMetadata = {
        first_name: signUpForm.firstName,
        last_name: signUpForm.lastName,
        phone: signUpForm.phone,
        date_of_birth: signUpForm.dateOfBirth || null,
        address: signUpForm.address || null,
      };

      const { error } = await supabase.auth.signUp({
        email: signUpForm.email,
        password: signUpForm.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userMetadata
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Account created successfully! A bank account has been automatically created for you. Please check your email to verify your account.",
      });

      // Switch to sign in mode after successful signup
      setIsSignUp(false);
      setSignUpForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (lockoutExpires: string) => {
    const lockoutTime = new Date(lockoutExpires);
    const remainingMs = lockoutTime.getTime() - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return remainingMinutes;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 font-[Poppins,Inter,'Segoe_UI',system-ui,sans-serif]">
      <Card className="w-full max-w-md shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[20px] overflow-hidden">
        <CardHeader className="text-center pt-8 pb-4 px-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/2111fd20-9b59-41ee-b4e0-735781d64b5a.png" 
              alt="DebFin Bank Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">DebFin Bank</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Empowering Trust, Simplifying Finance</p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {!isSignUp && rateLimitInfo && !rateLimitInfo.allowed && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Account locked for {formatTimeRemaining(rateLimitInfo.lockout_expires)} more minutes
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!isSignUp && rateLimitInfo && rateLimitInfo.allowed && rateLimitInfo.attempts_remaining < 3 && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-xl">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300 font-medium">
                {rateLimitInfo.attempts_remaining} login attempts remaining before account lock
              </AlertDescription>
            </Alert>
          )}

          {/* Toggle between Sign In and Sign Up */}
          <div className="flex mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isSignUp
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isSignUp
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={rateLimitInfo && !rateLimitInfo.allowed}
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInForm.password}
                  onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={rateLimitInfo && !rateLimitInfo.allowed}
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                  placeholder="Enter your password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-slate-900 dark:bg-slate-800 text-white border-2 border-gold-accent rounded-lg font-semibold transition-all duration-300 hover:bg-gold-accent hover:text-slate-900 hover:border-gold-accent focus:ring-2 focus:ring-gold-accent focus:ring-offset-2" 
                disabled={loading || (rateLimitInfo && !rateLimitInfo.allowed)}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname" className="text-slate-700 dark:text-slate-300 font-medium">First Name *</Label>
                  <Input
                    id="signup-firstname"
                    type="text"
                    value={signUpForm.firstName}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastname" className="text-slate-700 dark:text-slate-300 font-medium">Last Name *</Label>
                  <Input
                    id="signup-lastname"
                    type="text"
                    value={signUpForm.lastName}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300 font-medium">Email *</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="text-slate-700 dark:text-slate-300 font-medium">Phone Number *</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  value={signUpForm.phone}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  required
                  maxLength={10}
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-dob" className="text-slate-700 dark:text-slate-300 font-medium">Date of Birth</Label>
                <Input
                  id="signup-dob"
                  type="date"
                  value={signUpForm.dateOfBirth}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-address" className="text-slate-700 dark:text-slate-300 font-medium">Address</Label>
                <Input
                  id="signup-address"
                  type="text"
                  value={signUpForm.address}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, address: e.target.value }))}
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                  placeholder="Your address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-700 dark:text-slate-300 font-medium">Password *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                  placeholder="Enter your password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-slate-700 dark:text-slate-300 font-medium">Confirm Password *</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg focus:border-slate-400 dark:focus:border-slate-400 transition-all duration-300"
                  placeholder="Confirm your password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-slate-900 dark:bg-slate-800 text-white border-2 border-gold-accent rounded-lg font-semibold transition-all duration-300 hover:bg-gold-accent hover:text-slate-900 hover:border-gold-accent focus:ring-2 focus:ring-gold-accent focus:ring-offset-2" 
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                * Required fields. A savings account will be automatically created for you.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
