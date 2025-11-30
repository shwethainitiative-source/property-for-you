-- Create experts table
CREATE TABLE public.experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

-- Anyone can view experts
CREATE POLICY "Anyone can view experts"
  ON public.experts
  FOR SELECT
  USING (true);

-- Admins can manage experts
CREATE POLICY "Admins can insert experts"
  ON public.experts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update experts"
  ON public.experts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete experts"
  ON public.experts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create expert_contacts table for contact form submissions
CREATE TABLE public.expert_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid REFERENCES public.experts(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  read boolean DEFAULT false NOT NULL
);

-- Enable RLS
ALTER TABLE public.expert_contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact requests
CREATE POLICY "Anyone can submit expert contacts"
  ON public.expert_contacts
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all contacts
CREATE POLICY "Admins can view all expert contacts"
  ON public.expert_contacts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins can update contacts
CREATE POLICY "Admins can update expert contacts"
  ON public.expert_contacts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Admins can delete contacts
CREATE POLICY "Admins can delete expert contacts"
  ON public.expert_contacts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger for experts
CREATE TRIGGER update_experts_updated_at
  BEFORE UPDATE ON public.experts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial 12 experts data
INSERT INTO public.experts (name, category, description, image_url) VALUES
  ('Real Estate Investment Advisor', 'Property', 'Expert guidance on property investments and ROI analysis', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'),
  ('Home Architecture & Layout Consultant', 'Property', 'Professional advice on home design and space optimization', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400'),
  ('Construction Cost Estimator Expert', 'Property', 'Accurate cost estimation for construction projects', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
  ('Property Legal Documentation Expert', 'Property', 'Assistance with property documentation and legal compliance', 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400'),
  
  ('Vehicle Valuation Expert', 'Automobile', 'Professional vehicle assessment and pricing guidance', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400'),
  ('Automobile Loan & Insurance Advisor', 'Automobile', 'Expert advice on car financing and insurance options', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400'),
  ('Vehicle Inspection & Damage Assessment Expert', 'Automobile', 'Thorough vehicle inspection and damage evaluation', 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400'),
  ('EV Specialist', 'Automobile', 'Electric vehicle consultation and buying guidance', 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=400'),
  
  ('Certified Gemstone Specialist', 'Jewellery', 'Expert gemstone authentication and quality assessment', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'),
  ('Gold Purity & Budget Advisor', 'Jewellery', 'Gold quality verification and budget planning assistance', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'),
  ('Wedding Jewellery Planner', 'Jewellery', 'Complete wedding jewellery selection and coordination', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400'),
  ('Jewellery Investment Consultant', 'Jewellery', 'Investment guidance for precious metals and stones', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400');