import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useFarmerPayments from '../../hooks/useFarmerPayments';
import Modal from '../../components/common/Modal';
import { 
  CreditCard, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  FileText,
  ChevronRight,
  X
} from 'lucide-react';

export default function Payments() {
  const { t } = useLanguage();
  const { 
    payments, 
    totalReceived, 
    totalPending, 
    loading, 
    error, 
    connectionStatus, 
    refreshPayments 
  } = useFarmerPayments();

  const [selectedPayment, setSelectedPayment] = useState(null);

  const isConnected = connectionStatus === 'CONNECTED';

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {t('payment', 'Payment')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Track your procurement payments
            </p>
          </div>
        </div>

        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-500">Loading payment records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            {t('payment', 'Payment')}
          </h1>
        </div>

        <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-red-200 dark:border-red-900/40 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-700 dark:text-red-300">{error}</h3>
            <p className="text-xs text-slate-500 mt-1">Check your network connection and try again.</p>
          </div>
          <button
            onClick={refreshPayments}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10 animate-fade-in">
      
      {/* ── 1. HEADER WITH REALTIME STATUS INDICATOR ─────────────────────── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#16A34A]" />
            {t('payment', 'Payment')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Track your procurement payments in real-time
          </p>
        </div>

        {/* Live Payment Updates Connection Indicator */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
          isConnected
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-2xs'
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
          <span>{isConnected ? '● Live Payment Updates' : '● Reconnecting...'}</span>
        </div>
      </div>

      {/* ── 2. DYNAMIC SUMMARY CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* TOTAL RECEIVED CARD */}
        <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Total Received
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1 font-mono">
              ₹{totalReceived.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Calculated from completed DBT transfers
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ArrowDownRight className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* PENDING PAYMENT CARD */}
        <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Pending Payment
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-1 font-mono">
              ₹{totalPending.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Currently processing or pending approval
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

      </div>

      {/* ── 3. PAYMENT RECORDS LIST OR EMPTY STATE ─────────────────────── */}
      {payments.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              NO PAYMENT RECORDS YET
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mt-1">
              Your procurement payments will appear here once a payment is created by the procurement centre.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const isCompleted = p.status === 'completed' || p.status === 'paid';
            const isFailed = p.status === 'failed' || p.status === 'rejected';
            const isProcessing = p.status === 'processing';

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPayment(p)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Payment Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0 ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : isFailed
                      ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isFailed ? (
                      <XCircle className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">
                        Produce: {p.crop}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {p.procurementDate && (
                        <span>Procurement Date: <strong className="text-slate-700 dark:text-slate-300">{p.procurementDate}</strong></span>
                      )}
                      {p.paymentDate && (
                        <span>Payment Date: <strong className="text-emerald-600 dark:text-emerald-400">{p.paymentDate}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Status Badge & Transaction ID */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : isFailed
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}>
                      {isCompleted ? '✓ Payment Completed' : isFailed ? 'Failed' : isProcessing ? 'Processing' : 'Payment Pending'}
                    </span>

                    {p.transactionId && (
                      <p className="text-[11px] font-mono text-slate-400 font-semibold mt-1">
                        Transaction ID: {p.transactionId}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. SECURE PAYMENT DETAILS MODAL ─────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-4 font-sans text-slate-800 dark:text-slate-100">
            
            {/* Header Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-1">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-extrabold uppercase tracking-wider block">
                Total Payout Amount
              </span>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
                ₹{selectedPayment.amount.toLocaleString('en-IN')}
              </p>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase mt-1 ${
                selectedPayment.status === 'completed' || selectedPayment.status === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : selectedPayment.status === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {selectedPayment.statusLabel}
              </span>
            </div>

            {/* Details Table */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs">
              
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Produce / Crop:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedPayment.crop}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Procurement Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedPayment.procurementDate || 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedPayment.statusLabel}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Transaction ID:</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                  {selectedPayment.transactionId || 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Payment Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedPayment.paymentDate || 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Procurement Centre:</span>
                <span className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate text-right">
                  {selectedPayment.centreName || 'Not available'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Payment Method:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedPayment.bankAccountLast4 ? `Bank A/C ending in ****${selectedPayment.bankAccountLast4}` : 'Direct Benefit Transfer (DBT)'}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Expected Credit Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedPayment.expectedDate || 'Not available'}
                </span>
              </div>

            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
