
-- Create admin roles enum if not exists
DO $$ BEGIN
    CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role admin_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true NOT NULL,
    UNIQUE(user_id)
);

-- Create system metrics table for dashboard
CREATE TABLE IF NOT EXISTS public.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin FIRST
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = $1 AND is_active = true
    );
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_id UUID DEFAULT auth.uid())
RETURNS admin_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.admin_users 
    WHERE user_id = $1 AND is_active = true;
$$;

-- NOW create policies that use the functions
CREATE POLICY "Only super admins can manage admin users" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        )
    );

CREATE POLICY "Admins can view system metrics" ON public.system_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
        )
    );

-- Update existing table policies to allow admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        id = auth.uid() OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
CREATE POLICY "Admins can view all accounts" ON public.accounts
    FOR SELECT USING (
        user_id = auth.uid() OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE id = account_id AND user_id = auth.uid()
        ) OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can view all transfers" ON public.transfers;
CREATE POLICY "Admins can view all transfers" ON public.transfers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE id = from_account_id AND user_id = auth.uid()
        ) OR public.is_admin()
    );

-- Function to record system metrics
CREATE OR REPLACE FUNCTION public.record_system_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Total users
    INSERT INTO public.system_metrics (metric_name, metric_value)
    SELECT 'total_users', COUNT(*) FROM public.profiles;
    
    -- Total deposits today
    INSERT INTO public.system_metrics (metric_name, metric_value)
    SELECT 'daily_deposits', COALESCE(SUM(amount), 0) 
    FROM public.transactions 
    WHERE transaction_type = 'deposit' 
    AND created_at >= CURRENT_DATE;
    
    -- Total withdrawals today
    INSERT INTO public.system_metrics (metric_name, metric_value)
    SELECT 'daily_withdrawals', COALESCE(SUM(amount), 0) 
    FROM public.transactions 
    WHERE transaction_type = 'withdrawal' 
    AND created_at >= CURRENT_DATE;
    
    -- Failed transactions today
    INSERT INTO public.system_metrics (metric_name, metric_value)
    SELECT 'failed_transfers', COALESCE(COUNT(*), 0) 
    FROM public.transfers 
    WHERE status = 'failed' 
    AND created_at >= CURRENT_DATE;
    
    -- Active users (logged in last 24h)
    INSERT INTO public.system_metrics (metric_name, metric_value)
    SELECT 'active_users', COALESCE(COUNT(DISTINCT user_id), 0) 
    FROM public.user_sessions 
    WHERE last_activity >= now() - INTERVAL '24 hours' 
    AND is_active = true;
END;
$$;
