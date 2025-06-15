
-- Create table for tracking login attempts
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  user_agent TEXT
);

-- Create table for managing user sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS for both tables
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for login_attempts (admin only for security)
CREATE POLICY "Only authenticated users can view login attempts"
  ON public.login_attempts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_email TEXT,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_failed_attempts INTEGER;
  v_last_attempt TIMESTAMP WITH TIME ZONE;
  v_lockout_time INTERVAL := INTERVAL '15 minutes';
  v_max_attempts INTEGER := 5;
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*), MAX(attempt_time)
  INTO v_failed_attempts, v_last_attempt
  FROM public.login_attempts
  WHERE email = p_email
    AND success = false
    AND attempt_time > (now() - v_lockout_time);

  -- Check if user is locked out
  IF v_failed_attempts >= v_max_attempts THEN
    RETURN json_build_object(
      'allowed', false,
      'attempts_remaining', 0,
      'lockout_expires', v_last_attempt + v_lockout_time,
      'message', 'Account temporarily locked due to too many failed attempts'
    );
  END IF;

  RETURN json_build_object(
    'allowed', true,
    'attempts_remaining', v_max_attempts - v_failed_attempts,
    'lockout_expires', null,
    'message', 'Login attempt allowed'
  );
END;
$$;

-- Function to log login attempt
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO public.login_attempts (
    email,
    ip_address,
    success,
    user_agent
  ) VALUES (
    p_email,
    p_ip_address,
    p_success,
    p_user_agent
  ) RETURNING id INTO v_attempt_id;

  RETURN v_attempt_id;
END;
$$;

-- Function to manage user session
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id UUID,
  p_session_token TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Deactivate old sessions if user has more than 3 active sessions
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE user_id = p_user_id 
    AND is_active = true 
    AND id NOT IN (
      SELECT id FROM public.user_sessions 
      WHERE user_id = p_user_id 
        AND is_active = true 
      ORDER BY last_activity DESC 
      LIMIT 2
    );

  -- Create new session
  INSERT INTO public.user_sessions (
    user_id,
    session_token,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_session_token,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Function to update session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(
  p_session_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET last_activity = now()
  WHERE session_token = p_session_token 
    AND is_active = true 
    AND expires_at > now();

  RETURN FOUND;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempt_time);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
