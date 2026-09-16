import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-surface-800 p-8 rounded-3xl border border-slate-200 dark:border-surface-700 shadow-xl text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-600/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ✓ Registration Successful
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Your Crop Dairy account has been created successfully.
        </p>

        <div className="mt-8">
          <Link to="/farmer">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/20" size="lg">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
