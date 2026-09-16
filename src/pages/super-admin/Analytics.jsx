import Card from '../../components/common/Card';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">Analytics</h1>
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h3 className="font-semibold text-surface-900 dark:text-white">Platform Analytics</h3>
        </div>
        <p className="text-surface-500 dark:text-surface-400">
          Analytics dashboard with Recharts integration. Connect to Supabase for real procurement data.
        </p>
      </Card>
    </div>
  );
}
