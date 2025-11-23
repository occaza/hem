-- Add is_active column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.products.is_active IS 'Whether the product is active and visible in the shop';
