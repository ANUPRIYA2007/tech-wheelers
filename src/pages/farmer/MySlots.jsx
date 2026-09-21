import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMyBookings } from '../../hooks/useMyBookings';
import { cancelSlot, deleteBooking } from '../../services/bookingService';
import BookSlotModal from '../../components/booking/BookSlotModal';
import RescheduleModal from '../../components/booking/RescheduleModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { 
  CalendarCheck, Plus, Clock, MapPin, X, RefreshCw, Ticket, 
  CheckCircle2, AlertCircle, ShieldCheck, Trash2
} from 'lucide-react';

export default function MySlots() {
  const { t } = useLanguage();
  const { bookings, loading, refreshBookings } = useMyBookings();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteBookingTarget, setDeleteBookingTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancelBooking?.booking_id || cancelLoading) return;
    setCancelLoading(true);
    try {
      await cancelSlot(cancelBooking.booking_id);
      refreshBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
      setCancelBooking(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteBookingTarget?.booking_id || deleteLoading) return;
    setDeleteLoading(true);
    try {
      const res = await deleteBooking(deleteBookingTarget.booking_id);
      if (res && !res.success) {
        alert(res.error || 'Failed to delete cancelled booking.');
      }
      await refreshBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setDeleteBookingTarget(null);
    }
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800 dark:text-slate-100 font-sans">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-[#17202A] dark:text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-[#16A34A]" />
            {t('mySlot', 'My Slot')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Book procurement slots, receive queue tokens, and track appointment status in real-time.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('bookSlot', '+ Book Slot')}</span>
        </button>
      </div>

      {/* BOOKINGS LIST */}
      {loading ? (
        <div className="py-16 text-center text-xs font-bold text-slate-400 animate-pulse bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          Syncing slots with Supabase Realtime...
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t('noActiveSlot', 'No Active Slot Bookings')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Book a slot to reserve your procurement time, receive your queue token, and avoid long waiting lines.
            </p>
          </div>
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-xs shadow-md hover:bg-emerald-700 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t('bookSlot', '+ Book Slot')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((slot) => {
            const isConfirmed = slot.booking_status === 'CONFIRMED';
            const isCancelled = slot.booking_status === 'CANCELLED';
            const isCompleted = slot.booking_status === 'COMPLETED';

            return (
              <div
                key={slot.booking_id}
                className={`bg-white dark:bg-slate-800 border rounded-3xl p-6 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isConfirmed 
                    ? 'border-emerald-200 dark:border-emerald-800/80 ring-1 ring-emerald-500/10' 
                    : 'border-slate-200 dark:border-slate-700 opacity-90'
                }`}
              >
                {/* Left Slot Details */}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                    isConfirmed 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                      : isCancelled
                      ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    <CalendarCheck className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-base text-[#17202A] dark:text-white">
                        {slot.slot_date}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-emerald-400 text-xs font-black tracking-tight">
                        {slot.token_number}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {slot.start_time} - {slot.end_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {slot.centre_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Status Badge & Actions */}
                <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    isConfirmed
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : isCancelled
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-emerald-500 animate-pulse' : isCancelled ? 'bg-red-500' : 'bg-blue-500'}`} />
                    {isConfirmed ? 'CONFIRMED' : isCancelled ? 'CANCELLED' : 'COMPLETED'}
                  </span>

                  {isConfirmed && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRescheduleBooking(slot)}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => setCancelBooking(slot)}
                        className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel Slot</span>
                      </button>
                    </div>
                  )}

                  {isCancelled && (
                    <button
                      onClick={() => setDeleteBookingTarget(slot)}
                      className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOK SLOT MODAL */}
      <BookSlotModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={() => {
          refreshBookings();
        }}
      />

      {/* RESCHEDULE MODAL */}
      <RescheduleModal
        isOpen={Boolean(rescheduleBooking)}
        booking={rescheduleBooking}
        onClose={() => setRescheduleBooking(null)}
        onSuccess={() => {
          refreshBookings();
        }}
      />

      {/* CANCEL CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(cancelBooking)}
        title="Cancel Slot Booking?"
        message={`Are you sure you want to cancel your slot for ${cancelBooking?.slot_date} (${cancelBooking?.start_time} - ${cancelBooking?.end_time})? Your queue token ${cancelBooking?.token_number} will be released.`}
        confirmLabel="Yes, Cancel Slot"
        cancelLabel="Keep Slot"
        variant="danger"
        loading={cancelLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelBooking(null)}
      />

      {/* DELETE CANCELLED SLOT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteBookingTarget)}
        title="Delete cancelled slot?"
        message="This cancelled booking will be permanently removed from your slot history."
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteBookingTarget(null)}
      />

    </div>
  );
}

