-- ==========================================
-- CROP DAIRY — SUPABASE SAMPLE SEED DATA
-- SIH 2026: Farmer Procurement Waiting & Status Platform
-- ==========================================

-- 1. Insert Procurement Centres
INSERT INTO public.centres (centre_code, name, district, state, total_counters, active_counters, avg_processing_time_mins, location_lat, location_lng, address, status, operating_hours)
VALUES 
('DPC-TN-001', 'Thanjavur Main Direct Procurement Centre', 'Thanjavur', 'Tamil Nadu', 4, 3, 12, 10.7869, 79.1378, 'Near Railway Station, Thanjavur, Tamil Nadu 613001', 'active', '09:00 AM - 05:00 PM'),
('DPC-TN-002', 'Thiruvaiyaru Paddy Procurement Hub', 'Thanjavur', 'Tamil Nadu', 3, 2, 15, 10.8800, 79.1000, 'Main Road, Thiruvaiyaru, Tamil Nadu 613204', 'active', '08:30 AM - 04:30 PM'),
('DPC-TN-003', 'Kumbakonam Grain Storage & Procurement Centre', 'Thanjavur', 'Tamil Nadu', 5, 4, 10, 10.9602, 79.3782, 'Bypass Road, Kumbakonam, Tamil Nadu 612001', 'active', '09:00 AM - 06:00 PM'),
('DPC-PB-001', 'Ludhiana Central Mandi Procurement Centre', 'Ludhiana', 'Punjab', 6, 5, 10, 30.9010, 75.8573, 'GT Road, Ludhiana, Punjab 141001', 'active', '08:00 AM - 06:00 PM'),
('DPC-UP-001', 'Varanasi Kisan Mandi Centre', 'Varanasi', 'Uttar Pradesh', 4, 3, 14, 25.3176, 82.9739, 'Chaubepur, Varanasi, Uttar Pradesh 221104', 'active', '09:00 AM - 05:00 PM')
ON CONFLICT (centre_code) DO NOTHING;

-- 2. Insert Sample Farmers
INSERT INTO public.farmers (farmer_id, full_name, phone, village, district, state, land_acres, primary_crop, is_verified, role)
VALUES 
('FRM-TN-001', 'Raman K.', '+91 9876543210', 'Thiruvaiyaru', 'Thanjavur', 'Tamil Nadu', 4.5, 'Paddy Grade A', true, 'farmer'),
('FRM-TN-002', 'Sundaram M.', '+91 9876543211', 'Papanasam', 'Thanjavur', 'Tamil Nadu', 6.0, 'Paddy Common', true, 'farmer'),
('FRM-PB-001', 'Gurpreet Singh', '+91 9876543212', 'Khanna', 'Ludhiana', 'Punjab', 12.0, 'Wheat / Paddy', true, 'farmer'),
('ADM-TN-001', 'Murugan Officer', '+91 9876543213', 'Thanjavur', 'Thanjavur', 'Tamil Nadu', 0.0, 'N/A', true, 'local_admin'),
('SUP-001', 'SIH Super Admin', '+91 9876543214', 'Chennai', 'Chennai', 'Tamil Nadu', 0.0, 'N/A', true, 'super_admin')
ON CONFLICT (farmer_id) DO NOTHING;

-- 3. Insert Queue Tokens
INSERT INTO public.queue_tokens (token_number, farmer_id, centre_id, status, queue_position, estimated_time, counter_number)
SELECT 
    'TK-104', f.id, c.id, 'waiting', 3, '10:45 AM (approx 36 mins wait)', 2
FROM public.farmers f, public.centres c
WHERE f.farmer_id = 'FRM-TN-001' AND c.centre_code = 'DPC-TN-001'
LIMIT 1;

-- 4. Insert Procurements
INSERT INTO public.procurements (token_number, farmer_id, centre_id, crop_type, moisture_percentage, quality_grade, gross_weight_kg, tare_weight_kg, net_weight_kg, price_per_quintal, total_payout, status)
SELECT 
    'TK-102', f.id, c.id, 'Paddy Grade A', 13.8, 'Grade A', 4250.00, 250.00, 4000.00, 2203.00, 88120.00, 'accepted'
FROM public.farmers f, public.centres c
WHERE f.farmer_id = 'FRM-TN-001' AND c.centre_code = 'DPC-TN-001'
LIMIT 1;

-- 5. Insert Payments
INSERT INTO public.payments (farmer_id, amount, bank_account_last4, ifsc_code, status, transaction_ref, paid_at)
SELECT 
    f.id, 88120.00, '4321', 'SBIN0001234', 'completed', 'DBT-2026-TN-981723', NOW() - INTERVAL '2 days'
FROM public.farmers f
WHERE f.farmer_id = 'FRM-TN-001'
LIMIT 1;

-- 6. Insert Notifications
INSERT INTO public.notifications (farmer_id, title, message, type, is_read)
SELECT 
    f.id, 'Queue Update', 'Token TK-104 is currently 3 positions away. Expected turn at Counter 2: 10:45 AM.', 'queue', false
FROM public.farmers f
WHERE f.farmer_id = 'FRM-TN-001'
LIMIT 1;
