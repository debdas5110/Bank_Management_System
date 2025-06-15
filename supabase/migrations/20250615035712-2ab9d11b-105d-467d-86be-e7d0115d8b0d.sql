
-- Create enum for account types
CREATE TYPE public.account_type AS ENUM ('savings', 'checking', 'business');

-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal');

-- Create profiles table for user personal information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  date_of_birth DATE,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- Create accounts table for bank accounts
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  account_number TEXT NOT NULL UNIQUE,
  account_type account_type NOT NULL DEFAULT 'savings',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  ifsc_code TEXT NOT NULL DEFAULT 'DEB0002580',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for transaction history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  balance_after DECIMAL(15,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Function to generate account number (phone + last 4 digits of IFSC)
CREATE OR REPLACE FUNCTION public.generate_account_number(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN phone_number || '2580';
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user profile creation and account setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_phone TEXT;
  account_num TEXT;
BEGIN
  -- Extract phone from user metadata
  user_phone := NEW.raw_user_meta_data ->> 'phone';
  
  -- Generate account number
  account_num := public.generate_account_number(user_phone);
  
  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    phone, 
    email,
    date_of_birth,
    address
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    user_phone,
    NEW.email,
    (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE,
    NEW.raw_user_meta_data ->> 'address'
  );
  
  -- Create bank account
  INSERT INTO public.accounts (
    user_id,
    account_number,
    account_type,
    balance
  ) VALUES (
    NEW.id,
    account_num,
    'savings',
    0.00
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile and account when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for accounts
CREATE POLICY "Users can view their own accounts" 
  ON public.accounts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
  ON public.accounts FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.accounts WHERE id = account_id
    )
  );

CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.accounts WHERE id = account_id
    )
  );
