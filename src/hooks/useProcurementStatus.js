import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { getMyBookings } from '../services/bookingService';

/**
 * 7 OFFICIAL PROCUREMENT LIFECYCLE STAGES
 */
export const STAGES_LIST = [
  {
    key: 'SLOT_CONFIRMED',
    name: 'Slot Confirmed',
    shortInfo: 'Slot booking confirmed & token assigned'
  },
  {
    key: 'FARMER_ARRIVED',
    name: 'Farmer Arrived',
    shortInfo: 'Arrived & checked in at procurement centre'
  },
  {
    key: 'QUALITY_VERIFICATION',
    name: 'Quality Verification',
    shortInfo: 'Moisture, grain quality & grade inspection'
  },
  {
    key: 'WEIGHT_VERIFICATION',
    name: 'Weight Verification',
    shortInfo: 'Gross & tare weight measurement'
  },
  {
    key: 'ACCEPTED',
    name: 'Accepted',
    shortInfo: 'Produce accepted for government procurement'
  },
  {
    key: 'PAYMENT_PENDING',
    name: 'Payment Pending',
    shortInfo: 'Payment file generated & processing via DBT'
  },
  {
    key: 'PAYMENT_COMPLETED',
    name: 'Payment Completed',
    shortInfo: 'Payout credited directly to farmer bank account'
  }
];

// Helper to map backend status string to stage index (0 - 6)
export function getStageIndexFromStatus(statusStr = '') {
  const s = String(statusStr).toUpperCase();
  if (s === 'PAYMENT_COMPLETED' || s === 'PAID' || s === 'COMPLETED') return 6;
  if (s === 'PAYMENT_PENDING' || s === 'PROCESSING_PAYMENT' || s === 'PAYMENT_PROCESSING') return 5;
  if (s === 'ACCEPTED' || s === 'APPROVED') return 4;
  if (s === 'WEIGHT_VERIFICATION' || s === 'WEIGHT_CHECK' || s === 'WEIGHING' || s === 'WEIGHT_IN_PROGRESS' || s === 'GRADED') return 3;
  if (s === 'QUALITY_VERIFICATION' || s === 'QUALITY_CHECK' || s === 'SERVING' || s === 'PROCESSING' || s === 'QUALITY_IN_PROGRESS') return 2;
  if (s === 'FARMER_ARRIVED' || s === 'ARRIVED' || s === 'CALLED') return 1;
  return 0; // Default SLOT_CONFIRMED
}

// Helper to get clean user-facing status label
export function getHumanReadableStatusLabel(statusStr = '', stageIdx = 0) {
  const s = String(statusStr).toUpperCase();
  if (s === 'REJECTED' || s === 'FAILED') return 'Rejected';
  if (stageIdx >= 0 && stageIdx < STAGES_LIST.length) {
    return STAGES_LIST[stageIdx].name;
  }
  return 'Slot Confirmed';
}

// Stage transition notification helper
function sendStageNotification(stageKey) {
  const notifMessages = {
    QUALITY_VERIFICATION: 'Your quality verification is now in progress.',
    WEIGHT_VERIFICATION: 'Your produce weight verification is now complete.',
    ACCEPTED: 'Your produce has been accepted.',
    PAYMENT_PENDING: 'Your payment is being processed.',
    PAYMENT_COMPLETED: 'Your payment has been credited.'
  };

  const message = notifMessages[stageKey];
  if (!message) return;

  const storageKey = `crop_dairy_notif_stage_${stageKey}`;
  if (sessionStorage.getItem(storageKey)) return;
  sessionStorage.setItem(storageKey, 'true');

  try {
    const existingStr = localStorage.getItem('crop_dairy_farmer_notifications');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const newNotif = {
      id: Date.now(),
      title: STAGES_LIST.find(s => s.key === stageKey)?.name || 'Procurement Update',
      message,
      type: 'procurement',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('crop_dairy_farmer_notifications', JSON.stringify([newNotif, ...existing]));
    window.dispatchEvent(new Event('notification_added'));
  } catch (e) {
    console.error('Error saving notification:', e);
  }
}

export function useProcurementStatus() {
  const [procurementData, setProcurementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'CONNECTED' | 'RECONNECTING'
  const prevStageRef = useRef(null);

  const fetchProcurementStatus = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get active booking for current farmer
      const bookings = await getMyBookings();
      const activeBooking = bookings.find(b => b.booking_status === 'CONFIRMED') || null;

      // 2. Fetch authenticated user details from Supabase if available
      const { data: { user } } = await supabase.auth.getUser();

      let dbProcurement = null;
      let dbPayment = null;
      let dbToken = null;

      if (user?.id) {
        const { data: farmerData } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        const targetFarmerId = farmerData?.id || user.id;

        // Query procurements table
        const { data: pData } = await supabase
          .from('procurements')
          .select('*')
          .or(`farmer_id.eq.${targetFarmerId},farmer_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pData) dbProcurement = pData;

        // Query payments table
        const { data: payData } = await supabase
          .from('payments')
          .select('*')
          .or(`farmer_id.eq.${targetFarmerId},farmer_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (payData) dbPayment = payData;

        // Query queue tokens table
        const { data: tokenData } = await supabase
          .from('queue_tokens')
          .select('*')
          .or(`farmer_id.eq.${targetFarmerId},farmer_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (tokenData) dbToken = tokenData;
      }

      // Check persistent local state for live procurement lifecycle if offline/demo
      let localProc = null;
      try {
        const str = localStorage.getItem('crop_dairy_active_procurement');
        if (str) localProc = JSON.parse(str);
      } catch (e) {}

      // Combine DB + local token data
      const tokenNum = dbProcurement?.token_number || dbToken?.token_number || activeBooking?.token_number || '#101';
      const centreName = activeBooking?.centre_name || 'Vanur Government Direct Procurement Centre (DPC)';
      const slotDate = activeBooking?.slot_date || new Date().toISOString().split('T')[0];
      const timeWindow = activeBooking ? `${activeBooking.start_time} - ${activeBooking.end_time}` : '09:00 AM - 09:30 AM';

      // Determine current status string
      let rawStatus = 'SLOT_CONFIRMED';
      if (dbPayment?.status === 'completed' || localProc?.status === 'PAYMENT_COMPLETED') {
        rawStatus = 'PAYMENT_COMPLETED';
      } else if (dbPayment?.status === 'pending' || dbPayment?.status === 'processing' || localProc?.status === 'PAYMENT_PENDING') {
        rawStatus = 'PAYMENT_PENDING';
      } else if (dbProcurement?.status === 'accepted' || localProc?.status === 'ACCEPTED') {
        rawStatus = 'ACCEPTED';
      } else if (dbProcurement?.status === 'weight_verified' || dbProcurement?.net_weight_kg > 0 || localProc?.status === 'WEIGHT_VERIFICATION') {
        rawStatus = 'WEIGHT_VERIFICATION';
      } else if (dbProcurement?.status === 'graded' || dbProcurement?.moisture_percentage > 0 || localProc?.status === 'QUALITY_VERIFICATION') {
        rawStatus = 'QUALITY_VERIFICATION';
      } else if (dbToken?.token_status === 'CALLED' || dbToken?.status === 'CALLED' || localProc?.status === 'FARMER_ARRIVED') {
        rawStatus = 'FARMER_ARRIVED';
      } else if (activeBooking?.booking_status === 'CONFIRMED') {
        rawStatus = localProc?.status || 'SLOT_CONFIRMED';
      }

      // Rejection check
      const isRejected = dbProcurement?.status === 'rejected' || localProc?.status === 'REJECTED';
      const rejectionReason = isRejected 
        ? (localProc?.rejectionReason || dbProcurement?.rejection_reason || 'Quality Verification Failed: Moisture content 18.5% exceeds 17.0% limit.')
        : null;

      const currentStageIndex = isRejected ? 2 : getStageIndexFromStatus(rawStatus);

      // Timestamps from Database (ONLY include actual DB timestamps!)
      const stageTimestamps = {
        SLOT_CONFIRMED: activeBooking?.created_at ? new Date(activeBooking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (localProc?.timestamps?.SLOT_CONFIRMED || null),
        FARMER_ARRIVED: dbToken?.called_at ? new Date(dbToken.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (localProc?.timestamps?.FARMER_ARRIVED || null),
        QUALITY_VERIFICATION: dbProcurement?.created_at ? new Date(dbProcurement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (localProc?.timestamps?.QUALITY_VERIFICATION || null),
        WEIGHT_VERIFICATION: localProc?.timestamps?.WEIGHT_VERIFICATION || null,
        ACCEPTED: localProc?.timestamps?.ACCEPTED || null,
        PAYMENT_PENDING: dbPayment?.created_at ? new Date(dbPayment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (localProc?.timestamps?.PAYMENT_PENDING || null),
        PAYMENT_COMPLETED: dbPayment?.paid_at ? new Date(dbPayment.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (localProc?.timestamps?.PAYMENT_COMPLETED || null),
      };

      // Payment details from DB/local record
      const paymentAmount = dbPayment?.amount || localProc?.paymentAmount || null;
      const paymentDate = dbPayment?.paid_at 
        ? new Date(dbPayment.paid_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
        : (localProc?.paymentDate || null);

      const record = {
        tokenNumber: tokenNum,
        centreName,
        slotDate,
        timeWindow,
        currentStatus: isRejected ? 'REJECTED' : rawStatus,
        humanReadableStatus: getHumanReadableStatusLabel(isRejected ? 'REJECTED' : rawStatus, currentStageIndex),
        currentStageIndex,
        isRejected,
        rejectionReason,
        stageTimestamps,
        paymentAmount,
        paymentDate,
        cropType: dbProcurement?.crop_type || localProc?.cropType || 'Paddy Grade A',
        netWeightKg: dbProcurement?.net_weight_kg || localProc?.netWeightKg || null,
        moisturePct: dbProcurement?.moisture_percentage || localProc?.moisturePct || null,
      };

      setProcurementData(record);

      // Trigger notification if stage changed
      if (prevStageRef.current && prevStageRef.current !== rawStatus) {
        sendStageNotification(rawStatus);
      }
      prevStageRef.current = rawStatus;

    } catch (err) {
      console.error('Error fetching procurement status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcurementStatus();

    // Listen to local event updates
    const handleLocalUpdate = () => fetchProcurementStatus();
    window.addEventListener('booking_updated', handleLocalUpdate);
    window.addEventListener('procurement_updated', handleLocalUpdate);

    // Supabase Realtime Subscriptions
    setConnectionStatus('CONNECTING');

    const channel = supabase
      .channel('procurement_status_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'procurements' },
        (payload) => {
          console.log('Realtime procurements update:', payload);
          fetchProcurementStatus();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Realtime payments update:', payload);
          fetchProcurementStatus();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_tokens' },
        (payload) => {
          console.log('Realtime queue_tokens update:', payload);
          fetchProcurementStatus();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slot_bookings' },
        (payload) => {
          console.log('Realtime slot_bookings update:', payload);
          fetchProcurementStatus();
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
      window.removeEventListener('booking_updated', handleLocalUpdate);
      window.removeEventListener('procurement_updated', handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, [fetchProcurementStatus]);

  return {
    procurementData,
    loading,
    connectionStatus,
    refreshStatus: fetchProcurementStatus
  };
}

export default useProcurementStatus;
