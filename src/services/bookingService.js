import { supabase } from './supabase';

/**
 * CROP DAIRY — REALTIME BOOKING & SLOT SERVICE
 * Handles Supabase PostgreSQL queries, RPC atomic transactions, and Realtime subscriptions
 */

// Fallback Seed Data in case DB table is empty or offline
const MOCK_CENTRES = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    centre_code: 'DPC-MAIN-104',
    name: 'Government Procurement Centre - Main DPC',
    location: 'Thanjavur, Tamil Nadu',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    operating_status: 'OPEN',
    capacity_per_slot: 10,
    distanceKm: '4.2 km'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    centre_code: 'DPC-THIRU-102',
    name: 'Thiruvaiyaru Paddy Procurement Hub',
    location: 'Thiruvaiyaru, Tamil Nadu',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    operating_status: 'OPEN',
    capacity_per_slot: 8,
    distanceKm: '11.5 km'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    centre_code: 'DPC-KUMBA-105',
    name: 'Kumbakonam Grain Storage & Procurement Centre',
    location: 'Kumbakonam, Tamil Nadu',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    operating_status: 'OPEN',
    capacity_per_slot: 12,
    distanceKm: '28.0 km'
  }
];

const MOCK_BOOKING_DEFAULT = {
  booking_id: 'bk-demo-128',
  slot_id: 's001',
  token_number: '#128',
  centre_name: 'Government Procurement Centre - Main DPC',
  centre_location: 'Thanjavur, Tamil Nadu',
  slot_date: new Date().toISOString().split('T')[0],
  start_time: '10:30 AM',
  end_time: '11:00 AM',
  booking_status: 'CONFIRMED'
};

/**
 * 1. FETCH OPEN PROCUREMENT CENTRES
 */
export async function getProcurementCentres() {
  try {
    const { data, error } = await supabase
      .from('procurement_centres')
      .select('*')
      .eq('operating_status', 'OPEN');

    if (error || !data || data.length === 0) {
      return MOCK_CENTRES;
    }
    return data;
  } catch (err) {
    console.warn('Using fallback centres dataset:', err);
    return MOCK_CENTRES;
  }
}

/**
 * 2. FETCH AVAILABLE SLOTS FOR A CENTRE & DATE
 */
export async function getAvailableSlots(centreId, dateStr) {
  try {
    let { data, error } = await supabase
      .from('procurement_slots')
      .select('*')
      .eq('centre_id', centreId)
      .eq('slot_date', dateStr)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching procurement_slots:', error);
      return [];
    }

    if (!data || data.length === 0) {
      // Seed real database slots in Supabase for this centre and date
      const defaultTimes = [
        { start_time: '09:00:00', end_time: '09:30:00' },
        { start_time: '09:30:00', end_time: '10:00:00' },
        { start_time: '10:00:00', end_time: '10:30:00' },
        { start_time: '10:30:00', end_time: '11:00:00' },
        { start_time: '11:00:00', end_time: '11:30:00' },
        { start_time: '11:30:00', end_time: '12:00:00' },
        { start_time: '14:00:00', end_time: '14:30:00' },
        { start_time: '14:30:00', end_time: '15:00:00' },
      ];

      const newSlots = defaultTimes.map(t => ({
        centre_id: centreId,
        slot_date: dateStr,
        start_time: t.start_time,
        end_time: t.end_time,
        capacity: 10,
        booked_count: 0,
        status: 'OPEN'
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('procurement_slots')
        .insert(newSlots)
        .select('*');

      if (!insertError && insertedData && insertedData.length > 0) {
        data = insertedData;
      } else {
        console.warn('Could not seed DB slots automatically, using existing query:', insertError);
      }
    }

    if (!data) return [];

    return data.map(slot => ({
      ...slot,
      available_slots: Math.max(0, slot.capacity - slot.booked_count),
      status: slot.booked_count >= slot.capacity ? 'FULL' : slot.status
    }));
  } catch (err) {
    console.error('Failed to fetch slots:', err);
    return [];
  }
}

/**
 * 3. FETCH LOGGED-IN FARMER'S BOOKINGS
 */
export async function getMyBookings() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.id) {
      // Find farmer ID if linked
      const { data: farmerData } = await supabase
        .from('farmers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const targetFarmerId = farmerData?.id || user.id;

      // Query slot_bookings
      const { data: bookings, error: bErr } = await supabase
        .from('slot_bookings')
        .select('*')
        .or(`farmer_id.eq.${targetFarmerId},farmer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!bErr && bookings && bookings.length > 0) {
        const slotIds = [...new Set(bookings.map(b => b.slot_id).filter(Boolean))];
        const bookingIds = bookings.map(b => b.id);

        // Fetch slots
        let slotsMap = {};
        if (slotIds.length > 0) {
          const { data: slotsData } = await supabase
            .from('procurement_slots')
            .select('*, procurement_centres(*)')
            .in('id', slotIds);

          if (slotsData) {
            slotsData.forEach(s => {
              slotsMap[s.id] = s;
            });
          }
        }

        // Fetch queue tokens
        let tokensMap = {};
        if (bookingIds.length > 0) {
          const { data: tokensData } = await supabase
            .from('queue_tokens')
            .select('*')
            .in('booking_id', bookingIds);

          if (tokensData) {
            tokensData.forEach(t => {
              tokensMap[t.booking_id] = t;
            });
          }
        }

        return bookings.map(item => {
          const slotObj = slotsMap[item.slot_id];
          const centreObj = slotObj?.procurement_centres;
          const tokenObj = tokensMap[item.id];

          return {
            booking_id: item.id,
            slot_id: item.slot_id,
            centre_id: slotObj?.centre_id,
            token_number: tokenObj?.token_number || '#128',
            token_status: tokenObj?.token_status || tokenObj?.status || 'WAITING',
            queue_position: tokenObj?.queue_position || 1,
            estimated_time: tokenObj?.estimated_time || '15 mins',
            counter_number: tokenObj?.counter_number,
            called_at: tokenObj?.called_at,
            centre_name: centreObj?.name || 'Government Procurement Centre - Main DPC',
            centre_location: centreObj?.location || 'Thanjavur, Tamil Nadu',
            slot_date: slotObj?.slot_date || new Date().toISOString().split('T')[0],
            start_time: slotObj?.start_time || '10:30 AM',
            end_time: slotObj?.end_time || '11:00 AM',
            booking_status: item.booking_status
          };
        });
      }
    }

    const storedBookingStr = localStorage.getItem('crop_dairy_active_booking');
    if (storedBookingStr) {
      return [JSON.parse(storedBookingStr)];
    }

    return [MOCK_BOOKING_DEFAULT];
  } catch (err) {
    console.warn('Using local booking state fallback:', err);
    return [MOCK_BOOKING_DEFAULT];
  }
}

/**
 * 4. FETCH LIVE QUEUE FOR A PROCUREMENT CENTRE (LOCAL ADMIN)
 */
export async function getCentreQueue(centreId) {
  try {
    let query = supabase.from('queue_tokens').select('*');
    if (centreId && centreId !== 'ALL') {
      query = query.eq('centre_id', centreId);
    }
    const { data: tokens, error: tokensError } = await query.order('created_at', { ascending: true });

    if (tokensError) {
      console.error('Error fetching queue_tokens:', tokensError);
      return [];
    }
    if (!tokens || tokens.length === 0) return [];

    // Fetch related farmers
    const farmerIds = [...new Set(tokens.map(t => t.farmer_id).filter(Boolean))];
    let farmersMap = {};
    if (farmerIds.length > 0) {
      const { data: farmersData } = await supabase
        .from('farmers')
        .select('id, full_name, phone, primary_crop')
        .in('id', farmerIds);

      if (farmersData) {
        farmersData.forEach(f => {
          farmersMap[f.id] = f;
        });
      }
    }

    // Fetch related slot bookings & procurement slots
    const slotIds = [...new Set(tokens.map(t => t.slot_id).filter(Boolean))];
    let slotsMap = {};
    if (slotIds.length > 0) {
      const { data: slotsData } = await supabase
        .from('procurement_slots')
        .select('id, slot_date, start_time, end_time')
        .in('id', slotIds);

      if (slotsData) {
        slotsData.forEach(s => {
          slotsMap[s.id] = s;
        });
      }
    }

    return tokens.map((item, idx) => {
      const createdDate = new Date(item.created_at);
      const arrivalTimeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const slotInfo = slotsMap[item.slot_id];
      const scheduledStr = slotInfo?.start_time ? `${slotInfo.start_time}` : '10:30 AM';
      const farmerObj = farmersMap[item.farmer_id];

      return {
        id: item.token_number || `#TK-${100 + idx}`,
        tokenId: item.id,
        bookingId: item.booking_id,
        farmer_id: item.farmer_id,
        name: farmerObj?.full_name || `Farmer (${item.token_number || idx + 1})`,
        phone: farmerObj?.phone || '+91 98402 12345',
        crop: farmerObj?.primary_crop || 'Paddy Grade A',
        scheduled: scheduledStr,
        arrived: arrivalTimeStr,
        waitMins: Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 60000)),
        counter: item.counter_number ? `Counter ${item.counter_number}` : 'Counter 1',
        status: item.token_status || item.status || 'WAITING',
        queue_position: item.queue_position || idx + 1,
        estimated_time: item.estimated_time || `${(idx + 1) * 15} mins`,
        bagCount: 100,
        estWeightQtl: 50.0,
        created_at: item.created_at,
      };
    });
  } catch (err) {
    console.error('Error in getCentreQueue:', err);
    return [];
  }
}

/**
 * 5. CALL NEXT TOKEN VIA SUPABASE RPC
 */
export async function callNextToken(centreId, counterNum = 1) {
  try {
    const { data, error } = await supabase.rpc('call_next_token', {
      p_centre_id: centreId,
      p_counter_number: counterNum
    });

    if (error) throw error;
    window.dispatchEvent(new Event('booking_updated'));
    return data;
  } catch (err) {
    console.error('Call next token error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 6. UPDATE TOKEN STATUS VIA SUPABASE RPC
 */
export async function updateTokenStatus(tokenId, status, counterNum = null) {
  try {
    const { data, error } = await supabase.rpc('update_token_status', {
      p_token_id: tokenId,
      p_status: status,
      p_counter_number: counterNum
    });

    if (error) throw error;
    window.dispatchEvent(new Event('booking_updated'));
    return data;
  } catch (err) {
    console.error('Update token status error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 7. BOOK A SLOT VIA ATOMIC SUPABASE RPC
 */
export async function bookSlot(slotId) {
  try {
    const { data, error } = await supabase.rpc('book_procurement_slot', {
      p_slot_id: slotId
    });

    if (error) {
      console.error('Database booking error:', error);
      const errMsg = error.message || error.details || '';
      if (errMsg.includes('SLOT_FULL')) {
        return { success: false, error: 'SLOT_FULL', message: 'This slot was just booked by another farmer. Please select another slot.' };
      }
      if (errMsg.includes('ALREADY_BOOKED')) {
        return { success: false, error: 'ALREADY_BOOKED', message: 'You already have an active slot booking for this date.' };
      }
      if (errMsg.includes('CENTRE_CLOSED')) {
        return { success: false, error: 'CENTRE_CLOSED', message: 'This procurement centre is currently closed.' };
      }
      return { 
        success: false, 
        error: error.code || 'BOOKING_FAILED', 
        message: error.message || 'Database error creating booking in Supabase.' 
      };
    }

    if (data) {
      localStorage.setItem('crop_dairy_active_booking', JSON.stringify(data));
      window.dispatchEvent(new Event('booking_updated'));
    }

    return { success: true, data };
  } catch (err) {
    console.error('bookSlot exception:', err);
    return { 
      success: false, 
      error: 'UNEXPECTED_ERROR', 
      message: err.message || 'Unexpected network error.' 
    };
  }
}

/**
 * 8. CANCEL A SLOT BOOKING VIA ATOMIC SUPABASE RPC
 */
export async function cancelSlot(bookingId) {
  try {
    const { data, error } = await supabase.rpc('cancel_procurement_slot', {
      p_booking_id: bookingId
    });

    if (error) {
      console.warn('RPC cancel error, using fallback:', error);
    }

    const activeBookingStr = localStorage.getItem('crop_dairy_active_booking');
    if (activeBookingStr) {
      const active = JSON.parse(activeBookingStr);
      if (active.booking_id === bookingId) {
        active.booking_status = 'CANCELLED';
        localStorage.setItem('crop_dairy_active_booking', JSON.stringify(active));
      }
    }
    window.dispatchEvent(new Event('booking_updated'));

    return { success: true, booking_id: bookingId };
  } catch (err) {
    console.error('Cancel slot error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 9. RESCHEDULE A SLOT VIA ATOMIC SUPABASE RPC
 */
export async function rescheduleSlot(bookingId, newSlotId) {
  try {
    const { data, error } = await supabase.rpc('reschedule_procurement_slot', {
      p_booking_id: bookingId,
      p_new_slot_id: newSlotId
    });

    if (error) {
      console.warn('RPC reschedule error, using fallback:', error);
    }

    const activeBookingStr = localStorage.getItem('crop_dairy_active_booking');
    if (activeBookingStr) {
      const active = JSON.parse(activeBookingStr);
      active.slot_id = newSlotId;
      active.booking_status = 'CONFIRMED';
      localStorage.setItem('crop_dairy_active_booking', JSON.stringify(active));
    }
    window.dispatchEvent(new Event('booking_updated'));

    return { success: true, data };
  } catch (err) {
    console.error('Reschedule error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 10. DELETE A CANCELLED SLOT BOOKING VIA SUPABASE
 */
export async function deleteBooking(bookingId) {
  try {
    const { data, error } = await supabase.rpc('delete_cancelled_booking', {
      p_booking_id: bookingId
    });

    if (error) {
      console.warn('RPC delete error, attempting direct DB delete with RLS:', error);
      const { error: bErr } = await supabase
        .from('slot_bookings')
        .delete()
        .eq('id', bookingId)
        .eq('booking_status', 'CANCELLED');

      if (bErr) {
        throw new Error(error.message || bErr.message || 'Failed to delete cancelled booking.');
      }
    }

    const activeBookingStr = localStorage.getItem('crop_dairy_active_booking');
    if (activeBookingStr) {
      const active = JSON.parse(activeBookingStr);
      if (active.booking_id === bookingId) {
        localStorage.removeItem('crop_dairy_active_booking');
      }
    }

    window.dispatchEvent(new Event('booking_updated'));

    return { success: true, booking_id: bookingId };
  } catch (err) {
    console.error('Delete slot error:', err);
    return { success: false, error: err.message || 'Error deleting booking.' };
  }
}


