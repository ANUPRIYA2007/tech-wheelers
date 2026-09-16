import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { MapPin } from 'lucide-react';

export default function Centres() {
  const centres = [
    { id: 1, name: 'Thanjavur Procurement Centre', district: 'Thanjavur', status: 'OPEN', queue: 45, counters: 3 },
    { id: 2, name: 'Kumbakonam Procurement Centre', district: 'Thanjavur', status: 'OPEN', queue: 32, counters: 2 },
    { id: 3, name: 'Tiruchirapalli Procurement Centre', district: 'Tiruchirappalli', status: 'DELAYED', queue: 58, counters: 4 },
    { id: 4, name: 'Madurai Procurement Centre', district: 'Madurai', status: 'OPEN', queue: 28, counters: 2 },
    { id: 5, name: 'Salem Procurement Centre', district: 'Salem', status: 'CLOSED', queue: 0, counters: 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">Procurement Centres</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {centres.map(c => (
          <Card key={c.id}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-surface-900 dark:text-white">{c.name}</h3>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {c.district}
            </p>
            <div className="mt-3 flex gap-4 text-xs text-surface-500 dark:text-surface-400">
              <span>Queue: {c.queue}</span>
              <span>Counters: {c.counters}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
