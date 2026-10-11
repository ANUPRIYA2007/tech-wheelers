import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useProcurementStatus, { STAGES_LIST } from '../../hooks/useProcurementStatus';
import { 
  Check, 
  Clock, 
  CalendarCheck, 
  UserCheck, 
  Microscope, 
  Scale, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle, 
  XCircle,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';

export default function Procurement() {
  const { t } = useLanguage();
  const { procurementData, loading, connectionStatus, refreshStatus } = useProcurementStatus();

  const isConnected = connectionStatus === 'CONNECTED';

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {t('procurement', 'Procurement Status')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Track your procurement progress
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-12 text-center animate-pulse space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-500">Connecting to Supabase Realtime Stream...</p>
        </div>
      </div>
    );
  }

  if (!procurementData) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#16A34A]" />
              {t('procurement', 'Procurement Status')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Track your procurement progress in real-time</p>
          </div>
        </div>
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Active Procurement</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mt-1">
              You don't have an active slot booking. Book a procurement slot to begin the procurement process and track your status here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    tokenNumber = null,
    centreName = null,
    slotDate = null,
    timeWindow = null,
    humanReadableStatus = 'Slot Confirmed',
    currentStageIndex = 0,
    isRejected = false,
    rejectionReason = null,
    stageTimestamps = {},
    paymentAmount = null,
    paymentDate = null,
    cropType = null,
    netWeightKg = null,
    moisturePct = null
  } = procurementData;

  // Stage icons mapping
  const STAGE_ICONS = [
    CalendarCheck,  // 1. Slot Confirmed
    UserCheck,      // 2. Farmer Arrived
    Microscope,     // 3. Quality Verification
    Scale,          // 4. Weight Verification
    CheckCircle2,   // 5. Accepted
    Clock,          // 6. Payment Pending
    CreditCard      // 7. Payment Completed
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10 animate-fade-in">
      
      {/* ── 1. HEADER WITH LIVE UPDATE INDICATOR ──────────────────────────── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#16A34A]" />
            {t('procurement', 'Procurement Status')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Track your procurement progress in real-time
          </p>
        </div>

        {/* Live Updates Connection Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
          isConnected
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-2xs'
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
          <span>{isConnected ? '● Live Updates' : '● Reconnecting...'}</span>
        </div>
      </div>

      {/* ── 2. MAIN PROCUREMENT TIMELINE CARD ────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Top Header Row of Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-emerald-400 text-xs font-black tracking-tight">
                {tokenNumber}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {slotDate}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ({timeWindow})
              </span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              {centreName}
            </p>
          </div>

          {/* Dynamic Top-Right Status Badge (Human-Readable Only) */}
          <div className="text-right self-start sm:self-auto">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Current Status
            </span>
            <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-black tracking-tight border ${
              isRejected
                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                : currentStageIndex === 6
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              {isRejected ? '● Rejected' : `[ ${humanReadableStatus} ]`}
            </span>
          </div>
        </div>

        {/* ── 3. VERTICAL TIMELINE ────────────────────────────────────────── */}
        <div className="space-y-0 py-2">
          {STAGES_LIST.map((stage, i) => {
            const Icon = STAGE_ICONS[i] || CircleIcon;
            
            const isCompletedStage = !isRejected && i < currentStageIndex;
            const isCurrentStage = !isRejected && i === currentStageIndex;
            const isPendingStage = !isRejected && i > currentStageIndex;
            const isRejectedStage = isRejected && i === currentStageIndex;

            // Database timestamp for this stage if existing
            const timestamp = stageTimestamps[stage.key];

            return (
              <div key={stage.key} className="flex items-start gap-4 group">
                
                {/* Left Line & Stage Icon Node */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isCompletedStage
                      ? 'bg-[#16A34A] text-white shadow-xs'
                      : isCurrentStage
                      ? 'bg-[#16A34A] text-white ring-4 ring-emerald-500/20 shadow-md animate-pulse'
                      : isRejectedStage
                      ? 'bg-red-600 text-white ring-4 ring-red-500/20 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-400 border border-slate-200 dark:border-slate-600'
                  }`}>
                    {isCompletedStage ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : isRejectedStage ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Vertical Connecting Line */}
                  {i < STAGES_LIST.length - 1 && (
                    <div className={`w-1 h-12 rounded-full my-1 transition-all ${
                      i < currentStageIndex && !isRejected
                        ? 'bg-[#16A34A]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                  )}
                </div>

                {/* Right Stage Content Box */}
                <div className={`flex-1 pb-6 ${isPendingStage ? 'opacity-55' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className={`text-sm font-extrabold tracking-tight ${
                        isCompletedStage || isCurrentStage
                          ? 'text-slate-900 dark:text-white'
                          : isRejectedStage
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {stage.name}
                      </h3>

                      {/* Status Pills */}
                      {isCurrentStage && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#16A34A] dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800 animate-pulse">
                          In Progress
                        </span>
                      )}

                      {isCompletedStage && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                          Completed
                        </span>
                      )}

                      {isRejectedStage && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider border border-red-300">
                          Failed
                        </span>
                      )}

                      {isPendingStage && (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* DB Timestamp (Only displayed if actually existing in DB!) */}
                    {timestamp && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                        {timestamp}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {stage.shortInfo}
                  </p>

                  {/* Stage-Specific DB Details */}
                  {stage.key === 'QUALITY_VERIFICATION' && (moisturePct || cropType) && (isCompletedStage || isCurrentStage) && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Grain Inspection: <span className="text-emerald-600">{cropType}</span>
                      </p>
                      {moisturePct && (
                        <p className="text-slate-500 dark:text-slate-400">
                          Moisture Content: <span className="font-bold text-slate-700 dark:text-slate-300">{moisturePct}%</span> (Max allowable: 17.0%)
                        </p>
                      )}
                    </div>
                  )}

                  {stage.key === 'WEIGHT_VERIFICATION' && netWeightKg && (isCompletedStage || isCurrentStage) && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Net Weight Verified: <span className="text-emerald-600 font-black">{netWeightKg} kg</span> ({parseFloat((netWeightKg / 100).toFixed(2))} Quintals)
                      </p>
                    </div>
                  )}

                  {/* Rejection Alert Banner */}
                  {isRejectedStage && rejectionReason && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-bold flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-red-800 dark:text-red-200">Procurement Rejected</p>
                        <p className="font-medium text-xs mt-0.5 text-red-600 dark:text-red-300">{rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Completed Stage DB Information (Only if existing in DB!) */}
                  {stage.key === 'PAYMENT_COMPLETED' && (isCompletedStage || currentStageIndex === 6) && (
                    <div className="mt-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                      <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Direct Benefit Transfer (DBT) Credited
                      </p>
                      {paymentAmount && (
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Amount: <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">₹{Number(paymentAmount).toLocaleString('en-IN')}</span>
                        </p>
                      )}
                      {paymentDate && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Credited on: <span className="font-bold text-slate-700 dark:text-slate-300">{paymentDate}</span>
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

function CircleIcon(props) {
  return <div className="w-2.5 h-2.5 rounded-full bg-current" {...props} />;
}
