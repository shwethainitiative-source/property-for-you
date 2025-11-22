-- Manually assign admin role to the specific email if user exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get user_id from profiles table for the admin email
  SELECT user_id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'thepropertyforyou2@gmail.com'
  LIMIT 1;
  
  -- If user exists, ensure they have admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;