import React, { Component } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useFarmerNotifications, { formatRelativeTime } from '../../hooks/useFarmerNotifications';
import { 
  Bell, 
  CheckCheck, 
  CalendarCheck, 
  Users, 
  Package, 
  CreditCard, 
  AlertTriangle, 
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

// Icon mapping per notification category
const TYPE_ICONS = {
  slot: CalendarCheck,
  queue: Users,
  procurement: Package,
  payment: CreditCard,
  alert: AlertTriangle,
  warning: AlertTriangle,
  critical: AlertTriangle,
  danger: AlertTriangle,
  info: Bell,
  success: CheckCheck,
};

// High priority title keywords
const HIGH_PRIORITY_TITLES = [
  "It's Your Turn!",
  'Payment Completed',
  'Queue Delay',
  'Slot Cancelled',
  'Procurement Rejected',
  'You Are Next'
];

/**
 * Robust React Error Boundary to guarantee no blank screen / unexpected crashes.
 */
class NotificationsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Technical error in Notifications page:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#16A34A]" />
                Notifications
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Stay updated on your procurement journey
              </p>
            </div>
          </div>

          <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Unable to load notifications.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mt-1">
                Please try again.
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function NotificationsContent() {
  const { t } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    connectionStatus, 
    toastNotif,
    setToastNotif,
    markAsRead, 
    markAllAsRead,
    refreshNotifications
  } = useFarmerNotifications();

  const isConnected = connectionStatus === 'CONNECTED';
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Safe Loading State
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#16A34A]" />
              {t('notifications', 'Notifications')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Stay updated on your procurement journey
            </p>
          </div>
        </div>

        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 space-y-3 animate-pulse shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Safe Error State (Database or Network failure)
  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#16A34A]" />
              {t('notifications', 'Notifications')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Stay updated on your procurement journey
            </p>
          </div>
        </div>

        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Unable to load notifications.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mt-1">
              Please try again.
            </p>
          </div>
          <button
            onClick={refreshNotifications}
            className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10 animate-fade-in relative">
      
      {/* ── IMMEDIATE IN-APP ALERT TOAST (WHEN NEW EVENT ARRIVES) ───────────── */}
      {toastNotif && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-emerald-500/40 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-400">
                {typeof toastNotif.title === 'string' ? toastNotif.title : 'Notification'}
              </h4>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                {typeof toastNotif.message === 'string' ? toastNotif.message : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setToastNotif(null)}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close Toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 1. HEADER WITH REALTIME STATUS & MARK ALL READ ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#16A34A]" />
              {t('notifications', 'Notifications')}
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Stay updated on your procurement journey
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Connection Indicator - shown only when connected */}
          {isConnected && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 transition-all">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>● Live Updates</span>
            </div>
          )}

          {/* Mark All As Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all inline-flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. NOTIFICATIONS LIST OR SAFE EMPTY STATE ─────────────────────── */}
      {safeNotifications.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              No Notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mt-1">
              You're all caught up. New updates will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {safeNotifications.map((n, index) => {
            if (!n || typeof n !== 'object') return null;

            const Icon = TYPE_ICONS[n.type] || Bell;
            const safeTitle = typeof n.title === 'string' && n.title ? n.title : 'Notification';
            const safeMessage = typeof n.message === 'string' ? n.message : '';
            const lowerTitle = safeTitle.toLowerCase();
            const lowerType = (n.type || '').toLowerCase();

            // Color classifications: Red only for critical/failed; Amber for warnings/delays; Green for normal
            const isCritical = lowerType === 'danger' || lowerType === 'critical' || lowerType === 'error' || lowerTitle.includes('cancelled') || lowerTitle.includes('rejected');
            const isWarning = lowerType === 'warning' || lowerType === 'alert' || lowerType === 'delay' || lowerTitle.includes('delay');
            const isHighPriority = HIGH_PRIORITY_TITLES.some(title => safeTitle.includes(title));
            const relativeTimeStr = formatRelativeTime(n.createdAt);

            return (
              <div
                key={n.id || `notif-row-${index}`}
                onClick={() => markAsRead(n.id)}
                className={`bg-white dark:bg-slate-800 border rounded-3xl p-5 shadow-2xs transition-all cursor-pointer flex items-start gap-4 ${
                  !n.isRead
                    ? 'border-l-4 border-l-[#16A34A] border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-700/80 opacity-90'
                }`}
              >
                {/* Left Icon */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isCritical
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : isWarning
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    : isHighPriority
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm tracking-tight ${
                        !n.isRead
                          ? 'font-black text-slate-900 dark:text-white'
                          : 'font-extrabold text-slate-700 dark:text-slate-300'
                      }`}>
                        {safeTitle}
                      </h3>

                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      )}

                      {isHighPriority && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase flex-shrink-0">
                          Important
                        </span>
                      )}
                    </div>

                    {/* Dynamic Relative Time */}
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex-shrink-0">
                      {relativeTimeStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {safeMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default function Notifications() {
  return (
    <NotificationsErrorBoundary>
      <NotificationsContent />
    </NotificationsErrorBoundary>
  );
}
