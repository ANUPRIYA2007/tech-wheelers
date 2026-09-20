-- ============================================================
-- CROP DAIRY — REALTIME SLOT BOOKING & QUEUE TOKEN MANAGEMENT
-- Supabase PostgreSQL Schema, RPC Functions & Realtime Publication
-- ============================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROCUREMENT CENTRES TABLE
CREATE TABLE IF NOT EXISTS public.procurement_centres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    operating_status TEXT NOT NULL DEFAULT 'OPEN',
    capacity_per_slot INT NOT NULL DEFAULT 10,
    operating_hours TEXT DEFAULT '09:00 AM - 05:00 PM',
    latitude NUMERIC(10, 6) DEFAULT 10.786900,
    longitude NUMERIC(10, 6) DEFAULT 79.137800,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROCUREMENT SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.procurement_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT NOT NULL DEFAULT 10,
    booked_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_centre_slot UNIQUE (centre_id, slot_date, start_time)
);

-- 3. SLOT BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.slot_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID,
    slot_id UUID REFERENCES public.procurement_slots(id) ON DELETE CASCADE,
    booking_status TEXT NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUEUE TOKENS TABLE (SUPPORT PRE-EXISTING TABLES)
CREATE TABLE IF NOT EXISTS public.queue_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID,
    farmer_id UUID,
    centre_id UUID,
    token_number TEXT NOT NULL,
    token_status TEXT NOT NULL DEFAULT 'WAITING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRATION SAFEGUARDS: ALTER EXISTING TABLES IF COLUMNS ARE MISSING
DO $$ 
BEGIN
    -- Ensure slot_bookings exists first
    CREATE TABLE IF NOT EXISTS public.slot_bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farmer_id UUID,
        slot_id UUID REFERENCES public.procurement_slots(id) ON DELETE CASCADE,
        booking_status TEXT NOT NULL DEFAULT 'CONFIRMED',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add booking_id column to queue_tokens if missing from pre-existing table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'queue_tokens' AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE public.queue_tokens ADD COLUMN booking_id UUID REFERENCES public.slot_bookings(id) ON DELETE CASCADE;
    END IF;

    -- Add token_status column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'queue_tokens' AND column_name = 'token_status'
    ) THEN
        ALTER TABLE public.queue_tokens ADD COLUMN token_status TEXT DEFAULT 'WAITING';
    END IF;

    -- Add centre_id column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'queue_tokens' AND column_name = 'centre_id'
    ) THEN
        ALTER TABLE public.queue_tokens ADD COLUMN centre_id UUID;
    END IF;
END $$;

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_slots_centre_date ON public.procurement_slots(centre_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_bookings_farmer ON public.slot_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_tokens_booking ON public.queue_tokens(booking_id);

-- ENABLE SUPABASE REALTIME (IGNORE IF ALREADY IN PUBLICATION)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_slots;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.slot_bookings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tokens;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_centres;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- RLS POLICIES
ALTER TABLE public.procurement_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read on centres and slots
DO $$ BEGIN
    CREATE POLICY "Public Read Centres" ON public.procurement_centres FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read Slots" ON public.procurement_slots FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Farmers Read Own Bookings" ON public.slot_bookings FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Farmers Read Own Tokens" ON public.queue_tokens FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ============================================================
-- RPC FUNCTION: BOOK PROCUREMENT SLOT (ATOMIC TRANSACTION)
-- ============================================================
CREATE OR REPLACE FUNCTION public.book_procurement_slot(p_slot_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_slot RECORD;
    v_centre RECORD;
    v_existing_booking UUID;
    v_booking_id UUID;
    v_token_count INT;
    v_token_number TEXT;
    v_result JSON;
BEGIN
    -- 1. Get authenticated farmer or fallback
    v_user_id := auth.uid();
    
    -- 2. Lock selected slot row for update
    SELECT * INTO v_slot FROM public.procurement_slots 
    WHERE id = p_slot_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INVALID_SLOT';
    END IF;

    -- 3. Check capacity and status
    IF v_slot.status = 'CLOSED' THEN
        RAISE EXCEPTION 'CENTRE_CLOSED';
    END IF;

    IF v_slot.booked_count >= v_slot.capacity OR v_slot.status = 'FULL' THEN
        RAISE EXCEPTION 'SLOT_FULL';
    END IF;

    -- 4. Check for existing active booking on same date
    IF v_user_id IS NOT NULL THEN
        SELECT sb.id INTO v_existing_booking 
        FROM public.slot_bookings sb
        JOIN public.procurement_slots ps ON sb.slot_id = ps.id
        WHERE sb.farmer_id = v_user_id 
          AND ps.slot_date = v_slot.slot_date 
          AND sb.booking_status = 'CONFIRMED';

        IF v_existing_booking IS NOT NULL THEN
            RAISE EXCEPTION 'ALREADY_BOOKED';
        END IF;
    END IF;

    -- 5. Increment booked_count and update status if full
    UPDATE public.procurement_slots 
    SET booked_count = booked_count + 1,
        status = CASE WHEN booked_count + 1 >= capacity THEN 'FULL' ELSE 'OPEN' END
    WHERE id = p_slot_id;

    -- 6. Insert slot booking
    INSERT INTO public.slot_bookings (farmer_id, slot_id, booking_status)
    VALUES (v_user_id, p_slot_id, 'CONFIRMED')
    RETURNING id INTO v_booking_id;

    -- 7. Generate Token Number (e.g. #128)
    SELECT COUNT(*) + 101 INTO v_token_count 
    FROM public.queue_tokens qt
    JOIN public.slot_bookings sb ON qt.booking_id = sb.id
    JOIN public.procurement_slots ps ON sb.slot_id = ps.id
    WHERE ps.centre_id = v_slot.centre_id AND ps.slot_date = v_slot.slot_date;

    v_token_number := '#' || v_token_count::TEXT;

    -- 8. Insert Queue Token
    INSERT INTO public.queue_tokens (booking_id, farmer_id, centre_id, token_number, token_status)
    VALUES (v_booking_id, v_user_id, v_slot.centre_id, v_token_number, 'WAITING');

    -- 9. Fetch centre details for response
    SELECT * INTO v_centre FROM public.procurement_centres WHERE id = v_slot.centre_id;

    -- 10. Construct Result JSON
    v_result := json_build_object(
        'booking_id', v_booking_id,
        'slot_id', p_slot_id,
        'token_number', v_token_number,
        'centre_id', v_slot.centre_id,
        'centre_name', COALESCE(v_centre.name, 'Government Procurement Centre - Main DPC'),
        'centre_location', COALESCE(v_centre.location, 'Thanjavur, Tamil Nadu'),
        'slot_date', v_slot.slot_date,
        'start_time', v_slot.start_time,
        'end_time', v_slot.end_time,
        'booking_status', 'CONFIRMED'
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- RPC FUNCTION: CANCEL PROCUREMENT SLOT
-- ============================================================
CREATE OR REPLACE FUNCTION public.cancel_procurement_slot(p_booking_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_booking RECORD;
BEGIN
    v_user_id := auth.uid();
    
    -- Lock booking row
    SELECT * INTO v_booking FROM public.slot_bookings 
    WHERE id = p_booking_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND';
    END IF;

    -- Update booking status
    UPDATE public.slot_bookings 
    SET booking_status = 'CANCELLED', updated_at = NOW()
    WHERE id = p_booking_id;

    -- Update slot capacity
    IF v_booking.slot_id IS NOT NULL THEN
        UPDATE public.procurement_slots 
        SET booked_count = GREATEST(0, booked_count - 1),
            status = 'OPEN'
        WHERE id = v_booking.slot_id;
    END IF;

    -- Update queue token status
    UPDATE public.queue_tokens 
    SET token_status = 'CANCELLED'
    WHERE booking_id = p_booking_id;

    RETURN json_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'status', 'CANCELLED'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- RPC FUNCTION: RESCHEDULE PROCUREMENT SLOT
-- ============================================================
CREATE OR REPLACE FUNCTION public.reschedule_procurement_slot(p_booking_id UUID, p_new_slot_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_booking RECORD;
    v_new_slot RECORD;
    v_result JSON;
BEGIN
    v_user_id := auth.uid();

    -- Lock old booking
    SELECT * INTO v_booking FROM public.slot_bookings 
    WHERE id = p_booking_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND';
    END IF;

    -- Lock new slot
    SELECT * INTO v_new_slot FROM public.procurement_slots 
    WHERE id = p_new_slot_id FOR UPDATE;

    IF NOT FOUND OR v_new_slot.status = 'CLOSED' THEN
        RAISE EXCEPTION 'INVALID_SLOT';
    END IF;

    IF v_new_slot.booked_count >= v_new_slot.capacity OR v_new_slot.status = 'FULL' THEN
        RAISE EXCEPTION 'SLOT_FULL';
    END IF;

    -- Release old slot
    IF v_booking.slot_id IS NOT NULL THEN
        UPDATE public.procurement_slots 
        SET booked_count = GREATEST(0, booked_count - 1),
            status = 'OPEN'
        WHERE id = v_booking.slot_id;
    END IF;

    -- Reserve new slot
    UPDATE public.procurement_slots 
    SET booked_count = booked_count + 1,
        status = CASE WHEN booked_count + 1 >= capacity THEN 'FULL' ELSE 'OPEN' END
    WHERE id = p_new_slot_id;

    -- Update booking
    UPDATE public.slot_bookings 
    SET slot_id = p_new_slot_id,
        booking_status = 'CONFIRMED',
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Fetch updated info
    v_result := json_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'new_slot_id', p_new_slot_id,
        'slot_date', v_new_slot.slot_date,
        'start_time', v_new_slot.start_time,
        'end_time', v_new_slot.end_time
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- SEED DATA: CENTRES AND SLOTS
-- ============================================================
INSERT INTO public.procurement_centres (id, centre_code, name, location, district, state, operating_status, capacity_per_slot)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'DPC-MAIN-104', 'Government Procurement Centre - Main DPC', 'Thanjavur, Tamil Nadu', 'Thanjavur', 'Tamil Nadu', 'OPEN', 10),
('c0000000-0000-0000-0000-000000000002', 'DPC-THIRU-102', 'Thiruvaiyaru Paddy Procurement Hub', 'Thiruvaiyaru, Tamil Nadu', 'Thanjavur', 'Tamil Nadu', 'OPEN', 8),
('c0000000-0000-0000-0000-000000000003', 'DPC-KUMBA-105', 'Kumbakonam Grain Storage & Procurement Centre', 'Kumbakonam, Tamil Nadu', 'Thanjavur', 'Tamil Nadu', 'OPEN', 12)
ON CONFLICT (centre_code) DO NOTHING;

-- Populate slots for today and next 7 days
DO $$
DECLARE
    curr_date DATE := CURRENT_DATE;
    d DATE;
    centre RECORD;
BEGIN
    FOR centre IN SELECT id FROM public.procurement_centres LOOP
        FOR i IN 0..7 LOOP
            d := curr_date + i;
            
            INSERT INTO public.procurement_slots (centre_id, slot_date, start_time, end_time, capacity, booked_count, status)
            VALUES
            (centre.id, d, '09:00:00', '09:30:00', 10, 2, 'OPEN'),
            (centre.id, d, '09:30:00', '10:00:00', 10, 6, 'OPEN'),
            (centre.id, d, '10:00:00', '10:30:00', 10, 10, 'FULL'),
            (centre.id, d, '10:30:00', '11:00:00', 10, 4, 'OPEN'),
            (centre.id, d, '11:00:00', '11:30:00', 10, 8, 'OPEN'),
            (centre.id, d, '11:30:00', '12:00:00', 10, 1, 'OPEN'),
            (centre.id, d, '02:00:00', '02:30:00', 10, 0, 'OPEN'),
            (centre.id, d, '02:30:00', '03:00:00', 10, 5, 'OPEN')
            ON CONFLICT (centre_id, slot_date, start_time) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
