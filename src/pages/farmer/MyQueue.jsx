import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMyBookings } from '../../hooks/useMyBookings';
import { useLiveQueue } from '../../hooks/useLiveQueue';
import { 
  Users, Clock, CheckCircle2, AlertCircle, 
  MapPin, Calendar, ArrowUp, Check, Sparkles
} from 'lucide-react';

export default function MyQueue() {
  const { t } = useLanguage();
  const { activeBooking, loading: bookingLoading } = useMyBookings();
  const centreId = activeBooking?.centre_id || null;
  const { queue: liveCentreQueue, loading: queueLoading } = useLiveQueue(centreId);

  // ── 1. DYNAMIC & REAL-TIME QUEUE CALCULATIONS ─────────────────────────────
  const hasBooking = Boolean(activeBooking);
  const farmerToken = activeBooking?.token_number || null;
  const centreName = activeBooking?.centre_name || null;
  const slotDate = activeBooking?.slot_date || null;
  const startTime = activeBooking?.start_time || null;
  const endTime = activeBooking?.end_time || null;
  const bookingStatus = activeBooking?.booking_status || null;

  // Parse numeric token values
  const farmerNum = useMemo(() => {
    if (!farmerToken) return 0;
    const match = farmerToken.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }, [farmerToken]);

  // Determine current serving token
  const servingNum = useMemo(() => {
    if (liveCentreQueue && liveCentreQueue.length > 0) {
      const servingItem = liveCentreQueue.find(q => 
        q.status === 'SERVING' || q.status === 'CALLED' || q.status === 'IN_PROCESSING'
      );
      if (servingItem) {
        const m = (servingItem.id || servingItem.token_number || '').toString().match(/\d+/);
        if (m) return parseInt(m[0], 10);
      }
    }
    // Default fallback logic: if farmer booking is COMPLETED or SERVING
    if (bookingStatus === 'COMPLETED') return farmerNum;
    if (bookingStatus === 'SERVING') return farmerNum;
    // Standard simulation default: serving token is 1 before farmer
    return Math.max(100, farmerNum - 1);
  }, [liveCentreQueue, farmerNum, bookingStatus]);

  const currentServingToken = `#${servingNum}`;
  const isFarmerServing = farmerNum === servingNum || bookingStatus === 'SERVING';
  const isCompleted = bookingStatus === 'COMPLETED' || farmerNum < servingNum;
  const isCancelled = bookingStatus === 'CANCELLED';

  // Calculate Farmers Ahead
  const farmersAhead = useMemo(() => {
    if (isFarmerServing || isCompleted || isCancelled) return 0;
    return Math.max(0, farmerNum - servingNum - 1);
  }, [farmerNum, servingNum, isFarmerServing, isCompleted, isCancelled]);

  // Estimated Wait (15 mins per farmer ahead)
  const estimatedWaitMins = isFarmerServing ? 0 : farmersAhead * 15;

  // Determine Farmer Token Status Pill
  const farmerTokenStatus = useMemo(() => {
    if (isCancelled) return 'CANCELLED';
    if (isCompleted) return 'COMPLETED';
    if (isFarmerServing) return 'SERVING';
    if (farmersAhead === 0) return 'NEXT';
    return 'WAITING';
  }, [isCancelled, isCompleted, isFarmerServing, farmersAhead]);

  // Build UNIQUE step nodes for visual timeline (Always 4 distinct sequential tokens)
  const timelineNodes = useMemo(() => {
    let baseNum = Math.min(servingNum, farmerNum);
    if (isFarmerServing) {
      baseNum = Math.max(100, farmerNum - 1);
    }
    
    return [
      {
        num: baseNum,
        token: `#${baseNum}`,
        status: baseNum < servingNum ? 'COMPLETED' : baseNum === servingNum ? (isFarmerServing ? 'SERVING_YOU' : 'SERVING') : 'WAITING',
        isYou: baseNum === farmerNum
      },
      {
        num: baseNum + 1,
        token: `#${baseNum + 1}`,
        status: (baseNum + 1) < servingNum ? 'COMPLETED' : (baseNum + 1) === servingNum ? (isFarmerServing ? 'SERVING_YOU' : 'SERVING') : (baseNum + 1) === farmerNum ? (isFarmerServing ? 'SERVING_YOU' : 'YOU_WAITING') : 'NEXT',
        isYou: (baseNum + 1) === farmerNum
      },
      {
        num: baseNum + 2,
        token: `#${baseNum + 2}`,
        status: (baseNum + 2) < servingNum ? 'COMPLETED' : (baseNum + 2) === servingNum ? (isFarmerServing ? 'SERVING_YOU' : 'SERVING') : (baseNum + 2) === farmerNum ? (isFarmerServing ? 'SERVING_YOU' : 'YOU_WAITING') : 'UPCOMING',
        isYou: (baseNum + 2) === farmerNum
      },
      {
        num: baseNum + 3,
        token: `#${baseNum + 3}`,
        status: (baseNum + 3) === farmerNum ? 'YOU_WAITING' : 'UPCOMING',
        isYou: (baseNum + 3) === farmerNum
      }
    ];
  }, [servingNum, farmerNum, isFarmerServing]);

  // Build Clean Feed Items for Live Queue Activity
  const activityFeed = useMemo(() => {
    if (liveCentreQueue && liveCentreQueue.length > 0) {
      return liveCentreQueue.slice(0, 5).map(q => ({
        id: q.id || q.token_number,
        tokenNumber: q.id || q.token_number,
        status: q.status || 'WAITING',
        isYou: (q.id || q.token_number) === farmerToken
      }));
    }

    const items = [];
    if (servingNum > 100) {
      items.push({ id: `t-${servingNum - 1}`, tokenNumber: `#${servingNum - 1}`, status: 'COMPLETED', isYou: false });
    }
    items.push({ id: `t-${servingNum}`, tokenNumber: `#${servingNum}`, status: 'SERVING', isYou: isFarmerServing });
    if (!isFarmerServing) {
      items.push({ id: `t-${farmerNum}`, tokenNumber: farmerToken, status: 'WAITING', isYou: true });
    }
    items.push({ id: `t-${farmerNum + 1}`, tokenNumber: `#${farmerNum + 1}`, status: 'WAITING', isYou: false });
    return items;
  }, [liveCentreQueue, servingNum, farmerNum, farmerToken, isFarmerServing]);

  // ── 2. AUTOMATIC QUEUE STAGE NOTIFICATIONS ENGINE ─────────────────────────
  useEffect(() => {
    if (!farmerToken || isCancelled) return;

    let stage = null;
    let title = '';
    let message = '';

    if (isCompleted) {
      stage = 'COMPLETED';
      title = 'Turn completed';
      message = 'Your procurement turn has been completed.';
    } else if (isFarmerServing) {
      stage = 'SERVING';
      title = "It's your turn!";
      message = 'Please proceed to the procurement counter.';
    } else if (farmersAhead === 0) {
      stage = 'NEXT';
      title = 'You are next in line';
      message = 'Please stand near the procurement counter.';
    } else if (farmersAhead <= 2) {
      stage = 'CLOSER';
      title = 'Your turn is getting close';
      message = `Only ${farmersAhead} farmer(s) ahead of you.`;
    }

    if (stage) {
      const storageKey = `crop_dairy_notif_sent_${farmerToken}_${stage}`;
      const alreadySent = sessionStorage.getItem(storageKey);

      if (!alreadySent) {
        sessionStorage.setItem(storageKey, 'true');
        try {
          const existingStr = localStorage.getItem('crop_dairy_farmer_notifications');
          const existing = existingStr ? JSON.parse(existingStr) : [];
          const newNotif = {
            id: Date.now(),
            title,
            message,
            type: 'queue',
            isRead: false,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('crop_dairy_farmer_notifications', JSON.stringify([newNotif, ...existing]));
          window.dispatchEvent(new Event('notification_added'));
        } catch (e) {}
      }
    }
  }, [farmerToken, farmersAhead, isFarmerServing, isCompleted, isCancelled]);

  if (bookingLoading || queueLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading your queue status...</p>
      </div>
    );
  }

  if (!hasBooking) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 text-slate-800 dark:text-slate-100 font-sans pb-10">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              Queue Status
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live real-time tracking for your procurement slot</p>
          </div>
        </div>
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Active Queue Token</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You don't have an active slot booking. Book a procurement slot to receive your queue token and track your position in real-time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 text-slate-800 dark:text-slate-100 font-sans pb-10 animate-fade-in">
      
      {/* ── 1. HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Queue Status
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Live real-time tracking for your procurement slot
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live Queue</span>
        </div>
      </div>

      {/* ── 2. TOP METRICS (4 Clean Cards) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* YOUR TOKEN */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            YOUR TOKEN
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight my-1">
            {farmerToken}
          </p>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
            farmerTokenStatus === 'SERVING'
              ? 'bg-emerald-500 text-white animate-pulse'
              : farmerTokenStatus === 'NEXT'
              ? 'bg-amber-500 text-white'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
          }`}>
            {farmerTokenStatus}
          </span>
        </div>

        {/* SERVING NOW */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            NOW SERVING
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight my-1">
            {currentServingToken}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Counter #1</span>
        </div>

        {/* FARMERS AHEAD */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            FARMERS AHEAD
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight my-1">
            {farmersAhead}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {farmersAhead === 0 ? 'You are next / serving' : 'In line before you'}
          </span>
        </div>

        {/* ESTIMATED WAIT */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            ESTIMATED WAIT
          </span>
          <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight my-1">
            {estimatedWaitMins} <span className="text-sm font-bold text-slate-400">min</span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium">~15m per farmer</span>
        </div>

      </div>

      {/* ── 3. HERO TURN BANNER ───────────────────────────────────────────── */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isFarmerServing
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
          : farmersAhead === 0
          ? 'bg-amber-500 text-white border-amber-400 shadow-md'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
            isFarmerServing || farmersAhead === 0 ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
          }`}>
            {isFarmerServing ? (
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            ) : farmersAhead === 0 ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>

          <div>
            <h3 className="text-base font-black tracking-tight">
              {isFarmerServing && "🎉 IT'S YOUR TURN! Please proceed to Counter #1 immediately."}
              {!isFarmerServing && farmersAhead === 0 && "🔔 YOU ARE NEXT IN LINE! Please stand near the counter."}
              {!isFarmerServing && farmersAhead > 0 && `⏳ Your Turn is Approaching — ${farmersAhead} farmer(s) ahead of you.`}
              {isCompleted && "✓ TURN COMPLETED"}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              {isFarmerServing && "Keep your booking slip ready for digital milk quality testing."}
              {!isFarmerServing && farmersAhead === 0 && "Your token will be called in a few moments."}
              {!isFarmerServing && farmersAhead > 0 && `Estimated wait time is approximately ${estimatedWaitMins} minutes.`}
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. VISUAL LIVE QUEUE TIMELINE (Clean, Single Component) ──────── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Live Queue Sequence
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Real-Time Updates
          </span>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative py-4 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60">
          {/* Progress Bar Background Line */}
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div 
            className="absolute top-1/2 left-8 -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-500"
            style={{ 
              width: isFarmerServing ? '66%' : farmersAhead === 0 ? '50%' : '33%' 
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            {timelineNodes.map((node) => {
              const isServingNode = node.status === 'SERVING' || node.status === 'SERVING_YOU';
              const isCompletedNode = node.status === 'COMPLETED';

              return (
                <div key={node.token} className="flex flex-col items-center text-center">
                  {/* Token Number */}
                  <span className={`text-xs font-mono font-black mb-1 ${
                    node.isYou ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {node.token}
                  </span>

                  {/* Circle Node */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    node.isYou
                      ? 'bg-emerald-600 text-white border-white ring-4 ring-emerald-500/20 shadow-md animate-pulse'
                      : isServingNode
                      ? 'bg-emerald-500 text-white border-white'
                      : isCompletedNode
                      ? 'bg-slate-300 dark:bg-slate-600 text-white border-slate-200 dark:border-slate-700'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-600'
                  }`}>
                    {isCompletedNode ? <Check className="w-3.5 h-3.5" /> : node.isYou ? '★' : '●'}
                  </div>

                  {/* Subtext Label */}
                  <span className={`text-[10px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${
                    node.isYou
                      ? 'bg-emerald-600 text-white'
                      : isServingNode
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'text-slate-400'
                  }`}>
                    {node.isYou ? 'YOU' : isServingNode ? 'SERVING' : isCompletedNode ? 'DONE' : 'WAITING'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. DETAILS GRID (Live Feed + Slot Info) ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* LIVE QUEUE ACTIVITY */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Live Queue Activity
            </h3>
            <span className="text-[10px] text-slate-400">Tokens Stream</span>
          </div>

          <div className="space-y-2">
            {activityFeed.map((item) => (
              <div 
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  item.isYou
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    {item.tokenNumber}
                  </span>
                  {item.isYou && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">
                      You
                    </span>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  item.status === 'SERVING'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : item.status === 'COMPLETED'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {item.status === 'SERVING' ? '● Serving' : item.status === 'COMPLETED' ? 'Done' : 'Waiting'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PROCUREMENT CENTRE & SLOT DETAILS */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Procurement Slot Details
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Confirmed
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400 font-medium">Procurement Centre:</span>
              <span className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate text-right">
                {centreName}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400 font-medium">Slot Date:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {slotDate}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400 font-medium">Booked Window:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {startTime} – {endTime}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Target Arrival:</span>
              <span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                {startTime}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

