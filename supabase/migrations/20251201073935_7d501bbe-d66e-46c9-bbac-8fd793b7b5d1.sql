-- Create pricing_plans table for dynamic pricing management
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL UNIQUE, -- 'featured' or 'popup'
  duration INTEGER NOT NULL, -- days
  price NUMERIC NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view pricing plans
CREATE POLICY "Anyone can view pricing plans"
  ON public.pricing_plans
  FOR SELECT
  USING (true);

-- Admins can manage pricing plans
CREATE POLICY "Admins can manage pricing plans"
  ON public.pricing_plans
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add selected_dates column to popup_ad_schedules to store multiple dates
ALTER TABLE public.popup_ad_schedules
ADD COLUMN IF NOT EXISTS selected_dates DATE[] DEFAULT '{}';

-- Insert default pricing plans
INSERT INTO public.pricing_plans (plan_type, duration, price, display_order) VALUES
  ('featured_30', 30, 199, 1),
  ('featured_60', 60, 349, 2),
  ('featured_90', 90, 500, 3),
  ('popup_30', 30, 999, 4),
  ('popup_60', 60, 1499, 5),
  ('popup_90', 90, 1999, 6)
ON CONFLICT (plan_type) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();