import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Users, Search, RefreshCw, User, MapPin, Phone, Wheat } from 'lucide-react';

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFarmers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('id, full_name, phone, district, state, crop_type, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) setFarmers(data);
    } catch (err) {
      console.error('Farmers fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFarmers(); }, [fetchFarmers]);

  const filtered = farmers.filter(f =>
    (f.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.phone || '').includes(search) ||
    (f.district || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.crop_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            All Farmers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {farmers.length} farmers registered on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, phone, district..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs w-52"
            />
          </div>
          <button onClick={fetchFarmers} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-all shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-500">
            {search ? 'No farmers match your search.' : 'No farmers found in database.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 grid grid-cols-4 gap-4">
            <span>Farmer</span><span>Contact</span><span>Location</span><span>Registered</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filtered.map(f => (
              <div key={f.id} className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-xs items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    {(f.full_name || 'F').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">{f.full_name || 'Unknown'}</p>
                    {f.crop_type && <p className="text-[10px] text-emerald-600 font-medium">{f.crop_type}</p>}
                  </div>
                </div>
                <span className="text-slate-500 font-medium">{f.phone || '—'}</span>
                <span className="text-slate-500 font-medium">{[f.district, f.state].filter(Boolean).join(', ') || '—'}</span>
                <span className="text-slate-400 font-medium">
                  {f.created_at ? new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
