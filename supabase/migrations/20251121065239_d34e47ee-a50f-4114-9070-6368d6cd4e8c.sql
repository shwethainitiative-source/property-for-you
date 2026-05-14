-- Fix RLS policies for listing-images bucket to allow authenticated users to upload
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view listing images" ON storage.objects;

-- Allow authenticated users to upload images to their own listing folders
CREATE POLICY "Allow authenticated users to upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images'
);

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images');

-- Allow everyone to view listing images
CREATE POLICY "Allow public to view listing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-images');