import { Link } from 'react-router-dom';
import { CheckCircle2, Sprout, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Registration Successful!
        </h1>
        <p className="mt-3 text-surface-500 dark:text-surface-400">
          Your Crop Dairy account has been created. Please check your email to verify your account, then log in to access your dashboard.
        </p>
        <div className="mt-8 space-y-3">
          <Link to="/login">
            <Button className="w-full" size="lg">
              Continue to Login <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/landing">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
