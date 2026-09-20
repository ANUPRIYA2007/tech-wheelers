import { useState, useEffect, useCallback } from 'react';
import { getMyBookings } from '../services/bookingService';
import { supabase } from '../services/supabase';

export function useMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();

    // Listen to local custom window events
    const handleLocalUpdate = () => fetchBookings();
    window.addEventListener('booking_updated', handleLocalUpdate);

    // Supabase Realtime Subscription for authenticated farmer's bookings
    const channel = supabase
      .channel('my_bookings_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slot_bookings' },
        (payload) => {
          console.log('Realtime slot booking change:', payload);
          fetchBookings();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_tokens' },
        (payload) => {
          console.log('Realtime queue token change:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('booking_updated', handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  return {
    bookings,
    activeBooking: bookings.find(b => b.booking_status === 'CONFIRMED') || bookings[0] || null,
    loading,
    error,
    refreshBookings: fetchBookings
  };
}
