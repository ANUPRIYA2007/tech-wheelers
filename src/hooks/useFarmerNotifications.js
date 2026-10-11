import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

// Dynamic relative time formatter from actual timestamps
export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Time unavailable';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Time unavailable';

  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSecs < 0) return 'Just now';
  if (diffSecs < 30) return 'Just now';
  if (diffSecs < 60) return `${diffSecs} seconds ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function useFarmerNotifications() {
  const { user, profile, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [toastNotif, setToastNotif] = useState(null);
  const knownIdsRef = useRef(new Set());
  const farmerIdRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    // If auth is still loading, wait
    if (authLoading) return;

    // If user is not authenticated, safely set empty state without crashing
    if (!user) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine authentic farmer ID
      let targetFarmerId = profile?.id;
      if (!targetFarmerId || targetFarmerId === user.id) {
        try {
          const { data: farmerRow } = await supabase
            .from('farmers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (farmerRow?.id) {
            targetFarmerId = farmerRow.id;
          }
        } catch (fErr) {
          console.warn('Could not query farmers table for farmer ID:', fErr);
        }
      }

      const activeFarmerId = targetFarmerId || user.id;
      farmerIdRef.current = activeFarmerId;

      // Query notifications table for authenticated farmer only using actual table columns
      let query = supabase
        .from('notifications')
        .select('id, farmer_id, title, message, type, is_read, created_at')
        .order('created_at', { ascending: false });

      if (targetFarmerId && targetFarmerId !== user.id) {
        query = query.or(`farmer_id.eq.${targetFarmerId},farmer_id.eq.${user.id}`);
      } else {
        query = query.eq('farmer_id', activeFarmerId);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        console.error('Technical notifications database error:', dbError);
        setError('Unable to load notifications.');
        setNotifications([]);
        return;
      }

      // Safe normalization of database rows
      const safeList = Array.isArray(data)
        ? data
            .filter(item => item && typeof item === 'object')
            .map(item => ({
              id: item.id || `notif-${Math.random()}`,
              farmerId: item.farmer_id || null,
              title: typeof item.title === 'string' ? item.title : (item.title ? String(item.title) : 'Notification'),
              message: typeof item.message === 'string' ? item.message : (item.message ? String(item.message) : ''),
              type: typeof item.type === 'string' ? item.type.toLowerCase() : 'info',
              isRead: Boolean(item.is_read),
              createdAt: item.created_at || null,
              rawTimestamp: item.created_at ? new Date(item.created_at).getTime() : 0,
              relatedId: item.related_id || null,
              relatedType: item.related_type || null,
            }))
        : [];

      // Sort newest first
      safeList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

      setNotifications(safeList);
      safeList.forEach(n => knownIdsRef.current.add(n.id));
      setError(null);
    } catch (err) {
      console.error('Technical error in fetchNotifications:', err);
      setError('Unable to load notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, profile]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (authLoading || !user) return;

    const activeFarmerId = farmerIdRef.current || profile?.id || user.id;
    if (!activeFarmerId) return;

    let channel = null;

    try {
      const channelId = `farmer_notifs_${activeFarmerId.toString().slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const newRow = payload?.new;
            if (!newRow) return;

            // Only add if it belongs to this authenticated farmer
            if (newRow.farmer_id === activeFarmerId || newRow.farmer_id === user.id) {
              const normalized = {
                id: newRow.id || `notif-${Date.now()}`,
                farmerId: newRow.farmer_id || null,
                title: typeof newRow.title === 'string' ? newRow.title : (newRow.title ? String(newRow.title) : 'Notification'),
                message: typeof newRow.message === 'string' ? newRow.message : (newRow.message ? String(newRow.message) : ''),
                type: typeof newRow.type === 'string' ? newRow.type.toLowerCase() : 'info',
                isRead: Boolean(newRow.is_read),
                createdAt: newRow.created_at || new Date().toISOString(),
                rawTimestamp: newRow.created_at ? new Date(newRow.created_at).getTime() : Date.now(),
                relatedId: newRow.related_id || null,
                relatedType: newRow.related_type || null,
              };

              setNotifications(prev => {
                const list = Array.isArray(prev) ? prev : [];
                if (list.some(n => n.id === normalized.id)) return list;
                return [normalized, ...list];
              });

              if (!knownIdsRef.current.has(normalized.id)) {
                knownIdsRef.current.add(normalized.id);
                setToastNotif(normalized);
                setTimeout(() => setToastNotif(null), 6000);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' },
          (payload) => {
            const updatedRow = payload?.new;
            if (!updatedRow?.id) return;

            setNotifications(prev => {
              if (!Array.isArray(prev)) return [];
              return prev.map(item => {
                if (item.id === updatedRow.id) {
                  return {
                    ...item,
                    title: typeof updatedRow.title === 'string' ? updatedRow.title : item.title,
                    message: typeof updatedRow.message === 'string' ? updatedRow.message : item.message,
                    type: typeof updatedRow.type === 'string' ? updatedRow.type.toLowerCase() : item.type,
                    isRead: Boolean(updatedRow.is_read),
                  };
                }
                return item;
              });
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('CONNECTED');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnectionStatus('DISCONNECTED');
          }
        });
    } catch (realtimeErr) {
      console.warn('Realtime subscription could not be established:', realtimeErr);
      setConnectionStatus('DISCONNECTED');
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn('Error removing realtime channel:', e);
        }
      }
    };
  }, [authLoading, user, profile]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    if (!id) return;

    // Optimistically mark as read in UI
    setNotifications(prev => (Array.isArray(prev) ? prev.map(n => n.id === id ? { ...n, isRead: true } : n) : []));

    try {
      const { error: updErr } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (updErr) {
        console.error('Error marking notification as read in database:', updErr);
      }
    } catch (e) {
      console.error('Failed to update notification read status:', e);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!Array.isArray(notifications) || notifications.length === 0) return;
    const hasUnread = notifications.some(n => !n.isRead);
    if (!hasUnread) return;

    // Optimistically mark all as read in UI
    setNotifications(prev => (Array.isArray(prev) ? prev.map(n => ({ ...n, isRead: true })) : []));

    try {
      const activeFarmerId = farmerIdRef.current || profile?.id || user?.id;
      if (activeFarmerId) {
        const { error: updErr } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('farmer_id', activeFarmerId);

        if (updErr) {
          console.error('Error marking all notifications as read in database:', updErr);
        }
      }
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.isRead).length
    : 0;

  return {
    notifications: Array.isArray(notifications) ? notifications : [],
    unreadCount,
    loading: authLoading || loading,
    error,
    connectionStatus,
    toastNotif,
    setToastNotif,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}

export default useFarmerNotifications;
