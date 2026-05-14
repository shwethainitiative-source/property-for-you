-- Create sponsorships table
CREATE TABLE public.sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  banner_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (7, 20, 45)),
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_id TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

-- Users can view their own sponsorships
CREATE POLICY "Users can view own sponsorships"
ON public.sponsorships
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own sponsorships
CREATE POLICY "Users can create sponsorships"
ON public.sponsorships
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending sponsorships
CREATE POLICY "Users can update own pending sponsorships"
ON public.sponsorships
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all sponsorships
CREATE POLICY "Admins can view all sponsorships"
ON public.sponsorships
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all sponsorships
CREATE POLICY "Admins can update all sponsorships"
ON public.sponsorships
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can view approved and active sponsorships
CREATE POLICY "Anyone can view active sponsorships"
ON public.sponsorships
FOR SELECT
TO authenticated
USING (status = 'approved' AND start_date <= now() AND end_date >= now());

-- Public access to active sponsorships
CREATE POLICY "Public can view active sponsorships"
ON public.sponsorships
FOR SELECT
TO anon
USING (status = 'approved' AND start_date <= now() AND end_date >= now());

-- Add trigger for updated_at
CREATE TRIGGER update_sponsorships_updated_at
BEFORE UPDATE ON public.sponsorships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for sponsorship banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsorship-banners', 'sponsorship-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for sponsorship banners
CREATE POLICY "Users can upload their sponsorship banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sponsorship-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their sponsorship banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'sponsorship-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view sponsorship banners"
ON storage.objects
FOR SELECT
USING (bucket_id = 'sponsorship-banners');