-- Create table for scheduled popup ads (admin can schedule up to 3 per day)
CREATE TABLE IF NOT EXISTS public.popup_ad_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'rejected')),
  payment_amount NUMERIC NOT NULL DEFAULT 0,
  payment_proof TEXT,
  admin_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(schedule_date, slot_number)
);

-- Enable RLS
ALTER TABLE public.popup_ad_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all popup schedules"
  ON public.popup_ad_schedules FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own popup schedules"
  ON public.popup_ad_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = popup_ad_schedules.listing_id
    AND listings.user_id = auth.uid()
  ));

CREATE POLICY "Users can create popup schedules"
  ON public.popup_ad_schedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = popup_ad_schedules.listing_id
    AND listings.user_id = auth.uid()
  ));

CREATE POLICY "Admins can update popup schedules"
  ON public.popup_ad_schedules FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete popup schedules"
  ON public.popup_ad_schedules FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_popup_ad_schedules_updated_at
  BEFORE UPDATE ON public.popup_ad_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();