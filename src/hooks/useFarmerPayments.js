import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

// Helper to format clean user-facing status
export function getHumanReadablePaymentStatus(statusStr = '') {
  const s = String(statusStr).toLowerCase();
  if (s === 'completed' || s === 'paid') return 'Payment Completed';
  if (s === 'processing' || s === 'payment_processing') return 'Processing';
  if (s === 'failed' || s === 'rejected') return 'Failed';
  return 'Payment Pending';
}

export function useFarmerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'CONNECTED' | 'RECONNECTING'
  const prevCompletedSetRef = useRef(new Set());

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let targetFarmerId = null;

      if (user?.id) {
        const { data: farmerData } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        targetFarmerId = farmerData?.id || user.id;
      }

      let dbPayments = [];

      if (user?.id || targetFarmerId) {
        // Query payments joined with procurements
        const { data: payList, error: pErr } = await supabase
          .from('payments')
          .select(`
            *,
            procurements (
              id,
              token_number,
              crop_type,
              gross_weight_kg,
              net_weight_kg,
              created_at,
              procurement_centres (
                id,
                name,
                location
              )
            )
          `)
          .or(`farmer_id.eq.${targetFarmerId || user.id},farmer_id.eq.${user?.id || ''}`)
          .order('created_at', { ascending: false });

        if (!pErr && payList) {
          dbPayments = payList;
        }

        // Also query procurements if payment row hasn't been explicitly inserted yet
        if (dbPayments.length === 0) {
          const { data: procList } = await supabase
            .from('procurements')
            .select(`
              *,
              procurement_centres (
                id,
                name,
                location
              )
            `)
            .or(`farmer_id.eq.${targetFarmerId || user.id},farmer_id.eq.${user?.id || ''}`)
            .order('created_at', { ascending: false });

          if (procList && procList.length > 0) {
            procList.forEach(proc => {
              if (proc.total_payout && proc.total_payout > 0) {
                dbPayments.push({
                  id: `pay-proc-${proc.id}`,
                  farmer_id: proc.farmer_id,
                  procurement_id: proc.id,
                  amount: proc.total_payout,
                  status: proc.status === 'accepted' ? 'pending' : (proc.status === 'completed' ? 'completed' : 'processing'),
                  transaction_ref: proc.transaction_ref || null,
                  paid_at: proc.paid_at || null,
                  created_at: proc.created_at,
                  procurements: proc
                });
              }
            });
          }
        }
      }

      // Read local persistent payments if demo/offline mode
      let localList = [];
      try {
        const localStr = localStorage.getItem('crop_dairy_all_payments');
        if (localStr) localList = JSON.parse(localStr);
      } catch (e) {}

      // Combine DB + local payments cleanly by ID
      const map = new Map();
      dbPayments.forEach(p => map.set(p.id, p));
      localList.forEach(p => {
        if (!map.has(p.id)) {
          map.set(p.id, p);
        }
      });

      const rawCombined = Array.from(map.values());

      // Format payment records
      const formatted = rawCombined.map(p => {
        const proc = p.procurements || {};
        const centre = proc.procurement_centres || {};
        const statusClean = String(p.status || 'pending').toLowerCase();
        
        return {
          id: p.id,
          procurementId: p.procurement_id || proc.id || null,
          amount: Number(p.amount || 0),
          status: statusClean,
          statusLabel: getHumanReadablePaymentStatus(statusClean),
          crop: proc.crop_type || p.crop || 'Paddy Grade A',
          procurementDate: proc.created_at || p.created_at ? new Date(proc.created_at || p.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : null,
          paymentDate: p.paid_at ? new Date(p.paid_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : null,
          transactionId: p.transaction_ref || p.transaction_id || null,
          centreName: centre.name || proc.centre_name || null,
          centreLocation: centre.location || null,
          bankAccountLast4: p.bank_account_last4 || null,
          ifscCode: p.ifsc_code || null,
          expectedDate: p.expected_credit_date || null,
          rawCreatedAt: p.created_at ? new Date(p.created_at).getTime() : 0,
        };
      });

      // Sort newest first
      formatted.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt);

      setPayments(formatted);

      // Trigger notification if any payment became completed
      formatted.forEach(p => {
        if ((p.status === 'completed' || p.status === 'paid') && !prevCompletedSetRef.current.has(p.id)) {
          prevCompletedSetRef.current.add(p.id);
          sendPaymentNotification(p);
        }
      });

    } catch (err) {
      console.error('Error fetching farmer payments:', err);
      setError('Unable to load payment information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();

    const handleLocalUpdate = () => fetchPayments();
    window.addEventListener('payment_updated', handleLocalUpdate);
    window.addEventListener('booking_updated', handleLocalUpdate);

    setConnectionStatus('CONNECTING');

    const channel = supabase
      .channel('farmer_payments_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Realtime payment payload:', payload);
          fetchPayments();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'procurements' },
        (payload) => {
          console.log('Realtime procurement payload:', payload);
          fetchPayments();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('CONNECTED');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('RECONNECTING');
        }
      });

    return () => {
      window.removeEventListener('payment_updated', handleLocalUpdate);
      window.removeEventListener('booking_updated', handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, [fetchPayments]);

  // Calculate dynamic totals from actual payment records
  const totalReceived = payments
    .filter(p => p.status === 'completed' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    payments,
    totalReceived,
    totalPending,
    loading,
    error,
    connectionStatus,
    refreshPayments: fetchPayments
  };
}

function sendPaymentNotification(paymentObj) {
  const notifKey = `notif_pay_completed_${paymentObj.id}`;
  if (sessionStorage.getItem(notifKey)) return;
  sessionStorage.setItem(notifKey, 'true');

  try {
    const existingStr = localStorage.getItem('crop_dairy_farmer_notifications');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const newNotif = {
      id: Date.now(),
      title: 'Payment Completed',
      message: `Your payment of ₹${paymentObj.amount.toLocaleString('en-IN')} has been credited.`,
      type: 'payment',
      isRead: false,
      createdAt: 'Just now'
    };
    localStorage.setItem('crop_dairy_farmer_notifications', JSON.stringify([newNotif, ...existing]));
    window.dispatchEvent(new Event('notification_added'));
  } catch (e) {
    console.error('Error dispatching payment notification:', e);
  }
}

export default useFarmerPayments;
