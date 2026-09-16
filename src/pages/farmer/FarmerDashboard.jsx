import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  Hash, Users, Clock, MapPin, CalendarCheck, Truck, 
  CreditCard, CloudSun, Bell, TrendingUp, ArrowRight
} from 'lucide-react';

export default function FarmerDashboard() {
  const { t } = useLanguage();

  // Placeholder data — will be replaced with real Supabase data
  const dashboardData = {
    token: { current: '024', total: '128', status: 'WAITING' },
    farmersAhead: 12,
    estimatedWait: 31,
    recommendedArrival: '10:35 AM',
    centre: { name: 'Thanjavur Procurement Centre', status: 'OPEN', queue: 45, counters: 3 },
    slot: { date: '2026-09-17', time: '10:00 AM', status: 'BOOKED' },
    procurement: { status: 'QUALITY_CHECK', step: 3, totalSteps: 7 },
    payment: { amount: '₹24,500', status: 'PENDING' },
    weather: { temp: '32°C', condition: 'Partly Cloudy', rain: '20%' },
  };

  return (
    <div className="space-y-6">
      {/* Top Row — Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Token Card */}
        <Card className="col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('tokenNumber')}</p>
              <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">#{dashboardData.token.current}</p>
              <p className="text-xs text-surface-400 mt-0.5">/ #{dashboardData.token.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Hash className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-3">
            <StatusBadge status={dashboardData.token.status} />
          </div>
        </Card>

        {/* Farmers Ahead */}
        <Card className="col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('farmersAhead')}</p>
              <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{dashboardData.farmersAhead}</p>
              <p className="text-xs text-surface-400 mt-0.5">farmers in queue</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        {/* Estimated Wait */}
        <Card className="col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('estimatedWait')}</p>
              <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{dashboardData.estimatedWait}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('minutes')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-600" />
            </div>
          </div>
        </Card>

        {/* Smart Arrival */}
        <Card className="col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('smartArrival')}</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{dashboardData.recommendedArrival}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('basedOnQueue')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Second Row — Centre + Slot */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Procurement Centre */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{t('procurementCentre')}</h3>
            <StatusBadge status={dashboardData.centre.status} />
          </div>
          <p className="text-lg font-bold text-surface-900 dark:text-white">{dashboardData.centre.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
              <Users className="w-4 h-4" />
              <span>Queue: {dashboardData.centre.queue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
              <MapPin className="w-4 h-4" />
              <span>{dashboardData.centre.counters} {t('activeCounters')}</span>
            </div>
          </div>
        </Card>

        {/* My Slot */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{t('mySlot')}</h3>
            <StatusBadge status={dashboardData.slot.status} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex flex-col items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-bold text-surface-900 dark:text-white">{dashboardData.slot.date}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">{dashboardData.slot.time}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Third Row — Procurement + Payment + Weather */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Procurement Status */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{t('procurement')}</h3>
            <StatusBadge status={dashboardData.procurement.status} />
          </div>
          <div className="space-y-2.5">
            {['SLOT_CONFIRMED', 'FARMER_ARRIVED', 'QUALITY_CHECK', 'WEIGHT_VERIFICATION', 'ACCEPTED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED'].map((stage, i) => {
              const isCompleted = i < dashboardData.procurement.step;
              const isCurrent = i === dashboardData.procurement.step;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isCompleted ? 'bg-primary-600' : isCurrent ? 'bg-primary-600 ring-2 ring-primary-200 dark:ring-primary-800' : 'bg-surface-200 dark:bg-surface-600'
                  }`} />
                  <span className={`text-xs ${
                    isCompleted || isCurrent ? 'text-surface-900 dark:text-white font-medium' : 'text-surface-400'
                  }`}>
                    {t(stage.charAt(0).toLowerCase() + stage.slice(1).replace(/_([A-Z])/g, (_, c) => c.toUpperCase()).replace(/_/g, '')
                      .replace(/([A-Z])/g, ' $1').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
                      .replace(/([a-z])([A-Z])/g, '$1 $2')
                    ) || stage.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Payment */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{t('payment')}</h3>
            <StatusBadge status={dashboardData.payment.status} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardData.payment.amount}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Procurement Payment</p>
            </div>
          </div>
        </Card>

        {/* Weather */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{t('weather')}</h3>
            <CloudSun className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardData.weather.temp}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">{dashboardData.weather.condition}</p>
            <p className="text-xs text-surface-400 mt-1">{t('rainProbability')}: {dashboardData.weather.rain}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
