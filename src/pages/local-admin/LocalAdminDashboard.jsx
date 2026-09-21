import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Users, 
  Hash, 
  Clock, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Search, 
  Filter, 
  Download, 
  CreditCard,
  Building2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import useLiveQueue from '../../hooks/useLiveQueue';

export default function LocalAdminDashboard() {
  const { t } = useLanguage();
  const outletCtx = useOutletContext();
  const centreStatus = outletCtx?.centreStatus || 'OPERATIONAL';
  const centreId = outletCtx?.centreId || 'c0000000-0000-0000-0000-000000000001';

  // Live Queue Dataset from Supabase Realtime
  const { queue: dbQueue, loading: queueLoading, callNextToken: callNext, updateTokenStatus: updateStatus } = useLiveQueue(centreId);

  const queue = dbQueue || [];

  // Active Processing Inspection Desk State
  const [activeTokenState, setActiveTokenState] = useState(null);
  const activeToken = activeTokenState || queue[0] || null;

  const [moisturePct, setMoisturePct] = useState(15.2);
  const [impurityPct, setImpurityPct] = useState(1.2);
  const [grossWeightQtl, setGrossWeightQtl] = useState(55.0);
  const [tareWeightQtl, setTareWeightQtl] = useState(2.6);
  const [mspRate, setMspRate] = useState(2203);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [noticeMessage, setNoticeMessage] = useState('');

  // Calculations
  const netWeightQtl = useMemo(() => {
    const val = grossWeightQtl - tareWeightQtl;
    return val > 0 ? parseFloat(val.toFixed(2)) : 0;
  }, [grossWeightQtl, tareWeightQtl]);

  const calculatedPayout = useMemo(() => {
    const gradeMultiplier = moisturePct <= 17.0 ? 1.0 : 0.95;
    return Math.round(netWeightQtl * mspRate * gradeMultiplier);
  }, [netWeightQtl, mspRate, moisturePct]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const waiting = queue.filter(q => q.status === 'WAITING').length;
    const completed = queue.filter(q => q.status === 'COMPLETED').length;
    const totalTonnage = queue.reduce((acc, q) => acc + (q.estWeightQtl || 0), 0);
    const totalPayout = queue.filter(q => q.paidAmount).reduce((acc, q) => acc + q.paidAmount, 0) + (completed * 110000);
    return {
      todayFarmers: queue.length,
      currentToken: activeToken?.id || '#TK-101',
      waitingCount: waiting,
      totalTonnageQtl: totalTonnage.toFixed(1),
      totalPayoutToday: totalPayout || 406453,
      avgWaitMins: 6.5
    };
  }, [queue, activeToken]);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [queue, searchQuery, statusFilter]);

  // Action: Call Next Token
  const handleCallNextToken = async () => {
    if (centreStatus !== 'OPERATIONAL') {
      setNoticeMessage('⚠️ Centre is currently ' + centreStatus + '. Please set status to OPERATIONAL to call tokens.');
      setTimeout(() => setNoticeMessage(''), 3000);
      return;
    }

    const res = await callNext(1);
    if (res && res.success) {
      setNoticeMessage(`✅ Called Token ${res.token_number} to Counter 1.`);
      setTimeout(() => setNoticeMessage(''), 3500);
    } else {
      const nextWaiting = queue.find(q => q.status === 'WAITING');
      if (nextWaiting) {
        if (nextWaiting.tokenId) {
          await updateStatus(nextWaiting.tokenId, 'CALLED', 1);
        }
        setActiveTokenState({ ...nextWaiting, status: 'CALLED' });
        setNoticeMessage(`✅ Called Token ${nextWaiting.id} (${nextWaiting.name}) to Counter 1.`);
        setTimeout(() => setNoticeMessage(''), 3500);
      } else {
        setNoticeMessage('ℹ️ No more waiting tokens in queue.');
        setTimeout(() => setNoticeMessage(''), 3000);
      }
    }
  };

  // Action: Approve Inspection & Status Update
  const handleApproveInspection = async () => {
    if (!activeToken) return;

    if (activeToken.tokenId) {
      await updateStatus(activeToken.tokenId, 'COMPLETED');
    }

    setNoticeMessage(`🎉 Token ${activeToken.id} Approved! ₹${calculatedPayout.toLocaleString('en-IN')} DBT Transfer Dispatched.`);
    setTimeout(() => setNoticeMessage(''), 4000);

    const nextWaiting = queue.find(q => q.status === 'WAITING' && q.id !== activeToken.id);
    if (nextWaiting) {
      setActiveTokenState(nextWaiting);
      setGrossWeightQtl(nextWaiting.estWeightQtl || 50.0);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Dynamic Status Toast Notification */}
      {noticeMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-200 border border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />
            <span className="text-sm font-bold">{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage('')} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. PRIMARY METRICS OVERVIEW BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">TODAY'S FARMERS</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{metrics.todayFarmers}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between ring-2 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">ACTIVE TOKEN</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{metrics.currentToken}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">LIVE QUEUE WAITING</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">{metrics.waitingCount} Farmers</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">TOTAL TONNAGE</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{metrics.totalTonnageQtl} <span className="text-xs text-slate-500 font-bold">Qtl</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">PAYOUT APPROVED</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">₹{metrics.totalPayoutToday.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">AVG PROC. TIME</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{metrics.avgWaitMins} <span className="text-xs text-slate-500 font-bold">mins</span></p>
        </div>

      </div>

      {/* 2. MAIN TWO-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN LEFT (7 COLS): LIVE FARMER QUEUE MANAGEMENT (TOP PRIORITY) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          
          {/* Header & Live Queue Call Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Live Farmer Queue Management
                </h2>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Real-time token monitoring and token dispatching for Counter 1 - 4
              </p>
            </div>

            {/* CALL NEXT TOKEN BUTTON */}
            <button
              onClick={handleCallNextToken}
              className="py-3 px-5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Call Next Token ➔</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token # or farmer..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              {['ALL', 'WAITING', 'IN_PROCESSING', 'COMPLETED'].map(statusKey => (
                <button
                  key={statusKey}
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors whitespace-nowrap ${
                    statusFilter === statusKey
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {statusKey}
                </button>
              ))}
            </div>

          </div>

          {/* LIVE QUEUE TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Farmer Name</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Arrival</th>
                  <th className="py-3 px-4">Counter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {queueLoading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 animate-pulse font-bold">
                      Connecting to Supabase Realtime Queue...
                    </td>
                  </tr>
                ) : filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-semibold">
                      No booked farmers in live queue for this centre yet.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item) => (
                    <tr 
                      key={item.id}
                      className={`transition-colors hover:bg-slate-50/80 ${
                        activeToken?.id === item.id ? 'bg-emerald-50/60 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-black text-slate-900">{item.id}</td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{item.phone}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{item.crop}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.arrived}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{item.counter}</td>
                      <td className="py-3.5 px-4">
                        {item.status === 'CALLED' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] inline-flex items-center gap-1 shadow-xs animate-bounce">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            CALLED
                          </span>
                        )}
                        {item.status === 'IN_PROCESSING' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            Processing
                          </span>
                        )}
                        {item.status === 'WAITING' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                            Waiting ({item.waitMins}m)
                          </span>
                        )}
                        {item.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px]">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveTokenState(item);
                            setGrossWeightQtl(item.estWeightQtl || 50.0);
                          }}
                          className="py-1 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* COLUMN RIGHT (5 COLS): ACTIVE FARMER PROCESSING & VERIFICATION WORKBENCH */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-emerald-500/40 shadow-sm space-y-5 relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                ACTIVE DESK WORKBENCH
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
                Crop Quality & Weight Inspection
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          {/* Active Farmer Details Box */}
          {activeToken ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Token: {activeToken.id}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Assigned: {activeToken.counter}
                </span>
              </div>
              <p className="text-lg font-black text-slate-900">{activeToken.name}</p>
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1 border-t border-slate-200/60">
                <span>Crop: <strong>{activeToken.crop}</strong></span>
                <span>Est. Bags: <strong>{activeToken.bagCount} Bags</strong></span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">Select a farmer token from the queue to start inspection.</p>
          )}

          {/* Quality & Moisture Verification Inputs */}
          <div className="space-y-4 pt-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              1. Quality & Moisture Inspection
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Moisture Content (%):</span>
                <span className={moisturePct <= 17.0 ? 'text-emerald-600 font-black' : 'text-amber-600 font-black'}>
                  {moisturePct}% ({moisturePct <= 17.0 ? 'Grade A Approved ≤17%' : 'High Moisture Grade B'})
                </span>
              </div>
              <input
                type="range"
                min="10.0"
                max="22.0"
                step="0.1"
                value={moisturePct}
                onChange={(e) => setMoisturePct(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Impurity / Foreign Matter (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={impurityPct}
                  onChange={(e) => setImpurityPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Govt MSP Rate (₹/Qtl)</label>
                <input
                  type="number"
                  value={mspRate}
                  onChange={(e) => setMspRate(parseInt(e.target.value) || 2203)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Weight Entry Calculator */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              2. Weight Entry & Tare Deduction
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Gross (Qtl)</label>
                <input
                  type="number"
                  step="0.1"
                  value={grossWeightQtl}
                  onChange={(e) => setGrossWeightQtl(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Tare Bag (Qtl)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tareWeightQtl}
                  onChange={(e) => setTareWeightQtl(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900"
                />
              </div>

              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center">
                <span className="block text-[10px] font-bold text-emerald-700">Net Weight</span>
                <span className="text-sm font-black text-emerald-800">{netWeightQtl} Qtl</span>
              </div>
            </div>
          </div>

          {/* Automated Payout Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Farmer Payout (DBT)</span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">₹{calculatedPayout.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Direct Bank Transfer
              </span>
            </div>
          </div>

          {/* Submit Inspection Action Button */}
          <button
            onClick={handleApproveInspection}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-black text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Approve & Authorize DBT Payment ✓</span>
          </button>

        </div>

      </div>

    </div>
  );
}
