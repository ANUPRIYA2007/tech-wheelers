import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { CheckCircle2, Circle, Truck } from 'lucide-react';

const STAGES = [
  { key: 'SLOT_CONFIRMED', label: 'slotConfirmed' },
  { key: 'FARMER_ARRIVED', label: 'farmerArrived' },
  { key: 'QUALITY_CHECK', label: 'qualityCheck' },
  { key: 'WEIGHT_VERIFICATION', label: 'weightVerification' },
  { key: 'ACCEPTED', label: 'accepted' },
  { key: 'PAYMENT_PENDING', label: 'paymentPending' },
  { key: 'PAYMENT_COMPLETED', label: 'paymentCompleted' },
];

export default function Procurement() {
  const { t } = useLanguage();
  const currentStageIndex = 2; // QUALITY_CHECK
  const currentStatus = 'QUALITY_CHECK';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{t('procurement')}</h1>
        <p className="page-subtitle">Track your procurement progress</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-surface-900 dark:text-white">Current Status</h3>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {STAGES.map((stage, i) => {
            const isCompleted = i < currentStageIndex;
            const isCurrent = i === currentStageIndex;
            const isFuture = i > currentStageIndex;
            return (
              <div key={stage.key} className="flex gap-4">
                {/* Line + Dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-primary-600' : isCurrent ? 'bg-primary-600 ring-4 ring-primary-100 dark:ring-primary-900' : 'bg-surface-200 dark:bg-surface-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : isCurrent ? (
                      <Truck className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-surface-400" />
                    )}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`w-0.5 h-10 ${isCompleted ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-600'}`} />
                  )}
                </div>
                {/* Label */}
                <div className={`pb-8 ${isFuture ? 'opacity-50' : ''}`}>
                  <p className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-surface-900 dark:text-white' : 'text-surface-400'
                  }`}>
                    {t(stage.label)}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">In Progress</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
