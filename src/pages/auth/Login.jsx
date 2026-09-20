import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Eye, EyeOff, ArrowLeft, ShieldCheck, Building2, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import LanguageSelector from '../../components/common/LanguageSelector';

export default function Login() {
  const { signIn } = useAuth();
  const { t, language, changeLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get('role') || 'farmer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRoleConfig = () => {
    switch (selectedRole) {
      case 'local_admin':
        return {
          title: 'Local Admin Login',
          subtitle: 'Sign in to access your Local Procurement Centre dashboard',
          badge: 'Local Procurement Centre',
          icon: Building2,
          targetPath: '/local-admin'
        };
      case 'super_admin':
        return {
          title: 'Super Admin Login',
          subtitle: 'Sign in to access Platform-wide Administration',
          badge: 'Super Admin',
          icon: ShieldCheck,
          targetPath: '/super-admin'
        };
      default:
        return {
          title: 'Farmer Login',
          subtitle: 'Sign in to access your farmer portal & live queue',
          badge: 'Farmer Portal',
          icon: UserCheck,
          targetPath: '/farmer'
        };
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const authResult = await signIn({ email: email.trim(), password });
      
      // Navigate according to target path
      navigate(roleConfig.targetPath, { replace: true });
    } catch (err) {
      if (err.message?.includes('Invalid login')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email before signing in.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Crop Dairy</h1>
          <p className="text-emerald-100 mt-3 text-lg font-medium max-w-sm">
            Smart Procurement. Less Waiting. Better Decisions.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          
          {/* Top Bar: Back to Portal & Language Selector */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/portal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Portal Selection
            </Link>

            <LanguageSelector />
          </div>

          {/* Role Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold mb-4">
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{roleConfig.badge}</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {roleConfig.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-medium">
            {roleConfig.subtitle}
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@cropdairy.in"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors shadow-2xs"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors shadow-2xs pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                Remember me
              </label>
              <button type="button" className="text-emerald-600 hover:text-emerald-700 font-bold">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/25" size="lg" loading={loading}>
              Sign In to {roleConfig.badge}
            </Button>
          </form>

          {selectedRole === 'farmer' ? (
            <p className="mt-6 text-center text-xs text-slate-500 font-medium">
              Don't have a farmer account?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold">
                Register as Farmer
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-center text-xs text-slate-400 font-medium">
              Admin credentials are issued by authorized administration.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

