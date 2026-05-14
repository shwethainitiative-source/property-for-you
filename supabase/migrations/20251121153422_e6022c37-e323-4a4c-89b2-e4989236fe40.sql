-- Create first admin user
-- Note: This will create an admin role for the specified email
-- The user must first sign up with this email through the normal signup flow

-- First, create a function to add admin role after user signup
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email matches the admin email
  IF NEW.email = 'thepropertyforyou2@gmail.com' THEN
    -- Insert admin role for this user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign admin role when the specific email signs up
DROP TRIGGER IF EXISTS auto_assign_admin_role ON auth.users;
CREATE TRIGGER auto_assign_admin_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_to_email();