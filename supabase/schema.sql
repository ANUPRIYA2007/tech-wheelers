-- ==========================================
-- CROP DAIRY — SUPABASE DATABASE SCHEMA
-- SIH 2026: Farmer Procurement Waiting & Status Platform
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CENTRES TABLE
CREATE TABLE IF NOT EXISTS public.centres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    total_counters INT DEFAULT 4,
    active_counters INT DEFAULT 3,
    avg_processing_time_mins INT DEFAULT 15,
    location_lat DECIMAL(10, 6),
    location_lng DECIMAL(10, 6),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'busy', 'closed'
    operating_hours VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farmer_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    land_acres DECIMAL(6, 2) DEFAULT 0.0,
    primary_crop VARCHAR(100) DEFAULT 'Paddy',
    is_verified BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'farmer', -- 'farmer', 'local_admin', 'super_admin'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_capacity INT DEFAULT 30,
    booked_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'filling_fast', 'full'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUEUE TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.queue_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number VARCHAR(50) NOT NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'waiting', -- 'booked', 'waiting', 'called', 'processing', 'completed', 'cancelled', 'no_show'
    queue_position INT DEFAULT 1,
    estimated_time VARCHAR(50),
    counter_number INT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 5. PROCUREMENTS TABLE
CREATE TABLE IF NOT EXISTS public.procurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number VARCHAR(50) NOT NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    crop_type VARCHAR(100) DEFAULT 'Paddy Grade A',
    moisture_percentage DECIMAL(5, 2) DEFAULT 14.0,
    quality_grade VARCHAR(20) DEFAULT 'Grade A',
    gross_weight_kg DECIMAL(10, 2) DEFAULT 0.0,
    tare_weight_kg DECIMAL(10, 2) DEFAULT 0.0,
    net_weight_kg DECIMAL(10, 2) DEFAULT 0.0,
    price_per_quintal DECIMAL(10, 2) DEFAULT 2203.00, -- MSP for Paddy
    total_payout DECIMAL(12, 2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'graded', -- 'graded', 'accepted', 'rejected'
    verified_by VARCHAR(100) DEFAULT 'Local Officer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    procurement_id UUID REFERENCES public.procurements(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    bank_account_last4 VARCHAR(4) DEFAULT '4321',
    ifsc_code VARCHAR(20) DEFAULT 'SBIN0001234',
    status VARCHAR(50) DEFAULT 'processing', -- 'pending', 'processing', 'completed', 'failed'
    transaction_ref VARCHAR(100),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'queue'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create Open Public Access Policies (for demo & development)
CREATE POLICY "Public Read Centres" ON public.centres FOR SELECT USING (true);
CREATE POLICY "Public Read Farmers" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Public Read Slots" ON public.slots FOR SELECT USING (true);
CREATE POLICY "Public Read Queue Tokens" ON public.queue_tokens FOR SELECT USING (true);
CREATE POLICY "Public Manage Queue Tokens" ON public.queue_tokens FOR ALL USING (true);
CREATE POLICY "Public Read Procurements" ON public.procurements FOR SELECT USING (true);
CREATE POLICY "Public Read Payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public Read Notifications" ON public.notifications FOR SELECT USING (true);

-- Enable Realtime for queue_tokens & procurements & payments
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.procurements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
