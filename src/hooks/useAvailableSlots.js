import { useState, useEffect, useCallback } from 'react';
import { getAvailableSlots } from '../services/bookingService';
import { supabase } from '../services/supabase';

export function useAvailableSlots(centreId, dateStr) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async () => {
    if (!centreId || !dateStr) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableSlots(centreId, dateStr);
      setSlots(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  }, [centreId, dateStr]);

  useEffect(() => {
    fetchSlots();

    if (!centreId) return;

    // Supabase Realtime channel listening for slot capacity changes
    const channel = supabase
      .channel(`available_slots_${centreId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'procurement_slots',
          filter: `centre_id=eq.${centreId}`
        },
        (payload) => {
          console.log('Realtime slot capacity updated:', payload);
          fetchSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [centreId, dateStr, fetchSlots]);

  return {
    slots,
    loading,
    error,
    refreshSlots: fetchSlots
  };
}
