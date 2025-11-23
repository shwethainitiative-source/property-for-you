-- Add payment_proof column to listings table for tracking paid featured listings
ALTER TABLE public.listings 
ADD COLUMN payment_proof TEXT;