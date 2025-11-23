-- Fix reduce_stock_atomic to accept TEXT and remove updated_at reference
-- This is needed because product IDs are TEXT, not UUID
-- and updated_at column doesn't exist in products table

DROP FUNCTION IF EXISTS reduce_stock_atomic(UUID, INTEGER);
DROP FUNCTION IF EXISTS reduce_stock_atomic(TEXT, INTEGER);
DROP FUNCTION IF EXISTS rollback_stock_reduction(UUID, INTEGER);
DROP FUNCTION IF EXISTS rollback_stock_reduction(TEXT, INTEGER);

-- Function 1: Reduce stock atomically with row-level locking (TEXT version, no updated_at)
CREATE OR REPLACE FUNCTION reduce_stock_atomic(
    p_product_id TEXT,
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
    SET stock = v_new_stock
    WHERE id = p_product_id;
    
    -- Return success
    RETURN QUERY SELECT TRUE, v_new_stock, 'Stock reduced successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Rollback stock reduction (TEXT version, no updated_at)
CREATE OR REPLACE FUNCTION rollback_stock_reduction(
    p_product_id TEXT,
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
    SET stock = stock + p_quantity
    WHERE id = p_product_id
    RETURNING stock INTO v_new_stock;
    
    IF FOUND THEN
        RETURN QUERY SELECT TRUE, v_new_stock;
    ELSE
        RETURN QUERY SELECT FALSE, 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON FUNCTION reduce_stock_atomic IS 'Atomically reduce product stock with row-level locking to prevent race conditions (TEXT ID version)';
COMMENT ON FUNCTION rollback_stock_reduction IS 'Rollback stock reduction in case of transaction failure (TEXT ID version)';
