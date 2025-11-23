-- Add quantity column to transactions table
-- This allows storing the quantity of each product in an order

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

-- Add comment to document the column
COMMENT ON COLUMN public.transactions.quantity IS 'Quantity of the product in this transaction';
