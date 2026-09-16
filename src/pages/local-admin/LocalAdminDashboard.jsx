import Card from '../../components/common/Card';
import { Users, Hash, Clock, Truck, CreditCard, AlertTriangle } from 'lucide-react';

export default function LocalAdminDashboard() {
  const metrics = [
    { label: "Today's Farmers", value: '45', icon: Users, color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' },
    { label: 'Current Token', value: '#012', icon: Hash, color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' },
    { label: 'Queue Length', value: '33', icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
    { label: 'Active Counters', value: '3', icon: Truck, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' },
    { label: 'Avg Processing', value: '8 min', icon: Clock, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { label: 'Pending Payments', value: '12', icon: CreditCard, color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Local Admin Dashboard</h1>
        <p className="page-subtitle">Thanjavur Procurement Centre</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">{m.label}</p>
                <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{m.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color.split(' ').slice(0, 2).join(' ')}`}>
                <m.icon className={`w-5 h-5 ${m.color.split(' ').slice(2).join(' ')}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
