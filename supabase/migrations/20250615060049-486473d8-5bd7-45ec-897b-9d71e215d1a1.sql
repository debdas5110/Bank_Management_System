
-- Check if the user exists and grant admin privileges
INSERT INTO public.admin_users (
    user_id,
    role,
    is_active
)
SELECT 
    au.id,
    'super_admin',
    true
FROM auth.users au 
WHERE au.email = 'debdasupadhyay2004@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    is_active = true;

-- Also check what users exist
SELECT email FROM auth.users WHERE email = 'debdasupadhyay2004@gmail.com';
