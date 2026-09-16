import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function Payments() {
  const { t } = useLanguage();

  const payments = [
    { id: 1, amount: '₹24,500', status: 'PENDING', ref: 'TXN-2026-0917-001', date: '2026-09-17', crop: 'Paddy' },
    { id: 2, amount: '₹18,200', status: 'COMPLETED', ref: 'TXN-2026-0910-003', date: '2026-09-10', crop: 'Sugarcane' },
    { id: 3, amount: '₹31,000', status: 'COMPLETED', ref: 'TXN-2026-0901-007', date: '2026-09-01', crop: 'Paddy' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{t('payment')}</h1>
        <p className="page-subtitle">Track your procurement payments</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Total Received</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">₹49,200</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹24,500</p>
        </Card>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {payments.map(p => (
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  p.status === 'COMPLETED' ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  {p.status === 'COMPLETED' 
                    ? <ArrowDownRight className="w-5 h-5 text-primary-600" />
                    : <CreditCard className="w-5 h-5 text-amber-600" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">{p.amount}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{p.crop} — {p.date}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={p.status} />
                <p className="text-xs text-surface-400 mt-1">{p.ref}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
