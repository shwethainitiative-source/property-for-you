-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, slug) VALUES
  ('Properties', 'properties'),
  ('Automobiles', 'automobiles'),
  ('Jewellery', 'jewellery');

-- Create listings table with dynamic fields stored as JSONB
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  location_city TEXT NOT NULL,
  location_locality TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Dynamic fields stored as JSONB for flexibility
  attributes JSONB NOT NULL DEFAULT '{}',
  
  -- Seller contact info
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create listing_images table
CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete roles (will be handled via edge functions)
CREATE POLICY "Service role can manage roles"
  ON public.user_roles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for listings
CREATE POLICY "Anyone can view active listings"
  ON public.listings FOR SELECT
  TO authenticated, anon
  USING (status = 'active');

CREATE POLICY "Users can insert own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for listing_images
CREATE POLICY "Anyone can view listing images"
  ON public.listing_images FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can manage images for own listings"
  ON public.listing_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Create function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_is_featured ON public.listings(is_featured);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);