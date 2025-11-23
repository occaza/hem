-- Create product_categories junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  category_id text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_product_id_category_id_key UNIQUE (product_id, category_id),
  CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
  CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON public.product_categories USING btree (product_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON public.product_categories USING btree (category_id) TABLESPACE pg_default;

-- Add comments
COMMENT ON TABLE public.product_categories IS 'Junction table linking products to categories (many-to-many)';
