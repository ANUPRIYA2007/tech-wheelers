import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMyBookings } from '../../hooks/useMyBookings';
import { 
  Bot, Sun, MapPin, Clock, Users, Ticket, Leaf, Calendar, 
  Package, CreditCard, Bell, ArrowRight, Mic, Send, CheckCircle2,
  Info, Check, Navigation, CalendarCheck, Building2, ChevronRight,
  RotateCcw, ShieldCheck, Map
} from 'lucide-react';
import { askHeroAI } from '../../services/aiGateway';

export default function FarmerDashboard() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { activeBooking } = useMyBookings();

  const [aiInput, setAiInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Dynamic values combining Realtime Supabase booking with high-fidelity defaults
  const dashboard = {
    tokenNumber: activeBooking?.token_number || '#128',
    tokenStatus: activeBooking?.booking_status || 'ACTIVE',
    farmersAhead: activeBooking?.token_number ? Math.max(1, parseInt(activeBooking.token_number.replace(/\D/g, '')) - 114) : 14,
    estimatedWaitMins: activeBooking?.token_number ? Math.max(5, (parseInt(activeBooking.token_number.replace(/\D/g, '')) - 114) * 3) : 32,
    recommendedArrival: activeBooking?.start_time || '11:15 AM',
    centreName: activeBooking?.centre_name || 'Government Procurement Centre - Main DPC',
    centreLocation: activeBooking?.centre_location || 'Thanjavur, Tamil Nadu',
    centreStatus: 'OPERATIONAL',
    currentToken: '#114',
    distanceKm: '4.2',
    slotDate: activeBooking?.slot_date || '25 September 2026',
    slotTime: activeBooking?.start_time ? `${activeBooking.start_time} - ${activeBooking.end_time}` : '10:30 AM',
    slotCentre: activeBooking?.centre_name || 'Main DPC',
    slotStatus: activeBooking?.booking_status || 'Confirmed',
    procurementStage: 4,
    paymentAmount: '₹ 11,440',
    paymentStatus: 'Processing',
    transactionRef: 'CD-2026-00128',
    weatherTemp: '32°C',
    weatherLocation: 'Thanjavur, Tamil Nadu',
    weatherAdvisory: 'Rain probability is low today. You can plan your visit normally.',
  };

  const handleAiSend = async (customQuery) => {
    const q = customQuery || aiInput;
    if (!q.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await askHeroAI(q, language);
      alert(`Hero AI:\n\n${res}`);
      if (!customQuery) setAiInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    setIsListening(true);
    rec.start();
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setAiInput(text);
      setIsListening(false);
      handleAiSend(text);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-slate-800 dark:text-slate-100 font-sans">
      
      {/* ROW 1: Hero AI Main Card (Left ~68%) + Weather Card (Right ~32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Hero AI Interaction Card */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#E6F4EA] via-white to-emerald-50/50 dark:from-slate-800 dark:to-slate-900 border border-emerald-100 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-11 h-11 rounded-full bg-[#16A34A] flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#172033] dark:text-white leading-tight">
                    {t('heroCardTitle', 'Hero AI')}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('online', 'Online')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  {t('heroCardSubtitle', 'Ask me about your token, slot, queue, procurement or payment.')}
                </p>
              </div>
            </div>

            {/* Ask Input Bar */}
            <div className="relative flex items-center mb-3.5">
              <button
                onClick={() => setAiInput('')}
                className="absolute left-3.5 text-slate-400 hover:text-emerald-600 transition-colors"
                title="Reset input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder={t('typeOrSpeakPlaceholder', 'Type your question or use voice input...')}
                className="w-full pl-10 pr-24 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-emerald-600'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAiSend()}
                  disabled={aiLoading}
                  className="w-8 h-8 rounded-full bg-[#16A34A] hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-colors"
                  title="Send Question"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: '🏷', label: t('chipToken', 'My Token'), query: 'Where is my queue token?' },
                { icon: '📅', label: t('chipSlot', 'Book Slot'), query: 'How to book a slot?' },
                { icon: '📦', label: t('chipProcurement', 'Procurement Status'), query: 'Check procurement status' },
                { icon: '💳', label: t('chipPayment', 'Payment'), query: 'When will my payment arrive?' },
                { icon: '❓', label: t('chipHelp', 'Help'), query: 'Give me general help' },
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleAiSend(chip.query)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-2xs"
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#172033] dark:text-white">{dashboard.weatherTemp}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{t('weatherLocation', dashboard.weatherLocation)}</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shadow-2xs">
                <Sun className="w-6 h-6" />
              </div>
            </div>

            {/* Farmer Weather Advisory Box */}
            <div className="mt-4 p-3 rounded-xl bg-[#E6F4EA]/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{t('weatherAdvisoryTitle', 'Farmer Weather Advisory')}</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed font-medium">
                  "{t('weatherAdvisoryText', dashboard.weatherAdvisory)}"
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
            </div>
          </div>
        </div>

      </div>


      {/* ROW 2: Four Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Your Token */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('yourToken', 'Your Token')}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-black text-[#172033] dark:text-white tracking-tight">
              {dashboard.tokenNumber}
            </span>
          </div>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {t('active', 'Active')}
            </span>
          </div>
        </div>

        {/* 2. Farmers Ahead */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('farmersAheadTitle', 'Farmers Ahead')}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#172033] dark:text-white tracking-tight">
              {dashboard.farmersAhead}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {t('farmers', 'Farmers')}
            </span>
          </div>

          <div className="mt-3 flex justify-end">
            <Users className="w-5 h-5 text-blue-400 opacity-50" />
          </div>
        </div>

        {/* 3. Estimated Wait */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('estimatedWaitTitle', 'Estimated Waiting Time')}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {dashboard.estimatedWaitMins}
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              {t('minutesWait', 'Minutes')}
            </span>
          </div>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {t('normalStatus', 'Normal Queue')}
            </span>
          </div>
        </div>

        {/* 4. Recommended Arrival */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('recommendedArrivalTitle', 'Recommended Arrival Time')}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl font-black text-[#172033] dark:text-white tracking-tight">
              {dashboard.recommendedArrival}
            </span>
          </div>

          <div className="mt-3">
            <button className="text-xs font-bold text-[#16A34A] dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
              <span>{t('viewRoute', 'View Route →')}</span>
            </button>
          </div>
        </div>

      </div>


      {/* ROW 3: Procurement Centre Card (Left ~60%) + My Slot Card (Right ~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* My Procurement Centre Card (~3 cols = 60%) */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#172033] dark:text-white text-base">
                  {t('yourProcurementCentre', 'My Procurement Centre')}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {t('inOperation', 'Operational')}
              </span>
            </div>

            <p className="text-sm font-bold text-[#172033] dark:text-slate-200">
              {t('govtProcurementCentre', dashboard.centreName)}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {dashboard.centreLocation}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* 3 Metrics */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-medium">Current Token</span>
                  <span className="font-extrabold text-[#172033] dark:text-white text-sm">{dashboard.currentToken}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Your Token</span>
                  <span className="font-extrabold text-[#172033] dark:text-white text-sm">{dashboard.tokenNumber}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-t border-slate-200/60 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-bold">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    Distance
                  </span>
                  <span>{dashboard.distanceKm} km</span>
                </div>
              </div>

              {/* Graphic Map Box */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-emerald-50/40 dark:bg-slate-900 flex items-center justify-center p-2">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
                <div className="relative flex items-center gap-6 z-10">
                  <div className="flex flex-col items-center">
                    <MapPin className="w-5 h-5 text-emerald-600 animate-bounce" />
                    <span className="text-[9px] font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-2xs">Start</span>
                  </div>
                  <div className="w-16 h-0.5 border-t-2 border-dashed border-emerald-500" />
                  <div className="flex flex-col items-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="text-[9px] font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-2xs">Centre</span>
                  </div>
                </div>
                <button className="absolute bottom-2 px-3 py-1 rounded-full bg-[#16A34A] text-white text-[10px] font-bold shadow-md inline-flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  <span>View Route</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-colors">
              <Map className="w-4 h-4" />
              <span>{t('openRoute', 'View Route →')}</span>
            </button>
          </div>
        </div>

        {/* My Slot Card (~2 cols = 40%) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#172033] dark:text-white text-base">
                  {t('mySlot', 'My Slot')}
                </h3>
              </div>
              <button className="text-xs font-bold text-[#16A34A] dark:text-emerald-400 hover:underline">
                {t('viewAll', 'View All →')}
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Date</span>
                <span className="font-extrabold text-[#172033] dark:text-white">{t('today', dashboard.slotDate)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Time</span>
                <span className="font-extrabold text-[#172033] dark:text-white">{dashboard.slotTime}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Centre</span>
                <span className="font-extrabold text-[#172033] dark:text-white">{dashboard.slotCentre}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  ◆ {t('confirmed', 'Confirmed')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('changeTime', 'Reschedule')}</span>
            </button>
            <button className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs">
              <span>{t('cancelSlot', 'Cancel Slot')}</span>
            </button>
          </div>
        </div>

      </div>


      {/* ROW 4: Procurement Status Timeline Stepper */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-5">
          <Package className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-[#172033] dark:text-white text-base">
            {t('procurement', 'Procurement Status')}
          </h3>
        </div>

        {/* 7-Step Stepper Bar matching Image 1 */}
        <div className="overflow-x-auto no-scrollbar py-2">
          <div className="min-w-[700px] flex items-center justify-between relative">
            
            {/* Connecting line */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />

            {[
              { id: 1, title: t('slotConfirmed', 'Slot Confirmed'), status: 'completed', stateLabel: t('completed', 'Completed') },
              { id: 2, title: t('farmerArrived', 'Farmer Arrived'), status: 'completed', stateLabel: t('completed', 'Completed') },
              { id: 3, title: t('qualityCheck', 'Quality Verification'), status: 'completed', stateLabel: t('completed', 'Completed') },
              { id: 4, title: t('weightVerification', 'Weight Verification'), status: 'inProgress', stateLabel: t('inProgress', 'In Progress') },
              { id: 5, title: t('accepted', 'Accepted'), status: 'pending', stateLabel: t('pending', 'Pending') },
              { id: 6, title: t('paymentProcessing', 'Payment Processing'), status: 'pending', stateLabel: t('pending', 'Pending') },
              { id: 7, title: t('paymentCompleted', 'Payment Completed'), status: 'pending', stateLabel: t('pending', 'Pending') },
            ].map((step) => (
              <div key={step.id} className="flex flex-col items-center z-10 w-24 text-center">
                
                {/* Circle Icon */}
                {step.status === 'completed' && (
                  <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
                {step.status === 'inProgress' && (
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border-4 border-[#16A34A] text-emerald-600 flex items-center justify-center shadow-md animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-[#16A34A]" />
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-400 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                  </div>
                )}

                {/* Labels */}
                <span className={`text-xs font-bold mt-2 leading-tight ${
                  step.status === 'completed' || step.status === 'inProgress' 
                    ? 'text-[#172033] dark:text-white' 
                    : 'text-slate-400'
                }`}>
                  {step.title}
                </span>

                <span className={`text-[10px] font-bold mt-0.5 ${
                  step.status === 'completed' 
                    ? 'text-[#16A34A]' 
                    : step.status === 'inProgress' 
                    ? 'text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1' 
                    : 'text-slate-400'
                }`}>
                  {step.stateLabel}
                </span>

              </div>
            ))}

          </div>
        </div>
      </div>


      {/* ROW 5: Payment Summary (Left ~60%) + Notifications (Right ~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Payment Summary (~3 cols = 60%) */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-[#172033] dark:text-white text-base">
                {t('paymentSummaryTitle', 'Payment Summary')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  {t('procurementAmount', 'Procurement Amount')}
                </span>
                <span className="text-2xl font-black text-[#172033] dark:text-white tracking-tight mt-1 block">
                  {dashboard.paymentAmount}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  {t('paymentStatus', 'Payment Status')}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t('inProgress', dashboard.paymentStatus)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {t('expectedUpdateNote', 'Expected update: After procurement approval')}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  {t('transactionRef', 'Transaction Reference')}
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 block font-mono">
                  {dashboard.transactionRef}
                </span>
              </div>

            </div>
          </div>

          <div className="mt-4">
            <button className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-colors">
              <span>{t('viewPaymentHistory', 'View Payment History →')}</span>
            </button>
          </div>
        </div>

        {/* Notifications Card (~2 cols = 40%) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#172033] dark:text-white text-base">
                  {t('notifications', 'Notifications')}
                </h3>
              </div>
              <button className="text-xs font-bold text-[#16A34A] dark:text-emerald-400 hover:underline">
                {t('viewAll', 'View All →')}
              </button>
            </div>

            <div className="space-y-3">
              {/* Notification 1 */}
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {t('notification1', 'Your slot is confirmed for 25 Sep 2026, 10:30 AM')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {t('timeAgo1', '1 hour ago')}
                  </p>
                </div>
              </div>

              {/* Notification 2 */}
              <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {t('notification2', 'Your token #128 is approaching. Please be ready.')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {t('timeAgo2', '3 hours ago')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
