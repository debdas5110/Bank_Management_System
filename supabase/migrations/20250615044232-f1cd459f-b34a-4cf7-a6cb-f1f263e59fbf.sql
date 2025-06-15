
-- Create enum for notification types
CREATE TYPE public.notification_type AS ENUM ('push', 'email', 'in_app');

-- Create enum for notification events
CREATE TYPE public.notification_event AS ENUM ('transaction', 'transfer_in', 'transfer_out', 'login', 'security');

-- Create table for user notification preferences
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type notification_event NOT NULL,
  notification_type notification_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one preference per user per event per type
  UNIQUE(user_id, event_type, notification_type)
);

-- Create table for notification logs
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type notification_event NOT NULL,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for notification_logs
CREATE POLICY "Users can view their own notification logs"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification logs"
  ON public.notification_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create default notification preferences for the new user
  INSERT INTO public.notification_preferences (user_id, event_type, notification_type, enabled)
  VALUES 
    (NEW.id, 'transaction', 'in_app', true),
    (NEW.id, 'transaction', 'email', true),
    (NEW.id, 'transaction', 'push', false),
    (NEW.id, 'transfer_in', 'in_app', true),
    (NEW.id, 'transfer_in', 'email', true),
    (NEW.id, 'transfer_in', 'push', false),
    (NEW.id, 'transfer_out', 'in_app', true),
    (NEW.id, 'transfer_out', 'email', true),
    (NEW.id, 'transfer_out', 'push', false),
    (NEW.id, 'login', 'in_app', false),
    (NEW.id, 'login', 'email', false),
    (NEW.id, 'login', 'push', false),
    (NEW.id, 'security', 'in_app', true),
    (NEW.id, 'security', 'email', true),
    (NEW.id, 'security', 'push', false);
    
  RETURN NEW;
END;
$$;

-- Update the existing trigger to also create notification preferences
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id, event_type, notification_type, enabled)
  VALUES 
    (NEW.id, 'transaction', 'in_app', true),
    (NEW.id, 'transaction', 'email', true),
    (NEW.id, 'transaction', 'push', false),
    (NEW.id, 'transfer_in', 'in_app', true),
    (NEW.id, 'transfer_in', 'email', true),
    (NEW.id, 'transfer_in', 'push', false),
    (NEW.id, 'transfer_out', 'in_app', true),
    (NEW.id, 'transfer_out', 'email', true),
    (NEW.id, 'transfer_out', 'push', false),
    (NEW.id, 'login', 'in_app', false),
    (NEW.id, 'login', 'email', false),
    (NEW.id, 'login', 'push', false),
    (NEW.id, 'security', 'in_app', true),
    (NEW.id, 'security', 'email', true),
    (NEW.id, 'security', 'push', false);
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log notifications
CREATE OR REPLACE FUNCTION public.log_notification(
  p_user_id UUID,
  p_event_type notification_event,
  p_notification_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notification_logs (
    user_id,
    event_type,
    notification_type,
    title,
    message,
    metadata
  ) VALUES (
    p_user_id,
    p_event_type,
    p_notification_type,
    p_title,
    p_message,
    p_metadata
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX idx_notification_logs_read_at ON public.notification_logs(read_at) WHERE read_at IS NULL;
