import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getProcurementCentres, getAvailableSlots, bookSlot } from '../../services/bookingService';
import { 
  Building2, Calendar, Clock, CheckCircle2, AlertCircle, X, 
  MapPin, Check, ChevronRight, ShieldCheck, Ticket 
} from 'lucide-react';

export default function BookSlotModal({ isOpen, onClose, onSuccess }) {
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1: Centre, 2: Date & Slot, 3: Summary, 4: Success
  const [centres, setCentres] = useState([]);
  const [loadingCentres, setLoadingCentres] = useState(false);

  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Fetch Centres when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMessage(null);
      setSelectedCentre(null);
      setSelectedSlot(null);
      setBookingResult(null);
      fetchCentres();
    }
  }, [isOpen]);

  const fetchCentres = async () => {
    setLoadingCentres(true);
    try {
      const data = await getProcurementCentres();
      setCentres(data);
      if (data.length > 0) {
        setSelectedCentre(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCentres(false);
    }
  };

  // Fetch slots whenever selected centre or date changes
  useEffect(() => {
    if (selectedCentre?.id && selectedDate) {
      fetchSlots();
    }
  }, [selectedCentre, selectedDate]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const data = await getAvailableSlots(selectedCentre.id, selectedDate);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || bookingLoading) return;
    setBookingLoading(true);
    setErrorMessage(null);

    try {
      const result = await bookSlot(selectedSlot.id);
      if (result.success) {
        setBookingResult(result.data);
        setStep(4); // Success step
        if (onSuccess) onSuccess(result.data);
      } else {
        setErrorMessage(result.message || 'Failed to book slot. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-[#16A34A] to-emerald-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none">
                {step === 4 ? 'Booking Confirmed!' : 'Book Procurement Slot'}
              </h2>
              <p className="text-xs text-emerald-100 mt-1 font-medium">
                {step === 1 && 'Step 1 of 3: Choose Procurement Centre'}
                {step === 2 && 'Step 2 of 3: Select Date & Available Time Slot'}
                {step === 3 && 'Step 3 of 3: Review Booking Summary'}
                {step === 4 && 'Your Queue Token is generated'}
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

        {/* MODAL BODY */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          
          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SELECT PROCUREMENT CENTRE */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-[#17202A] dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Select Procurement Centre
              </h3>

              {loadingCentres ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-500 animate-pulse">
                  Loading available procurement centres...
                </div>
              ) : (
                <div className="space-y-3">
                  {centres.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCentre(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedCentre?.id === c.id
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#17202A] dark:text-white">{c.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Operational
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {c.location} {c.distanceKm && `• ${c.distanceKm}`}
                        </p>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedCentre?.id === c.id ? 'bg-[#16A34A] text-white' : 'border border-slate-300'
                      }`}>
                        {selectedCentre?.id === c.id && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Select Booking Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Slot Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Available Time Slots ({selectedDate})
                </label>

                {loadingSlots ? (
                  <div className="py-8 text-center text-xs font-semibold text-slate-500 animate-pulse">
                    Fetching available capacity...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl p-4 border">
                    No slots available for this date. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map((s) => {
                      const isFull = s.status === 'FULL' || s.available_slots <= 0;
                      const isFew = s.available_slots > 0 && s.available_slots <= 3;
                      const isSelected = selectedSlot?.id === s.id;

                      return (
                        <button
                          key={s.id}
                          disabled={isFull}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                            isFull
                              ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 text-red-400 cursor-not-allowed opacity-70'
                              : isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          <div>
                            <span className="font-extrabold text-xs block text-slate-900 dark:text-white">
                              {s.start_time} - {s.end_time}
                            </span>
                            <span className={`text-[11px] font-bold block mt-1 ${
                              isFull ? 'text-red-500' : isFew ? 'text-amber-600' : 'text-emerald-700'
                            }`}>
                              {isFull ? 'FULL' : `${s.available_slots} slots available`}
                            </span>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-[#16A34A] text-white' : 'border border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: BOOKING SUMMARY */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-[#17202A] dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Review & Confirm Booking
              </h3>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-medium">Procurement Centre:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedCentre?.name}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCentre?.location}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-medium">Booking Date:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedDate}</span>
                </div>

                <div className="flex justify-between py-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Time Window:</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                    {selectedSlot?.start_time} - {selectedSlot?.end_time}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS VIEW */}
          {step === 4 && bookingResult && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Slot Successfully Booked!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your procurement token has been issued automatically.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-2xl inline-block max-w-xs w-full shadow-2xs">
                <span className="text-xs text-emerald-800 font-bold block">Generated Token</span>
                <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight block mt-1">
                  {bookingResult.token_number}
                </span>
                <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full mt-2">
                  ● CONFIRMED
                </span>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step < 4 && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            )}

            {step === 1 && (
              <button
                disabled={!selectedCentre}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-xs shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-xs shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                Review Summary <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                disabled={bookingLoading}
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-xs shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Slot ✓'}
              </button>
            )}

            {step === 4 && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
