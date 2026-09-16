import Card from '../../components/common/Card';
import { MapPin, Users, Hash, Clock, CreditCard, TrendingUp } from 'lucide-react';

export default function SuperAdminDashboard() {
  const metrics = [
    { label: 'Total Centres', value: '5', icon: MapPin, bg: 'bg-primary-100 dark:bg-primary-900/30', ic: 'text-primary-600' },
    { label: 'Active Centres', value: '4', icon: MapPin, bg: 'bg-sky-100 dark:bg-sky-900/30', ic: 'text-sky-600' },
    { label: 'Farmers Today', value: '187', icon: Users, bg: 'bg-amber-100 dark:bg-amber-900/30', ic: 'text-amber-600' },
    { label: 'Total Tokens', value: '512', icon: Hash, bg: 'bg-violet-100 dark:bg-violet-900/30', ic: 'text-violet-600' },
    { label: 'Avg Wait Time', value: '24 min', icon: Clock, bg: 'bg-blue-100 dark:bg-blue-900/30', ic: 'text-blue-600' },
    { label: 'Pending Payments', value: '₹3.2L', icon: CreditCard, bg: 'bg-red-100 dark:bg-red-900/30', ic: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Super Admin Dashboard</h1>
        <p className="page-subtitle">Platform-wide procurement overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">{m.label}</p>
                <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{m.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg}`}>
                <m.icon className={`w-5 h-5 ${m.ic}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
