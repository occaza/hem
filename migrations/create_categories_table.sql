-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  icon text NULL,
  description text NULL,
  display_order integer NULL DEFAULT 0,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_name_key UNIQUE (name),
  CONSTRAINT categories_slug_key UNIQUE (slug)
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories USING btree (slug) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories USING btree (display_order) TABLESPACE pg_default;

-- Add comments
COMMENT ON TABLE public.categories IS 'Product categories for organizing products';
COMMENT ON COLUMN public.categories.display_order IS 'Order in which categories are displayed (lower numbers first)';
