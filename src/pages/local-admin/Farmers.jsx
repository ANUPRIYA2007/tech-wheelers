import Card from '../../components/common/Card';
import { User } from 'lucide-react';

export default function Farmers() {
  const farmers = [
    { id: 1, name: 'Raman K.', farmerId: 'FRM-TN-001', village: 'Thiruvaiyaru', phone: '+91 9XXXXXXXX' },
    { id: 2, name: 'Selvi M.', farmerId: 'FRM-TN-002', village: 'Papanasam', phone: '+91 9XXXXXXXX' },
    { id: 3, name: 'Kumar S.', farmerId: 'FRM-TN-003', village: 'Kumbakonam', phone: '+91 9XXXXXXXX' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">Centre Farmers</h1>
      <div className="space-y-3">
        {farmers.map(f => (
          <Card key={f.id}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">{f.name}</p>
                <p className="text-xs text-surface-500">{f.farmerId} — {f.village}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
