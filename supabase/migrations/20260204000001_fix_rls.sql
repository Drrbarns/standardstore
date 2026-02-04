-- Fix RLS policies to allow guest checkout and order creation
-- Generated 2026-02-04

-- 1. Update Orders Policy (Insert)
DROP POLICY IF EXISTS "Users create own orders" ON orders;

CREATE POLICY "Enable insert for all users" ON orders FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
    OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- 2. Update Order Items Policy (Insert)
CREATE POLICY "Enable insert for order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (
            (orders.user_id = auth.uid()) 
            OR (orders.user_id IS NULL)
        )
    )
);

-- 3. Update Policies for Guest Select (Order Success Page)
CREATE POLICY "Enable select for guest orders" ON orders FOR SELECT USING (user_id IS NULL);

CREATE POLICY "Enable select for guest order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id IS NULL
    )
);
