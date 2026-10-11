import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { MapPin, RefreshCw, Search, Building2, Users, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
  CLOSED:      { label: 'Closed',      color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-700' },
  DELAYED:     { label: 'Delayed',     color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  OPERATIONAL: { label: 'Operational', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
};

export default function Centres() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCentres = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('procurement_centres')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        // Enrich with live booking counts
        const enriched = await Promise.all(data.map(async (c) => {
          const { count: queueCount } = await supabase
            .from('slot_bookings')
            .select('id', { count: 'exact', head: true })
            .eq('centre_id', c.id)
            .eq('booking_status', 'CONFIRMED');
          return { ...c, liveQueue: queueCount || 0 };
        }));
        setCentres(enriched);
      }
    } catch (err) {
      console.error('Centres fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCentres();
    const ch = supabase.channel('centres_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'procurement_centres' }, fetchCentres)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchCentres]);

  const filtered = centres.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.district || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.state || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Procurement Centres
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {centres.length} centres · {centres.filter(c => c.operating_status === 'OPEN').length} open right now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search centre or district..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs w-56"
            />
          </div>
          <button onClick={fetchCentres} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-all shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Centres Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-500">
            {search ? 'No centres match your search.' : 'No procurement centres found in database.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(c => {
            const cfg = STATUS_CONFIG[c.operating_status] || STATUS_CONFIG.CLOSED;
            return (
              <div key={c.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight max-w-[220px]">{c.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {[c.location, c.district, c.state].filter(Boolean).join(', ')}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    Live Queue: <strong className="text-slate-800 dark:text-white ml-1">{c.liveQueue}</strong>
                  </span>
                  {c.capacity_per_slot && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Capacity: <strong className="text-slate-800 dark:text-white ml-1">{c.capacity_per_slot}/slot</strong>
                    </span>
                  )}
                  {c.centre_code && (
                    <span className="ml-auto font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">
                      {c.centre_code}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


