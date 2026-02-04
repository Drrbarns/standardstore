-- Update mark_order_paid to reduce stock when payment is verified
CREATE OR REPLACE FUNCTION mark_order_paid(order_ref TEXT, moolre_ref TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_order orders;
BEGIN
  -- 1. Try to update the order (Idempotency Check: prevent double decrement)
  UPDATE orders
  SET 
    payment_status = 'paid',
    status = 'processing',
    metadata = COALESCE(metadata, '{}'::jsonb) || 
               jsonb_build_object(
                   'moolre_reference', moolre_ref,
                   'payment_verified_at', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
               )
  WHERE order_number = order_ref
    AND (payment_status IS DISTINCT FROM 'paid') -- Only update if not already paid
  RETURNING * INTO updated_order;

  -- 2. If Update Happened (meaning it was previously pending/failed)
  IF updated_order IS NOT NULL THEN
      -- Reduce Stock for each item
      UPDATE products p
      SET quantity = p.quantity - oi.quantity
      FROM order_items oi
      WHERE oi.order_id = updated_order.id
        AND oi.product_id = p.id;
  ELSE
      -- 3. If no update happened (already paid), just fetch the existing order
      SELECT * INTO updated_order FROM orders WHERE order_number = order_ref;
  END IF;

  RETURN to_jsonb(updated_order);
END;
$$;

GRANT EXECUTE ON FUNCTION mark_order_paid TO anon;
GRANT EXECUTE ON FUNCTION mark_order_paid TO authenticated;
GRANT EXECUTE ON FUNCTION mark_order_paid TO service_role;
