-- Create customers table to store all customer information (guests and registered)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for guest customers
  default_address JSONB,
  notes TEXT,
  tags TEXT[],
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT customers_email_unique UNIQUE (email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view all customers" ON customers 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can manage customers" ON customers 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Allow service role full access (for callbacks and server-side operations)
CREATE POLICY "Service role full access to customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');

-- Function to upsert customer from order
CREATE OR REPLACE FUNCTION upsert_customer_from_order(
  p_email TEXT,
  p_phone TEXT,
  p_full_name TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_user_id UUID DEFAULT NULL,
  p_address JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Try to find existing customer by email
  SELECT id INTO v_customer_id FROM customers WHERE email = p_email;
  
  IF v_customer_id IS NULL THEN
    -- Create new customer
    INSERT INTO customers (email, phone, full_name, first_name, last_name, user_id, default_address)
    VALUES (p_email, p_phone, p_full_name, p_first_name, p_last_name, p_user_id, p_address)
    RETURNING id INTO v_customer_id;
  ELSE
    -- Update existing customer with latest info
    UPDATE customers SET
      phone = COALESCE(p_phone, phone),
      full_name = COALESCE(p_full_name, full_name),
      first_name = COALESCE(p_first_name, first_name),
      last_name = COALESCE(p_last_name, last_name),
      user_id = COALESCE(p_user_id, user_id),
      default_address = COALESCE(p_address, default_address),
      updated_at = NOW()
    WHERE id = v_customer_id;
  END IF;
  
  RETURN v_customer_id;
END;
$$;

-- Function to update customer stats after order
CREATE OR REPLACE FUNCTION update_customer_stats(p_customer_email TEXT, p_order_total DECIMAL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE customers SET
    total_orders = total_orders + 1,
    total_spent = total_spent + p_order_total,
    last_order_at = NOW(),
    updated_at = NOW()
  WHERE email = p_customer_email;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION upsert_customer_from_order TO anon;
GRANT EXECUTE ON FUNCTION upsert_customer_from_order TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_customer_from_order TO service_role;
GRANT EXECUTE ON FUNCTION update_customer_stats TO anon;
GRANT EXECUTE ON FUNCTION update_customer_stats TO authenticated;
GRANT EXECUTE ON FUNCTION update_customer_stats TO service_role;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Migrate existing profiles to customers table
INSERT INTO customers (email, phone, full_name, user_id, created_at)
SELECT 
  p.email,
  p.phone,
  p.full_name,
  p.id as user_id,
  p.created_at
FROM profiles p
WHERE p.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  full_name = COALESCE(EXCLUDED.full_name, customers.full_name);

-- Migrate guest orders to customers table
INSERT INTO customers (email, phone, full_name, first_name, last_name, default_address, created_at)
SELECT DISTINCT ON (o.email)
  o.email,
  o.phone,
  COALESCE(
    o.shipping_address->>'full_name',
    CONCAT(o.shipping_address->>'firstName', ' ', o.shipping_address->>'lastName')
  ) as full_name,
  o.shipping_address->>'firstName' as first_name,
  o.shipping_address->>'lastName' as last_name,
  o.shipping_address as default_address,
  MIN(o.created_at) as created_at
FROM orders o
WHERE o.user_id IS NULL AND o.email IS NOT NULL
GROUP BY o.email, o.phone, o.shipping_address
ON CONFLICT (email) DO UPDATE SET
  phone = COALESCE(EXCLUDED.phone, customers.phone),
  full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
  first_name = COALESCE(EXCLUDED.first_name, customers.first_name),
  last_name = COALESCE(EXCLUDED.last_name, customers.last_name),
  default_address = COALESCE(EXCLUDED.default_address, customers.default_address);

-- Update customer stats from existing orders
WITH order_stats AS (
  SELECT 
    email,
    COUNT(*) as order_count,
    SUM(total) as total_spent,
    MAX(created_at) as last_order
  FROM orders
  WHERE status != 'cancelled' AND email IS NOT NULL
  GROUP BY email
)
UPDATE customers c SET
  total_orders = os.order_count,
  total_spent = os.total_spent,
  last_order_at = os.last_order
FROM order_stats os
WHERE c.email = os.email;
