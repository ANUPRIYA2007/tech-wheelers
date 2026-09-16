import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ProcurementManagement() {
  const items = [
    { id: 1, farmer: 'Raman K.', crop: 'Paddy', weight: '500 kg', quality: 'Grade A', status: 'QUALITY_CHECK' },
    { id: 2, farmer: 'Selvi M.', crop: 'Sugarcane', weight: '2000 kg', quality: 'Pending', status: 'FARMER_ARRIVED' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Procurement Management</h1>
        <p className="page-subtitle">Verify quality, weight, and accept produce</p>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <Card key={item.id}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-surface-900 dark:text-white">{item.farmer}</p>
                <p className="text-sm text-surface-500">{item.crop} — {item.weight} — {item.quality}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} />
                <Button size="sm"><CheckCircle className="w-4 h-4" /> Accept</Button>
                <Button size="sm" variant="danger"><XCircle className="w-4 h-4" /> Reject</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
