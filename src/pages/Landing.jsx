import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout, ArrowRight, Clock, Users, MapPin, CalendarCheck,
  Truck, CreditCard, CloudSun, Bot, Mic, Languages,
  CheckCircle2, ChevronRight, Shield, Zap, Eye
} from 'lucide-react';
import Button from '../components/common/Button';

const FEATURES = [
  { icon: Users, title: 'Smart Queue', desc: 'Live token tracking and farmer count with real-time updates.' },
  { icon: Clock, title: 'Smart Arrival', desc: 'AI-recommended arrival time based on current queue speed.' },
  { icon: MapPin, title: 'Centre Status', desc: 'Check if your procurement centre is open, closed, or delayed.' },
  { icon: CalendarCheck, title: 'Slot Booking', desc: 'Book your procurement slot in advance and skip the wait.' },
  { icon: Truck, title: 'Procurement Tracking', desc: 'Track produce quality check, weight verification, and acceptance.' },
  { icon: CreditCard, title: 'Payment Tracking', desc: 'Know your payment status and receive instant updates.' },
  { icon: CloudSun, title: 'Weather Suggestions', desc: 'Weather-aware recommendations for your procurement visit.' },
  { icon: Bot, title: 'AI Assistant', desc: 'Hero AI helps you in your language with voice and text.' },
  { icon: Mic, title: 'Voice Support', desc: 'Speak to Hero in Tamil, Hindi, or English.' },
  { icon: Languages, title: 'Multilingual', desc: 'Full interface support in multiple Indian languages.' },
];

const STEPS = [
  { num: '01', title: 'Register', desc: 'Create your farmer account with basic details.' },
  { num: '02', title: 'Verify', desc: 'Verify your farmer identity and government ID.' },
  { num: '03', title: 'Book Slot', desc: 'Choose a date, time, and procurement centre.' },
  { num: '04', title: 'Get Token', desc: 'Receive your digital queue token number.' },
  { num: '05', title: 'Track Queue', desc: 'See live queue position and estimated wait.' },
  { num: '06', title: 'Smart Arrival', desc: 'Arrive at the recommended time, not too early.' },
  { num: '07', title: 'Procurement', desc: 'Track quality check, weight, and acceptance.' },
  { num: '08', title: 'Payment', desc: 'Receive and track your payment digitally.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { t, language, changeLanguage, languages } = useLanguage();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.hero-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.4, ease: 'power3.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900 dark:text-white">Crop Dairy</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-surface-600 dark:text-surface-400">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-primary-600 transition-colors">About</a>
            <select
              value={language}
              onChange={e => changeLanguage(e.target.value)}
              className="bg-transparent border border-surface-300 dark:border-surface-600 rounded-lg px-2 py-1 text-xs focus:ring-primary-500 focus:outline-none"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.nativeName}</option>
              ))}
            </select>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">{t('login')}</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">{t('register')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/30 dark:from-surface-900 dark:via-surface-900 dark:to-primary-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl">
            <div className="hero-title opacity-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium mb-6">
                <Zap className="w-3 h-3" /> SIH 2026 — Smart Procurement Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-white leading-tight">
                Smart Procurement.{' '}
                <span className="text-primary-600">Less Waiting.</span>
              </h1>
            </div>
            <p className="hero-subtitle opacity-0 mt-6 text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-2xl leading-relaxed">
              Crop Dairy helps farmers plan procurement-centre visits with live queue visibility, 
              smart arrival recommendations, procurement status tracking and payment updates.
            </p>
            <div className="hero-actions opacity-0 mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg">
                  {t('getStarted')} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" size="lg">
                  {t('seeHowItWorks')}
                </Button>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: '60%', label: 'Less Waiting Time' },
              { value: '10+', label: 'Languages Supported' },
              { value: '24/7', label: 'AI Assistant' },
              { value: '100%', label: 'Digital Tracking' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/60 dark:bg-surface-800/60 backdrop-blur border border-surface-200/50 dark:border-surface-700/50">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-surface-50 dark:bg-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white">The Problem</h2>
            <p className="mt-4 text-surface-600 dark:text-surface-400">
              Farmers across India face unpredictable waiting times at procurement centres.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Unpredictable Waiting', desc: 'Hours spent without knowing when your turn will come.' },
              { icon: Users, title: 'Long Queues', desc: 'No visibility into queue length or processing speed.' },
              { icon: Eye, title: 'No Real-time Info', desc: 'No way to check centre status, procurement updates, or payment status remotely.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white">The Solution</h2>
            <p className="mt-4 text-surface-600 dark:text-surface-400">
              Digital slots, live queue tracking, AI-powered arrival recommendations, and end-to-end procurement visibility.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: CalendarCheck, title: 'Digital Slots', desc: 'Book your visit in advance.' },
              { icon: Shield, title: 'Digital Tokens', desc: 'Get a guaranteed queue position.' },
              { icon: Users, title: 'Live Queue', desc: 'See exactly where you are.' },
              { icon: Clock, title: 'Wait Estimation', desc: 'Know the estimated wait time.' },
              { icon: Zap, title: 'Smart Arrival', desc: 'Arrive at the right time.' },
              { icon: CreditCard, title: 'Payment Tracking', desc: 'Track payment from start to end.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" ref={featuresRef} className="py-16 md:py-24 bg-surface-50 dark:bg-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Smart Features</h2>
            <p className="mt-4 text-surface-600 dark:text-surface-400">
              Everything a farmer needs, powered by technology.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-card hover:shadow-card-hover transition-all group">
                <f.icon className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{f.title}</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-surface-600 dark:text-surface-400">
              From registration to payment in 8 simple steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-card">
                <div className="text-3xl font-bold text-primary-100 dark:text-primary-900/30 absolute top-3 right-4">{step.num}</div>
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Hero Section */}
      <section id="about" className="py-16 md:py-24 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
                <Bot className="w-4 h-4" /> AI-Powered Assistant
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Meet Hero — Your AI Farming Assistant
              </h2>
              <p className="mt-4 text-primary-100 text-lg leading-relaxed">
                Hero can help you register, book slots, check your token, track the queue, 
                monitor procurement, check payments, find centres, get weather advice — all in your language.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {['Register', 'Book Slots', 'Check Queue', 'Track Payment', 'Voice Support', 'Local Languages'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary-200 flex-shrink-0" />
                    <span className="text-primary-50">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-72 h-80 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <p className="text-center text-primary-100 text-sm italic">
                  "வணக்கம்! இன்று உங்களுக்கு எப்படி உதவலாம்?"
                </p>
                <p className="text-center text-primary-200 text-xs mt-2">
                  Hello! How can I help you today?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Languages className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Built for Every Indian Farmer</h2>
          <p className="mt-4 text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
            Crop Dairy is designed with a central language infrastructure supporting Tamil, Hindi, English, 
            and extensible to all Indian languages through AI4Bharat IndicTrans2.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {languages.map(l => (
              <span key={l.code} className="px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-medium border border-primary-200 dark:border-primary-800">
                {l.nativeName}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-surface-50 dark:bg-surface-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">
            Spend less time waiting.
            <br />
            <span className="text-primary-600">Spend more time farming.</span>
          </h2>
          <p className="mt-4 text-surface-600 dark:text-surface-400">
            Join Crop Dairy and take control of your procurement journey.
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg">
                {t('getStarted')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center">
              <Sprout className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-surface-900 dark:text-white">Crop Dairy</span>
          </div>
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} Crop Dairy — SIH 2026. Smart Procurement Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
