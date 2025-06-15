
-- Grant super admin privileges to the user with email debdasupadhyay2004@gmail.com
INSERT INTO public.admin_users (
    user_id,
    role,
    is_active
)
SELECT 
    id,
    'super_admin',
    true
FROM public.profiles 
WHERE email = 'debdasupadhyay2004@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    is_active = true;
