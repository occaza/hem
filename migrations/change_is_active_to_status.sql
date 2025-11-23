-- Migration to change is_active boolean to status string

-- 1. Add new status column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- 2. Migrate existing data (if any)
-- If is_active was true -> 'active'
-- If is_active was false -> 'draft' (or 'archived' depending on preference, let's use 'draft' for inactive)
UPDATE public.products 
SET status = CASE 
    WHEN is_active = true THEN 'active'
    ELSE 'draft'
END;

-- 3. Drop old column
ALTER TABLE public.products 
DROP COLUMN IF EXISTS is_active;

-- 4. Add constraint to ensure valid values
ALTER TABLE public.products 
ADD CONSTRAINT check_product_status 
CHECK (status IN ('active', 'draft', 'archived'));

-- Add comment
COMMENT ON COLUMN public.products.status IS 'Product status: active, draft, or archived';
