import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import {
  Building2, Users, Hash, Clock, CreditCard,
  AlertCircle, RefreshCw, Activity, Package,
  ShieldCheck, Zap
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const [centresRes, farmersRes, bookingsRes, procurementsRes, paymentsRes, tokensRes] =
        await Promise.allSettled([
          supabase.from('procurement_centres').select('id, operating_status'),
          supabase.from('farmers').select('id', { count: 'exact', head: true }),
          supabase.from('slot_bookings').select('id, booking_status, created_at').order('created_at', { ascending: false }).limit(50),
          supabase.from('procurements').select('id, status, total_amount, created_at').order('created_at', { ascending: false }).limit(50),
          supabase.from('payments').select('id, status, amount, created_at').order('created_at', { ascending: false }).limit(50),
          supabase.from('queue_tokens').select('id, token_status'),
        ]);

      const centres = centresRes.value?.data || [];
      const totalFarmers = farmersRes.value?.count || 0;
      const bookings = bookingsRes.value?.data || [];
      const procurements = procurementsRes.value?.data || [];
      const payments = paymentsRes.value?.data || [];
      const tokens = tokensRes.value?.data || [];

      const openCentres = centres.filter(c => c.operating_status === 'OPEN').length;
      const todayStr = new Date().toDateString();
      const todayBookings = bookings.filter(b => new Date(b.created_at).toDateString() === todayStr).length;
      const confirmedBookings = bookings.filter(b => b.booking_status === 'CONFIRMED').length;
      const waitingInQueue = tokens.filter(t => t.token_status === 'WAITING').length;
      const completedProcurements = procurements.filter(p =>
        ['PAYMENT_COMPLETED', 'COMPLETED', 'PAID'].includes((p.status || '').toUpperCase())
      ).length;
      const totalPayoutsReleased = payments
        .filter(p => ['completed', 'paid'].includes(p.status))
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const pendingPayments = payments
        .filter(p => ['pending', 'processing', 'payment_pending'].includes(p.status))
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);

      const activity = [
        ...bookings.slice(0, 3).map(b => ({
          id: `b-${b.id}`, text: `Slot booking — ${(b.booking_status || '').toLowerCase()}`,
          time: b.created_at, color: 'emerald'
        })),
        ...procurements.slice(0, 3).map(p => ({
          id: `p-${p.id}`, text: `Procurement ${(p.status || '').replace(/_/g, ' ').toLowerCase()}`,
          time: p.created_at, color: 'blue'
        })),
        ...payments.slice(0, 2).map(p => ({
          id: `pay-${p.id}`, text: `Payment ₹${Number(p.amount || 0).toLocaleString('en-IN')} — ${p.status}`,
          time: p.created_at, color: 'amber'
        })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

      setStats({
        totalCentres: centres.length, openCentres,
        closedCentres: centres.length - openCentres, totalFarmers,
        todayBookings, confirmedBookings, waitingInQueue,
        completedProcurements, totalProcurements: procurements.length,
        totalPayoutsReleased, pendingPayments
      });
      setRecentActivity(activity);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('SuperAdmin stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const ch = supabase.channel('super_admin_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slot_bookings' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'procurements' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tokens' }, fetchStats)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchStats]);

  const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Procurement Centres', value: stats?.totalCentres ?? 0, sub: `${stats?.openCentres ?? 0} Open · ${stats?.closedCentres ?? 0} Closed`, icon: Building2, bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' },
    { label: 'Registered Farmers', value: stats?.totalFarmers ?? 0, sub: 'Platform-wide total', icon: Users, bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600' },
    { label: "Today's Bookings", value: stats?.todayBookings ?? 0, sub: `${stats?.confirmedBookings ?? 0} confirmed slots`, icon: Hash, bg: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600' },
    { label: 'Live Queue Waiting', value: stats?.waitingInQueue ?? 0, sub: 'Across all centres', icon: Clock, bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' },
    { label: 'Procurements Done', value: stats?.completedProcurements ?? 0, sub: `of ${stats?.totalProcurements ?? 0} total`, icon: Package, bg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600' },
    { label: 'Total Payouts', value: `₹${(stats?.totalPayoutsReleased ?? 0).toLocaleString('en-IN')}`, sub: 'Completed DBT transfers', icon: CreditCard, bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' },
    { label: 'Pending Payments', value: `₹${(stats?.pendingPayments ?? 0).toLocaleString('en-IN')}`, sub: 'Awaiting processing', icon: AlertCircle, bg: 'bg-red-100 dark:bg-red-950/60 text-red-600' },
    { label: 'Platform Status', value: '● Live', sub: 'Supabase Realtime active', icon: Activity, bg: 'bg-green-100 dark:bg-green-950/60 text-green-600' },
  ];

  const dotColors = { emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500' };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Super Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Platform-wide overview — live Supabase data
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Updated {timeAgo(lastUpdated)}
            </span>
          )}
          <button onClick={fetchStats} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-all shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">{card.value}</p>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            Live Platform Activity
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Latest events across all centres</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No recent platform activity. Data will appear as farmers use the system.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivity.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColors[item.color] || 'bg-slate-400'}`} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1 capitalize">{item.text}</span>
                <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">{timeAgo(item.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

