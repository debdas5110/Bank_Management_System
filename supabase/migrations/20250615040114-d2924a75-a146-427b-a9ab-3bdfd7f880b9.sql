
-- Create enum for transfer status
CREATE TYPE public.transfer_status AS ENUM ('pending', 'completed', 'failed');

-- Create transfers table for money transfers between accounts
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  to_account_number TEXT NOT NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  status transfer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add transfer type to existing transaction_type enum
ALTER TYPE public.transaction_type ADD VALUE 'transfer_in';
ALTER TYPE public.transaction_type ADD VALUE 'transfer_out';

-- Enable RLS for transfers table
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transfers
CREATE POLICY "Users can view their own transfers" 
  ON public.transfers FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.accounts WHERE id = from_account_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM public.accounts WHERE id = to_account_id
    )
  );

CREATE POLICY "Users can create transfers from their own accounts" 
  ON public.transfers FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.accounts WHERE id = from_account_id
    )
  );

-- Function to process money transfer
CREATE OR REPLACE FUNCTION public.process_transfer(
  p_from_account_id UUID,
  p_to_account_number TEXT,
  p_amount DECIMAL(15,2),
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_from_balance DECIMAL(15,2);
  v_to_account_id UUID;
  v_to_balance DECIMAL(15,2);
  v_transfer_id UUID;
  v_new_from_balance DECIMAL(15,2);
  v_new_to_balance DECIMAL(15,2);
BEGIN
  -- Check if from_account belongs to the authenticated user
  IF NOT EXISTS (
    SELECT 1 FROM public.accounts 
    WHERE id = p_from_account_id AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized access to source account');
  END IF;

  -- Get current balance of from_account
  SELECT balance INTO v_from_balance 
  FROM public.accounts 
  WHERE id = p_from_account_id;

  -- Check if sufficient balance
  IF v_from_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  -- Find destination account by account number
  SELECT id, balance INTO v_to_account_id, v_to_balance
  FROM public.accounts 
  WHERE account_number = p_to_account_number;

  -- Check if destination account exists
  IF v_to_account_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Destination account not found');
  END IF;

  -- Check if not transferring to same account
  IF p_from_account_id = v_to_account_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot transfer to the same account');
  END IF;

  -- Calculate new balances
  v_new_from_balance := v_from_balance - p_amount;
  v_new_to_balance := v_to_balance + p_amount;

  -- Create transfer record
  INSERT INTO public.transfers (
    from_account_id,
    to_account_number,
    to_account_id,
    amount,
    description,
    status,
    completed_at
  ) VALUES (
    p_from_account_id,
    p_to_account_number,
    v_to_account_id,
    p_amount,
    p_description,
    'completed',
    now()
  ) RETURNING id INTO v_transfer_id;

  -- Update from_account balance
  UPDATE public.accounts 
  SET balance = v_new_from_balance, updated_at = now()
  WHERE id = p_from_account_id;

  -- Update to_account balance
  UPDATE public.accounts 
  SET balance = v_new_to_balance, updated_at = now()
  WHERE id = v_to_account_id;

  -- Insert transaction record for sender (debit)
  INSERT INTO public.transactions (
    account_id,
    transaction_type,
    amount,
    balance_after,
    description
  ) VALUES (
    p_from_account_id,
    'transfer_out',
    p_amount,
    v_new_from_balance,
    COALESCE(p_description, 'Money transfer to ' || p_to_account_number)
  );

  -- Insert transaction record for receiver (credit)
  INSERT INTO public.transactions (
    account_id,
    transaction_type,
    amount,
    balance_after,
    description
  ) VALUES (
    v_to_account_id,
    'transfer_in',
    p_amount,
    v_new_to_balance,
    COALESCE(p_description, 'Money transfer from account')
  );

  RETURN json_build_object(
    'success', true, 
    'transfer_id', v_transfer_id,
    'new_balance', v_new_from_balance
  );
END;
$$;
