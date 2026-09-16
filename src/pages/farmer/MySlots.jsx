import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { CalendarCheck, Plus, Clock, MapPin, X, RefreshCw } from 'lucide-react';

export default function MySlots() {
  const { t } = useLanguage();

  const slots = [
    { id: 1, date: '2026-09-17', startTime: '10:00 AM', endTime: '10:30 AM', centre: 'Thanjavur Procurement Centre', status: 'BOOKED' },
    { id: 2, date: '2026-09-15', startTime: '09:00 AM', endTime: '09:30 AM', centre: 'Kumbakonam Procurement Centre', status: 'COMPLETED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('mySlot')}</h1>
          <p className="page-subtitle">Manage your procurement slot bookings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" /> {t('bookSlot')}
        </Button>
      </div>

      {slots.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={t('noActiveSlot')}
          description="Book a slot to get your queue token and track your procurement."
          action={<Button><Plus className="w-4 h-4" /> {t('bookSlot')}</Button>}
        />
      ) : (
        <div className="space-y-4">
          {slots.map(slot => (
            <Card key={slot.id}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex flex-col items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-bold text-surface-900 dark:text-white">{slot.date}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {slot.startTime} — {slot.endTime}
                    </p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {slot.centre}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={slot.status} />
                  {slot.status === 'BOOKED' && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm"><RefreshCw className="w-3.5 h-3.5" /> {t('reschedule')}</Button>
                      <Button variant="ghost" size="sm" className="text-red-600"><X className="w-3.5 h-3.5" /> {t('cancel')}</Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
