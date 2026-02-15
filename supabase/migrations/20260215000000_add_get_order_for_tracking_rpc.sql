-- Secure order tracking: allow lookup by order_number OR tracking_number + email.
-- RLS blocks anon from reading orders; this function runs as definer and returns only if email matches.

CREATE OR REPLACE FUNCTION public.get_order_for_tracking(p_order_number text, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  o public.orders;
  items jsonb;
  result jsonb;
  search_term text;
BEGIN
  search_term := trim(p_order_number);
  IF search_term = '' OR p_email IS NULL OR trim(p_email) = '' THEN
    RETURN NULL;
  END IF;

  -- Search by order_number first, then by tracking number in metadata
  SELECT * INTO o FROM public.orders
  WHERE order_number = search_term
  LIMIT 1;

  IF o.id IS NULL THEN
    SELECT * INTO o FROM public.orders
    WHERE metadata->>'tracking_number' = search_term
    LIMIT 1;
  END IF;

  IF o.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Verify email matches
  IF lower(trim(o.email)) <> lower(trim(p_email)) THEN
    RETURN NULL;
  END IF;

  -- Build order items with product image
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'product_name', oi.product_name,
      'variant_name', oi.variant_name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'metadata', COALESCE(oi.metadata, '{}'::jsonb) || jsonb_build_object(
        'image',
        (SELECT pi.url FROM public.product_images pi WHERE pi.product_id = oi.product_id LIMIT 1)
      )
    )
  ) INTO items FROM public.order_items oi WHERE oi.order_id = o.id;

  IF items IS NULL THEN items := '[]'::jsonb; END IF;

  result := jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'total', o.total,
    'email', o.email,
    'created_at', o.created_at,
    'shipping_address', COALESCE(o.shipping_address, '{}'::jsonb),
    'metadata', COALESCE(o.metadata, '{}'::jsonb),
    'order_items', items
  );

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_order_for_tracking(text, text) IS 'Returns order for tracking by order number OR tracking number, only if email matches.';

GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(text, text) TO authenticated;
