-- Add status, phone, and user_id columns to experts table for user submissions
ALTER TABLE public.experts 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies to allow users to submit experts
DROP POLICY IF EXISTS "Admins can insert experts" ON public.experts;
DROP POLICY IF EXISTS "Anyone can view experts" ON public.experts;

-- Anyone can view approved experts
CREATE POLICY "Anyone can view approved experts" 
ON public.experts 
FOR SELECT 
USING (status = 'approved');

-- Admins can view all experts
CREATE POLICY "Admins can view all experts" 
ON public.experts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can insert their own expert profiles
CREATE POLICY "Users can insert own expert profiles" 
ON public.experts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own pending expert profiles
CREATE POLICY "Users can view own expert profiles" 
ON public.experts 
FOR SELECT 
USING (auth.uid() = user_id);