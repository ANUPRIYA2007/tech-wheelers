import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { UserCheck, ArrowRight } from 'lucide-react';

export default function QueueManagement() {
  const queue = [
    { token: '012', farmer: 'Raman K.', status: 'PROCESSING', time: '09:45 AM' },
    { token: '013', farmer: 'Selvi M.', status: 'WAITING', time: '09:50 AM' },
    { token: '014', farmer: 'Kumar S.', status: 'WAITING', time: '09:55 AM' },
    { token: '015', farmer: 'Lakshmi R.', status: 'WAITING', time: '10:00 AM' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Queue Management</h1>
          <p className="page-subtitle">Manage the procurement queue</p>
        </div>
        <Button><UserCheck className="w-4 h-4" /> Call Next Farmer</Button>
      </div>
      <div className="space-y-3">
        {queue.map(q => (
          <Card key={q.token}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary-600">#{q.token}</div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">{q.farmer}</p>
                  <p className="text-xs text-surface-400">{q.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={q.status} />
                {q.status === 'WAITING' && <Button size="sm" variant="ghost">Process <ArrowRight className="w-3 h-3" /></Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
