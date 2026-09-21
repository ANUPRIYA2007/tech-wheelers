import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getCentreQueue, callNextToken, updateTokenStatus } from '../services/bookingService';

export function useLiveQueue(centreId) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callingNext, setCallingNext] = useState(false);

  const fetchQueue = useCallback(async () => {
    if (!centreId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCentreQueue(centreId);
      setQueue(data || []);
    } catch (err) {
      console.error('Error fetching live centre queue:', err);
      setError(err.message || 'Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  }, [centreId]);

  useEffect(() => {
    if (!centreId) return;

    fetchQueue();

    // Listen to local custom window events
    const handleLocalUpdate = () => fetchQueue();
    window.addEventListener('booking_updated', handleLocalUpdate);

    // Supabase Realtime Subscription for this specific centre's queue_tokens
    const channel = supabase
      .channel(`live_queue_centre_${centreId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_tokens',
          filter: `centre_id=eq.${centreId}`,
        },
        (payload) => {
          console.log('Realtime queue token update for centre:', payload);
          fetchQueue();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slot_bookings',
        },
        (payload) => {
          console.log('Realtime slot booking change:', payload);
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('booking_updated', handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, [centreId, fetchQueue]);

  const handleCallNext = async (counterNum = 1) => {
    if (!centreId || callingNext) return null;
    setCallingNext(true);
    try {
      const result = await callNextToken(centreId, counterNum);
      await fetchQueue();
      return result;
    } catch (err) {
      console.error('Error calling next token:', err);
      return { success: false, error: err.message };
    } finally {
      setCallingNext(false);
    }
  };

  const handleUpdateStatus = async (tokenId, status, counterNum) => {
    try {
      const result = await updateTokenStatus(tokenId, status, counterNum);
      await fetchQueue();
      return result;
    } catch (err) {
      console.error('Error updating token status:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    queue,
    loading,
    error,
    callingNext,
    refreshQueue: fetchQueue,
    callNextToken: handleCallNext,
    updateTokenStatus: handleUpdateStatus,
  };
}

export default useLiveQueue;
