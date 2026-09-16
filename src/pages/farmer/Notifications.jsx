import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { Bell, Check, CalendarCheck, Users, Truck, CreditCard, AlertTriangle } from 'lucide-react';

const ICON_MAP = {
  slot: CalendarCheck,
  queue: Users,
  procurement: Truck,
  payment: CreditCard,
  alert: AlertTriangle,
};

export default function Notifications() {
  const { t } = useLanguage();

  const notifications = [
    { id: 1, title: 'Slot Confirmed', message: 'Your slot for September 17, 10:00 AM at Thanjavur Centre has been confirmed.', type: 'slot', isRead: false, createdAt: '2 hours ago' },
    { id: 2, title: 'Token Approaching', message: 'Your token #024 is approaching. Current token is #020.', type: 'queue', isRead: false, createdAt: '30 minutes ago' },
    { id: 3, title: 'Payment Completed', message: 'Payment of ₹18,200 for sugarcane procurement has been credited.', type: 'payment', isRead: true, createdAt: '6 days ago' },
    { id: 4, title: 'Queue Delay', message: 'Thanjavur Centre is experiencing a 15-minute delay due to equipment maintenance.', type: 'alert', isRead: true, createdAt: '1 week ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{t('notifications')}</h1>
        <p className="page-subtitle">Stay updated on your procurement journey</p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t('noNotifications')} description="You'll receive updates about your slot, queue, procurement, and payments here." />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const Icon = ICON_MAP[n.type] || Bell;
            return (
              <Card key={n.id} className={`${!n.isRead ? 'border-l-4 border-l-primary-600' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.type === 'alert' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary-100 dark:bg-primary-900/30'
                  }`}>
                    <Icon className={`w-5 h-5 ${n.type === 'alert' ? 'text-amber-600' : 'text-primary-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm ${!n.isRead ? 'font-semibold text-surface-900 dark:text-white' : 'font-medium text-surface-700 dark:text-surface-300'}`}>
                        {n.title}
                      </h3>
                      <span className="text-xs text-surface-400 flex-shrink-0">{n.createdAt}</span>
                    </div>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{n.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
