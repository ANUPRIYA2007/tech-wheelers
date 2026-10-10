import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  User, Phone, Mail, MapPin, ShieldCheck, 
  Save, Globe, LogOut, CheckCircle2, 
  Building, CreditCard, Sparkles, Check, AlertCircle, 
  Layers, Lock, ChevronDown
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useLanguage();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: profile?.full_name || 'Ramesh Kumar',
    phone: profile?.phone || '+91 98765 43210',
    email: profile?.email || 'ramesh.farmer@cropdairy.in',
    farmerId: profile?.farmers?.[0]?.farmer_id || 'FRM-TN-2026-001',
    village: profile?.farmers?.[0]?.village || 'Thiruvaiyaru',
    district: profile?.farmers?.[0]?.district || 'Thanjavur',
    state: profile?.farmers?.[0]?.state || 'Tamil Nadu',
    pincode: '613204',
    landAcres: '4.5',
    primaryCrop: 'Paddy (Ponni Rice)',
    bankAccount: '•••• •••• 8842 (State Bank of India)',
    aadhaarNumber: '•••• •••• 7412',
    govIdVerified: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Farmer Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Manage your personal profile, verification credentials, and language preferences
          </p>
        </div>
        
        {/* Verification Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Aadhaar Verified</span>
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
          <span className="text-[11px] opacity-75">Saved</span>
        </div>
      )}

      {/* Main Grid: Left Identity Card | Right Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Profile Identity Card & Quick Stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-xs">
            {/* Avatar Circle */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-500/20">
                {form.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-emerald-600 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {form.fullName}
            </h2>
            <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {form.farmerId}
            </p>
            
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-2 text-xs text-left">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{form.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Location</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{form.district}, {form.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Govt ID</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Aadhaar ({form.aadhaarNumber})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">Active Member</span>
              </div>
            </div>
          </div>

          {/* Account Security Quick Card */}
          <div className="bg-slate-50 dark:bg-slate-850/50 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white text-xs font-black">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Direct MSP Payout Account</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Your registered bank account receives verified government procurement payments automatically.
            </p>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              {form.bankAccount}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings Panels */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. PERSONAL & FARM DETAILS */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Personal & Farm Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Update your contact, farm location, and agricultural details
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Village / Town
                  </label>
                  <input
                    type="text"
                    value={form.village}
                    onChange={e => setForm({ ...form, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cultivated Land (Acres)
                  </label>
                  <input
                    type="text"
                    value={form.landAcres}
                    onChange={e => setForm({ ...form, landAcres: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Crop
                  </label>
                  <input
                    type="text"
                    value={form.primaryCrop}
                    onChange={e => setForm({ ...form, primaryCrop: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. LANGUAGE PREFERENCE DROPDOWN */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Language Preference
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Select your preferred regional language for the portal
                  </p>
                </div>
              </div>

              {/* Current Active Language Pill */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{languages.find(l => l.code === currentLanguage)?.nativeName || 'English'}</span>
              </span>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Choose Display Language
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4 text-emerald-600" />
                </div>
                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition-colors shadow-2xs"
                  aria-label="Language Preference Dropdown"
                >
                  {(languages || [
                    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
                    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
                    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
                    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
                    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
                    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
                    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
                    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
                    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
                    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
                    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' }
                  ]).map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-2"
                    >
                      {lang.flag || '🇮🇳'} {lang.nativeName || lang.name} ({lang.name})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-2">
                All dashboard text, voice guidance, and notifications will be translated to your selected language.
              </p>
            </div>
          </div>

          {/* 3. ACCOUNT & SESSION LOGOUT */}
          <div className="bg-red-50/40 dark:bg-red-950/20 rounded-3xl border border-red-200/80 dark:border-red-900/40 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center font-bold">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Account Session & Logout
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Securely sign out of your Farmer Portal account
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
