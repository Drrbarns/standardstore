-- ============================================================
-- Delivery System Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Delivery Zones
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    description text,
    regions text[] DEFAULT '{}',
    base_fee numeric DEFAULT 0,
    express_fee numeric DEFAULT 0,
    estimated_days text DEFAULT '1-3 days',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage delivery zones" ON public.delivery_zones
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));
CREATE POLICY "Anyone can read active zones" ON public.delivery_zones
    FOR SELECT USING (is_active = true);

-- Riders
CREATE TABLE IF NOT EXISTS public.riders (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    full_name text NOT NULL,
    phone text NOT NULL,
    email text,
    vehicle_type text DEFAULT 'motorcycle',
    license_plate text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_delivery', 'off_duty')),
    avatar_url text,
    zone_id uuid REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
    total_deliveries integer DEFAULT 0,
    successful_deliveries integer DEFAULT 0,
    rating_avg numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage riders" ON public.riders
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE INDEX idx_riders_status ON public.riders(status);
CREATE INDEX idx_riders_zone ON public.riders(zone_id);
CREATE INDEX idx_riders_phone ON public.riders(phone);

-- Delivery Assignments
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
    status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned')),
    priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_at timestamptz DEFAULT now(),
    picked_up_at timestamptz,
    in_transit_at timestamptz,
    delivered_at timestamptz,
    failed_at timestamptz,
    estimated_delivery timestamptz,
    delivery_notes text,
    failure_reason text,
    proof_of_delivery text,
    customer_signature text,
    delivery_fee numeric DEFAULT 0,
    assigned_by uuid REFERENCES auth.users(id),
    zone_id uuid REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage delivery assignments" ON public.delivery_assignments
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE INDEX idx_delivery_assignments_order ON public.delivery_assignments(order_id);
CREATE INDEX idx_delivery_assignments_rider ON public.delivery_assignments(rider_id);
CREATE INDEX idx_delivery_assignments_status ON public.delivery_assignments(status);
CREATE INDEX idx_delivery_assignments_assigned_at ON public.delivery_assignments(assigned_at);

-- Delivery Status History (audit trail)
CREATE TABLE IF NOT EXISTS public.delivery_status_history (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    assignment_id uuid NOT NULL REFERENCES public.delivery_assignments(id) ON DELETE CASCADE,
    old_status text,
    new_status text NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    notes text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.delivery_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view delivery history" ON public.delivery_status_history
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE INDEX idx_delivery_status_history_assignment ON public.delivery_status_history(assignment_id);

-- Function: Update rider stats after delivery
CREATE OR REPLACE FUNCTION public.update_rider_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        UPDATE public.riders
        SET total_deliveries = total_deliveries + 1,
            successful_deliveries = successful_deliveries + 1,
            status = 'active',
            updated_at = now()
        WHERE id = NEW.rider_id;
    END IF;

    IF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
        UPDATE public.riders
        SET total_deliveries = total_deliveries + 1,
            status = 'active',
            updated_at = now()
        WHERE id = NEW.rider_id;
    END IF;

    IF NEW.status IN ('picked_up', 'in_transit') THEN
        UPDATE public.riders SET status = 'on_delivery', updated_at = now() WHERE id = NEW.rider_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_delivery_status_change
    AFTER UPDATE OF status ON public.delivery_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rider_stats();

-- Add delivery permission to existing roles
UPDATE public.roles
SET permissions = permissions || '{"delivery": true}'::jsonb
WHERE id = 'admin';

UPDATE public.roles
SET permissions = permissions || '{"delivery": false}'::jsonb
WHERE id = 'staff' AND NOT (permissions ? 'delivery');
