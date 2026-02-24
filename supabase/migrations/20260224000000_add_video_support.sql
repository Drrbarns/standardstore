-- Add video support to product_images
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image' CHECK (media_type IN ('image', 'video'));
