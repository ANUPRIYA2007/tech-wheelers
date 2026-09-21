import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMyBookings } from '../../hooks/useMyBookings';
import { 
  Sprout, Calendar, CalendarCheck, Users, Package, CreditCard,
  ChevronRight, CheckCircle2, Ticket, Clock, MapPin, Eye,
  Mic, Send, Sparkles, ArrowRight
} from 'lucide-react';
import { askHeroAI } from '../../services/aiGateway';
import ProcurementRouteMap from '../../components/common/ProcurementRouteMap';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { activeBooking, loading: bookingsLoading } = useMyBookings();

  const [aiInput, setAiInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const farmerName = profile?.full_name || 'Ramesh Kumar';

  // Handle AI interaction
  const handleAiSend = async (customQuery) => {
    const q = customQuery || aiInput;
    if (!q.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await askHeroAI(q, language);
      setAiResponse({ query: q, answer: res });
      if (!customQuery) setAiInput('');
    } catch (e) {
      console.error(e);
      setAiResponse({ query: q, answer: 'Sorry, I had trouble reaching Hero AI. Please try again.' });
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

  // Active booking display details
  const displayBooking = activeBooking || {
    token_number: '#120',
    booking_status: 'CONFIRMED',
    slot_date: '2026-09-24',
    start_time: '02:00 PM',
    end_time: '02:30 PM',
    centre_name: 'Government Procurement Centre - Main DPC',
    centre_location: 'Thanjavur, Tamil Nadu',
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-slate-800 dark:text-slate-100 font-sans pb-8 select-none">
      
      {/* 1. MAIN HERO / WELCOME BANNER (Exact User-Uploaded Reference Image) */}
      <div className="relative rounded-2xl border border-emerald-200/80 dark:border-slate-700 p-5 sm:p-6 shadow-2xs overflow-hidden flex items-center justify-between min-h-[120px] sm:min-h-[130px] bg-[#EAF7ED]">
        
        {/* Exact Reference Image Uploaded by User (Seamlessly Blended Background) */}
        <img
          src="/images/banner_exact_reference.png?v=3"
          alt="Crop Dairy Farmer Portal Welcome Banner"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Banner Left Text Content */}
        <div className="relative z-10 flex items-center gap-4 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7]/90 dark:bg-emerald-950/80 text-[#16A34A] flex items-center justify-center flex-shrink-0 border border-emerald-300/80 shadow-2xs">
            <Sprout className="w-6 h-6 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, {farmerName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold mt-1 leading-relaxed">
              Welcome to <strong>Crop Dairy Farmer Portal</strong>. Book your slot, track your queue and stay updated on your procurement status.
            </p>
          </div>
        </div>

      </div>

      {/* 2. QUICK ACTIONS SECTION */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
          Quick Actions
        </h2>

        {/* 4 Equal Cards in 1 Row on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Book Slot */}
          <div 
            onClick={() => navigate('/farmer/slots')}
            className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs hover:shadow-md hover:border-[#16A34A] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                  Book Slot
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Choose centre, date and time
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Card 2: My Queue */}
          <div 
            onClick={() => navigate('/farmer/queue')}
            className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs hover:shadow-md hover:border-[#16A34A] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                  My Queue
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Track your token & wait time
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Card 3: Procurement Status */}
          <div 
            onClick={() => navigate('/farmer/procurement')}
            className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs hover:shadow-md hover:border-[#16A34A] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                  Procurement Status
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  View processing updates
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Card 4: Payment */}
          <div 
            onClick={() => navigate('/farmer/payments')}
            className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xs hover:shadow-md hover:border-[#16A34A] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                  Payment
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  View payment details
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>
      </div>

      {/* 3. MAIN CONTENT: TWO EQUAL COLUMNS (Left: My Latest Slot | Right: Hero AI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        
        {/* LEFT COLUMN: My Latest Slot Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#16A34A]" />
                <h2 className="font-black text-slate-900 dark:text-white text-base">
                  My Latest Slot
                </h2>
              </div>
              <button 
                onClick={() => navigate('/farmer/slots')}
                className="text-xs font-bold text-[#16A34A] hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {bookingsLoading ? (
              /* Loading State */
              <div className="py-10 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Fetching active slot...</p>
              </div>
            ) : activeBooking || displayBooking ? (
              /* Active Booking Content */
              <div className="mt-4 space-y-3 text-xs">
                
                {/* Status Badge + Token Row */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    CONFIRMED
                  </span>
                  <span className="px-3.5 py-1 rounded-xl bg-[#DCFCE7] text-emerald-900 text-lg font-black font-mono tracking-tight">
                    {displayBooking.token_number || '#120'}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Date
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {displayBooking.slot_date}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Time
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {displayBooking.start_time ? `${displayBooking.start_time} - ${displayBooking.end_time || '02:30 PM'}` : '02:00 PM - 02:30 PM'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Centre
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
                      {displayBooking.centre_name || 'Government Procurement Centre - Main DPC'}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              /* Empty Slot State */
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">No active slot</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Book a procurement slot to get started.</p>
                </div>
                <button
                  onClick={() => navigate('/farmer/slots')}
                  className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Book Slot →
                </button>
              </div>
            )}
          </div>

          {/* Bottom View Details Button */}
          <div className="mt-5 pt-3">
            <button
              onClick={() => navigate('/farmer/slots')}
              className="w-full py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-[#16A34A] dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-100/60 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Hero AI Card (No large 3D model inside card as requested!) */}
        <div className="rounded-2xl bg-[#F0FDF4]/70 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {/* Small circular representation of Hero */}
                <div className="w-10 h-10 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-lg font-black shadow-md flex-shrink-0">
                  👨‍🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      Hero AI
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Your Personal Crop Dairy Assistant
                  </p>
                </div>
              </div>
            </div>

            {/* AI Response output box if query sent */}
            {aiResponse && (
              <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs space-y-1">
                <p className="font-black text-[#16A34A] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Hero AI Response:
                </p>
                <p className="leading-relaxed font-medium">{aiResponse.answer}</p>
              </div>
            )}

            {/* Input Control Box */}
            <div className="relative flex items-center mt-4">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Ask about your slot, token, queue or payment..."
                className="w-full pl-4 pr-24 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-[#16A34A]'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAiSend()}
                  disabled={aiLoading}
                  className="w-8 h-8 rounded-full bg-[#16A34A] hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => handleAiSend('Where is my queue token?')}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:border-[#16A34A] hover:text-[#16A34A] transition-all shadow-2xs inline-flex items-center gap-1.5"
              >
                🏷 My Token
              </button>
              <button
                onClick={() => handleAiSend('What is my queue status and wait time?')}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:border-[#16A34A] hover:text-[#16A34A] transition-all shadow-2xs inline-flex items-center gap-1.5"
              >
                👥 My Queue
              </button>
              <button
                onClick={() => handleAiSend('When is my booked slot?')}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:border-[#16A34A] hover:text-[#16A34A] transition-all shadow-2xs inline-flex items-center gap-1.5"
              >
                📅 My Slot
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 4. MY PROCUREMENT CENTRE (Full-width Card at Bottom) */}
      <ProcurementRouteMap
        centreName={displayBooking.centre_name || 'Government Procurement Centre - Main DPC'}
        centreLocation={displayBooking.centre_location || 'Thanjavur, Tamil Nadu'}
        currentToken="#101"
        yourToken={displayBooking.token_number || '#120'}
        distanceKm="4.2"
        operatingStatus="Operational"
      />

    </div>
  );
}
