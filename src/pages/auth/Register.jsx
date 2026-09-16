import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { gsap } from 'gsap';
import { Sprout, Eye, EyeOff, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Button from '../../components/common/Button';

const STEPS = ['Basic Info', 'Farmer Info', 'Language', 'Review'];

export default function Register() {
  const { signUp } = useAuth();
  const { t, language, changeLanguage, languages } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', password: '', confirmPassword: '',
    farmerId: '', village: '', district: '', state: '',
    preferredLanguage: language,
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const highlightField = (fieldId) => {
    const el = document.getElementById(fieldId);
    if (el) {
      gsap.fromTo(el, { borderColor: '#DC2626' }, { borderColor: '#E2E8F0', duration: 1.5, ease: 'power2.out' });
      el.focus();
    }
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.fullName.trim()) { highlightField('fullName'); setError('Full name is required.'); return false; }
        if (!form.phone.trim()) { highlightField('phone'); setError('Phone number is required.'); return false; }
        if (!form.email.trim()) { highlightField('email'); setError('Email is required.'); return false; }
        if (form.password.length < 6) { highlightField('password'); setError('Password must be at least 6 characters.'); return false; }
        if (form.password !== form.confirmPassword) { highlightField('confirmPassword'); setError('Passwords do not match.'); return false; }
        return true;
      case 1:
        if (!form.village.trim()) { highlightField('village'); setError('Village is required.'); return false; }
        if (!form.district.trim()) { highlightField('district'); setError('District is required.'); return false; }
        if (!form.state.trim()) { highlightField('state'); setError('State is required.'); return false; }
        return true;
      case 2:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, [step]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      navigate('/registration-success', { replace: true });
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm";

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Crop Dairy</h1>
          <p className="text-primary-100 mt-3 text-lg max-w-sm">
            Join thousands of farmers using smart procurement.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-white">Crop Dairy</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{t('register')}</h2>
          <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">Create your farmer account</p>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-6 mb-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? 'bg-primary-600 text-white' :
                  i === step ? 'bg-primary-600 text-white ring-2 ring-primary-300' :
                  'bg-surface-200 dark:bg-surface-700 text-surface-500'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-12 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">{STEPS[step]}</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div ref={formRef}>
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('fullName')} *</label>
                  <input id="fullName" type="text" value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Enter your full name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('phone')} *</label>
                  <input id="phone" type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('email')} *</label>
                  <input id="email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="farmer@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('password')} *</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="Min 6 characters" className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('confirmPassword')} *</label>
                  <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} placeholder="Confirm password" className={inputClass} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-xs text-primary-700 dark:text-primary-300 flex items-center justify-between">
                  <span>Farmer ID will be auto-generated for you upon registration</span>
                  <span className="font-mono font-bold bg-primary-100 dark:bg-primary-800 px-2 py-0.5 rounded text-[11px]">AUTO-GEN</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('village')} *</label>
                  <input id="village" type="text" value={form.village} onChange={e => updateField('village', e.target.value)} placeholder="Enter your village" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('district')} *</label>
                  <input id="district" type="text" value={form.district} onChange={e => updateField('district', e.target.value)} placeholder="Enter your district" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('state')} *</label>
                  <select id="state" value={form.state} onChange={e => updateField('state', e.target.value)} className={inputClass}>
                    <option value="">Select State</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Bihar">Bihar</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-surface-600 dark:text-surface-400">{t('selectLanguage')}</p>
                <div className="grid grid-cols-1 gap-3">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { updateField('preferredLanguage', l.code); changeLanguage(l.code); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.preferredLanguage === l.code
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-surface-200 dark:border-surface-700 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-semibold text-surface-900 dark:text-white">{l.nativeName}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{l.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-surface-900 dark:text-white">Review Your Information</h3>
                <div className="space-y-3 text-sm">
                  {[
                    [t('fullName'), form.fullName],
                    [t('phone'), form.phone],
                    [t('email'), form.email],
                    [t('farmerId'), 'Auto-assigned upon registration (e.g. FRM-2026-XXXX)'],
                    [t('village'), form.village],
                    [t('district'), form.district],
                    [t('state'), form.state],
                    [t('selectLanguage'), languages.find(l => l.code === form.preferredLanguage)?.nativeName],
                  ].map(([label, val], i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-surface-100 dark:border-surface-700">
                      <span className="text-surface-500 dark:text-surface-400">{label}</span>
                      <span className="font-medium text-surface-900 dark:text-white text-right max-w-[220px]">{val || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <Button variant="ghost" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4" /> {t('back')}
              </Button>
            ) : (
              <div />
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={nextStep}>
                {t('next')} <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>
                {t('submit')}
              </Button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
