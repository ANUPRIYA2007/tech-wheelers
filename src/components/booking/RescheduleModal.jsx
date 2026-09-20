import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getAvailableSlots, rescheduleSlot } from '../../services/bookingService';
import { 
  Calendar, Clock, Check, RefreshCw, X, AlertCircle, MapPin 
} from 'lucide-react';

export default function RescheduleModal({ isOpen, booking, onClose, onSuccess }) {
  const { t } = useLanguage();

  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isOpen && booking) {
      setNewDate(booking.slot_date || new Date().toISOString().split('T')[0]);
      setSelectedSlot(null);
      setErrorMessage(null);
    }
  }, [isOpen, booking]);

  useEffect(() => {
    if (booking?.centre_id && newDate) {
      fetchSlots();
    } else if (newDate) {
      // Fallback centre ID if missing
      fetchSlotsFallback();
    }
  }, [newDate, booking]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const data = await getAvailableSlots(booking.centre_id || 'c0000000-0000-0000-0000-000000000001', newDate);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchSlotsFallback = async () => {
    setLoadingSlots(true);
    try {
      const data = await getAvailableSlots('c0000000-0000-0000-0000-000000000001', newDate);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot || !booking?.booking_id || loading) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await rescheduleSlot(booking.booking_id, selectedSlot.id);
      if (res.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to reschedule slot.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while rescheduling.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none">
                Reschedule Slot
              </h2>
              <p className="text-xs text-blue-100 mt-1 font-medium">
                Change your booking date and time window
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Booking Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
            <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">Current Booking</span>
            <div className="flex justify-between font-bold text-slate-800 dark:text-white">
              <span>{booking.slot_date} ({booking.start_time} - {booking.end_time})</span>
              <span className="text-blue-600 font-extrabold">{booking.token_number}</span>
            </div>
            <p className="text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> {booking.centre_name}
            </p>
          </div>

          {/* New Date Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Select New Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          {/* Available Slots Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Available Time Slots
            </label>

            {loadingSlots ? (
              <div className="py-6 text-center text-xs font-medium text-slate-400 animate-pulse">
                Fetching available slots...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {slots.map((s) => {
                  const isFull = s.status === 'FULL' || s.available_slots <= 0;
                  const isSelected = selectedSlot?.id === s.id;

                  return (
                    <button
                      key={s.id}
                      disabled={isFull}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                        isFull
                          ? 'bg-red-50 text-red-300 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <span className="block">{s.start_time}</span>
                        <span className={`text-[10px] block ${isFull ? 'text-red-400' : 'text-emerald-600'}`}>
                          {isFull ? 'FULL' : `${s.available_slots} slots`}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          
          <button
            disabled={!selectedSlot || loading}
            onClick={handleConfirmReschedule}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {loading ? 'Rescheduling...' : 'Confirm Reschedule ✓'}
          </button>
        </div>

      </div>
    </div>
  );
}
