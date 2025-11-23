-- Create atomic stock reduction functions
-- This prevents race conditions when multiple users buy the same product simultaneously

-- Function 1: Reduce stock atomically with row-level locking
CREATE OR REPLACE FUNCTION reduce_stock_atomic(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS TABLE(
    success BOOLEAN,
    new_stock INTEGER,
    message TEXT
) AS $$
DECLARE
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Lock the row to prevent concurrent updates (FOR UPDATE = row-level lock)
    SELECT stock INTO v_current_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    -- Check if product exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'Product not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if stock is sufficient
    IF v_current_stock < p_quantity THEN
        RETURN QUERY SELECT FALSE, v_current_stock, 'Insufficient stock'::TEXT;
        RETURN;
    END IF;
    
    -- Update stock atomically
    v_new_stock := v_current_stock - p_quantity;
    
    UPDATE products
    SET stock = v_new_stock,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Return success
    RETURN QUERY SELECT TRUE, v_new_stock, 'Stock reduced successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Rollback stock reduction (for error recovery)
CREATE OR REPLACE FUNCTION rollback_stock_reduction(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS TABLE(
    success BOOLEAN,
    new_stock INTEGER
) AS $$
DECLARE
    v_new_stock INTEGER;
BEGIN
    -- Add back the quantity
    UPDATE products
    SET stock = stock + p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id
    RETURNING stock INTO v_new_stock;
    
    IF FOUND THEN
        RETURN QUERY SELECT TRUE, v_new_stock;
    ELSE
        RETURN QUERY SELECT FALSE, 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add index for better performance on concurrent stock updates
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(id, stock);

-- Add constraint to prevent negative stock
ALTER TABLE products 
ADD CONSTRAINT check_stock_non_negative 
CHECK (stock >= 0);

-- Comments for documentation
COMMENT ON FUNCTION reduce_stock_atomic IS 'Atomically reduce product stock with row-level locking to prevent race conditions';
COMMENT ON FUNCTION rollback_stock_reduction IS 'Rollback stock reduction in case of transaction failure';
