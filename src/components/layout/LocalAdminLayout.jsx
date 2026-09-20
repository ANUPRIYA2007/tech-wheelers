import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sprout, 
  LayoutDashboard, 
  Users as UsersIcon, 
  Truck, 
  Award, 
  UserCheck, 
  CreditCard, 
  FileBarChart, 
  Bell, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  Building2, 
  Activity, 
  ArrowLeft 
} from 'lucide-react';
import LanguageSelector from '../common/LanguageSelector';
import SidebarHeroRobot from '../hero/SidebarHeroRobot';
import HeroChatbot from '../common/HeroChatbot';

export default function LocalAdminLayout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [centreStatus, setCentreStatus] = useState('OPERATIONAL'); // OPERATIONAL | PAUSED | CLOSED
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogout = () => {
    navigate('/portal');
  };

  // 9 Required Sidebar Navigation Menu Items
  const SIDEBAR_MENU = [
    { id: 'dashboard', path: '/local-admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { id: 'queue', path: '/local-admin/queue', icon: UsersIcon, label: 'Live Queue' },
    { id: 'procurement', path: '/local-admin/procurement', icon: Truck, label: 'Procurement Processing' },
    { id: 'quality', path: '/local-admin/procurement', icon: Award, label: 'Quality Grading' },
    { id: 'farmers', path: '/local-admin/farmers', icon: UserCheck, label: 'Farmer Records' },
    { id: 'payments', path: '/local-admin/procurement', icon: CreditCard, label: 'Payment Management' },
    { id: 'reports', path: '/local-admin', icon: FileBarChart, label: 'Reports' },
    { id: 'notifications', path: '/local-admin', icon: Bell, label: 'Notifications' },
    { id: 'settings', path: '/local-admin', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ==================== FIXED LEFT SIDEBAR (280px) ==================== */}
      <aside className="w-[280px] fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between select-none shadow-md overflow-y-auto no-scrollbar">
        
        {/* TOP SECTION: BRANDING & CENTRE INFO */}
        <div className="p-4 space-y-4">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                Crop Dairy
              </span>
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                PROCUREMENT CENTRE ADMIN
              </span>
            </div>
          </div>

          {/* Centre Identification & Status Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Centre:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                DPC #104
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
              Thanjavur Primary DPC #104
            </div>

            {/* Centre Status Indicator Switch */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCentreStatus(centreStatus === 'OPERATIONAL' ? 'PAUSED' : 'OPERATIONAL')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                    centreStatus === 'OPERATIONAL'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  }`}
                  title="Click to toggle status"
                >
                  <span className={`w-2 h-2 rounded-full ${centreStatus === 'OPERATIONAL' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {centreStatus}
                </button>
              </div>
            </div>
          </div>

          {/* VERTICAL MENU NAVIGATION (No top tabs) */}
          <nav className="space-y-1 pt-1">
            <div className="px-2 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>

            {SIDEBAR_MENU.map((item) => {
              const isActive = item.end 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path) && item.path !== '/local-admin';

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.end}
                  className={({ isActive: linkActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                    ${linkActive || (item.id === 'dashboard' && location.pathname === '/local-admin')
                      ? 'bg-[#059669] text-white shadow-md shadow-emerald-600/20' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SECTION: 3D HERO AI ROBOT + CONTROLS */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          
          {/* 3D Hero AI Farmer Robot INSIDE Sidebar */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-2 shadow-2xs relative">
            <SidebarHeroRobot onOpenChat={() => setIsChatOpen(true)} />
          </div>

          {/* DARK MODE TOGGLE & LOGOUT BUTTON AT VERY BOTTOM */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
              title="Logout to Portal Selection"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

          </div>

        </div>

      </aside>

      {/* ==================== MAIN WORKSPACE AREA ==================== */}
      <div className="flex-1 ml-[280px] min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
        
        {/* WORKSPACE TOP HEADER BAR */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 px-6 py-3.5 shadow-2xs flex items-center justify-between gap-4">
          
          {/* Title & Portal Return Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portal')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Return to Portal Selection"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Local Procurement Centre Workspace
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Thanjavur Primary DPC #104 • Live Operational Management
              </p>
            </div>
          </div>

          {/* Right Header Status Badges & Language Selector */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>4 Active Counters</span>
            </div>

            <LanguageSelector />
          </div>

        </header>

        {/* DASHBOARD CONTENT ROUTE */}
        <main className="flex-1 p-6 pb-20">
          <Outlet context={{ centreStatus, setCentreStatus, isDarkMode }} />
        </main>

      </div>

      {/* FLOATING HERO AI CHATBOT (DRAWER) */}
      <HeroChatbot
        isOpenProp={isChatOpen}
        onCloseProp={() => setIsChatOpen(false)}
      />

    </div>
  );
}

