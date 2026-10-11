import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { UserCog, Search, RefreshCw, Building2, Shield, User } from 'lucide-react';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      // Try 'profiles' table with role filter first, then 'admins' table
      let data = null;
      let error = null;

      const res = await supabase
        .from('profiles')
        .select('id, full_name, email, role, centre_id, created_at')
        .in('role', ['local_admin', 'admin', 'LOCAL_ADMIN', 'ADMIN', 'super_admin'])
        .order('created_at', { ascending: false });

      data = res.data;
      error = res.error;

      if (error || !data || data.length === 0) {
        // Try 'admins' table as fallback
        const res2 = await supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: false });
        if (!res2.error && res2.data) {
          data = res2.data;
        }
      }

      setAdmins(data || []);
    } catch (err) {
      console.error('Admins fetch error:', err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filtered = admins.filter(a =>
    (a.full_name || a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('super')) return 'Super Admin';
    if (r.includes('local')) return 'Local Admin';
    if (r.includes('admin')) return 'Admin';
    return role || 'Unknown';
  };

  const roleColor = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('super')) return 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-emerald-600" />
            Admin Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {admins.length} admins registered on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs w-52"
            />
          </div>
          <button onClick={fetchAdmins} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-all shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <UserCog className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-500">
            {search ? 'No admins match your search.' : 'No admin profiles found. Admins will appear here once created.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                        {(a.full_name || a.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-white">{a.full_name || a.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{a.email || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${roleColor(a.role)}`}>
                      {roleLabel(a.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-medium">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
