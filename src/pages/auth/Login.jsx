import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Login() {
  const { signIn } = useAuth();
  const { t, language, changeLanguage, languages } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      navigate('/farmer', { replace: true });
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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex">
      {/* Left Panel — Branding */}
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
            Smart Procurement. Less Waiting. Better Decisions.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-white">Crop Dairy</span>
          </div>

          {/* Language Selector */}
          <div className="flex justify-end mb-6">
            <select
              value={language}
              onChange={e => changeLanguage(e.target.value)}
              className="bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-1.5 text-sm focus:ring-primary-500 focus:outline-none text-surface-700 dark:text-surface-300"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.nativeName}</option>
              ))}
            </select>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
            {t('login')}
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
            Sign in to your Crop Dairy account
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                <input type="checkbox" className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {t('login')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
