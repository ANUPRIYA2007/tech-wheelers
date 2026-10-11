import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import {
  TrendingUp, BarChart3, PieChart as PieIcon,
  RefreshCw, DollarSign, Package, CheckCircle2,
  Clock, MapPin
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts';

const CROP_COLORS = {
  Paddy: '#10b981',
  Wheat: '#f59e0b',
  Maize: '#6366f1',
  Cotton: '#ec4899',
  Sugarcane: '#14b8a6',
  Pulses: '#8b5cf6',
  Other: '#64748b'
};

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, all
  const [loading, setLoading] = useState(true);
  const [procurements, setProcurements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [centres, setCentres] = useState([]);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [procRes, payRes, centRes] = await Promise.allSettled([
        supabase
          .from('procurements')
          .select('id, crop_type, quantity, net_weight_kg, total_amount, total_payout, status, created_at, centre_id')
          .order('created_at', { ascending: true }),
        supabase
          .from('payments')
          .select('id, amount, status, created_at, payment_method')
          .order('created_at', { ascending: true }),
        supabase
          .from('procurement_centres')
          .select('id, name, district, operating_status')
      ]);

      setProcurements(procRes.value?.data || []);
      setPayments(payRes.value?.data || []);
      setCentres(centRes.value?.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();

    // Subscribe to live changes
    const channel = supabase
      .channel('analytics-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'procurements' }, () => {
        fetchAnalyticsData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchAnalyticsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnalyticsData]);

  // Filter by selected time window
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff = new Date(0);
    if (timeRange === '7d') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredProc = procurements.filter(p => new Date(p.created_at) >= cutoff);
    const filteredPay = payments.filter(p => new Date(p.created_at) >= cutoff);

    return { filteredProc, filteredPay };
  }, [procurements, payments, timeRange]);

  // Aggregated KPIs
  const kpis = useMemo(() => {
    const { filteredProc, filteredPay } = filteredData;

    const totalWeightKg = filteredProc.reduce((acc, p) => {
      const w = Number(p.net_weight_kg || p.quantity || 0);
      return acc + (isNaN(w) ? 0 : w);
    }, 0);

    const totalPaidAmount = filteredPay
      .filter(p => ['completed', 'paid', 'COMPLETED', 'PAID'].includes(p.status))
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const pendingAmount = filteredPay
      .filter(p => ['pending', 'processing', 'payment_pending', 'PENDING'].includes(p.status))
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const totalBatches = filteredProc.length;
    const completedBatches = filteredProc.filter(p =>
      ['PAYMENT_COMPLETED', 'COMPLETED', 'PAID', 'accepted'].includes((p.status || '').toLowerCase())
    ).length;

    const fulfillmentRate = totalBatches > 0 ? Math.round((completedBatches / totalBatches) * 100) : 100;

    return {
      totalWeightKg,
      totalPaidAmount,
      pendingAmount,
      totalBatches,
      fulfillmentRate
    };
  }, [filteredData]);

  // Trend Chart Data (grouped by date)
  const trendData = useMemo(() => {
    const { filteredProc, filteredPay } = filteredData;
    const dayMap = {};

    // Group procurements by date
    filteredProc.forEach(p => {
      const d = new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!dayMap[d]) {
        dayMap[d] = { date: d, volume: 0, payout: 0, batches: 0 };
      }
      const weight = Number(p.net_weight_kg || p.quantity || 0);
      dayMap[d].volume += isNaN(weight) ? 0 : weight;
      dayMap[d].batches += 1;
    });

    // Group payments by date
    filteredPay.forEach(p => {
      const d = new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!dayMap[d]) {
        dayMap[d] = { date: d, volume: 0, payout: 0, batches: 0 };
      }
      if (['completed', 'paid', 'COMPLETED', 'PAID'].includes(p.status)) {
        dayMap[d].payout += Number(p.amount || 0);
      }
    });

    const list = Object.values(dayMap);
    if (list.length === 0) {
      // Provide default empty points for aesthetic chart
      return [
        { date: 'Day 1', volume: 0, payout: 0, batches: 0 },
        { date: 'Today', volume: 0, payout: 0, batches: 0 }
      ];
    }
    return list;
  }, [filteredData]);

  // Crop Breakdown Data
  const cropData = useMemo(() => {
    const { filteredProc } = filteredData;
    const cropMap = {};

    filteredProc.forEach(p => {
      const crop = p.crop_type || 'Paddy';
      const weight = Number(p.net_weight_kg || p.quantity || 1);
      cropMap[crop] = (cropMap[crop] || 0) + (isNaN(weight) ? 1 : weight);
    });

    const entries = Object.entries(cropMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));

    if (entries.length === 0) {
      return [
        { name: 'Paddy', value: 45 },
        { name: 'Wheat', value: 30 },
        { name: 'Maize', value: 25 }
      ];
    }
    return entries;
  }, [filteredData]);

  // Centre Breakdown Data
  const centreData = useMemo(() => {
    const { filteredProc } = filteredData;
    const centreMap = {};

    // Initialise from centres table
    centres.forEach(c => {
      centreMap[c.id] = {
        name: (c.name || 'Centre').replace(' Procurement Centre', '').replace(' Centre', ''),
        volume: 0,
        count: 0
      };
    });

    filteredProc.forEach(p => {
      const cid = p.centre_id;
      if (cid && centreMap[cid]) {
        const weight = Number(p.net_weight_kg || p.quantity || 0);
        centreMap[cid].volume += isNaN(weight) ? 0 : weight;
        centreMap[cid].count += 1;
      }
    });

    const res = Object.values(centreMap).filter(c => c.count > 0 || c.volume > 0);
    if (res.length === 0) {
      return centres.slice(0, 5).map(c => ({
        name: (c.name || 'Centre').slice(0, 14),
        volume: 0,
        count: 0
      }));
    }
    return res;
  }, [filteredData, centres]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Platform Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time analytics across all procurement centres, commodities, and farmer payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={fetchAnalyticsData}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Procured Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.totalWeightKg.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-600">kg</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Across {kpis.totalBatches} verified batches
          </p>
        </div>

        {/* Payouts Disbursed */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Disbursed Payouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{kpis.totalPaidAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Direct DBT to verified farmer bank accounts
          </p>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Payouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{kpis.pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Awaiting bank authorization
          </p>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fulfillment Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.fulfillmentRate}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Successful delivery & completion
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Procurement Volume Trend
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Daily volume (kg) collected across all active procurement centres
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  formatter={(val) => [`${val.toLocaleString('en-IN')} kg`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#volumeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Distribution Donut (1 col) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Commodity Breakdown
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Share by crop / produce type
            </p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cropData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CROP_COLORS[entry.name] || PALETTE[index % PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  formatter={(val) => [`${val.toLocaleString('en-IN')} kg`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            {cropData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CROP_COLORS[c.name] || PALETTE[i % PALETTE.length] }}
                />
                <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
                  {c.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">
                  {c.value}kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centre Throughput Comparison Bar Chart */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Centre Procurement Throughput
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Comparison of procurement quantities handled by registered centres
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={centreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff'
                }}
                formatter={(val) => [`${val.toLocaleString('en-IN')} kg`, 'Total Volume']}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
