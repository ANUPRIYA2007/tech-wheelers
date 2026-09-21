import { useLanguage } from '../../context/LanguageContext';
import { useMyBookings } from '../../hooks/useMyBookings';
import { useLiveQueue } from '../../hooks/useLiveQueue';
import Card from '../../components/common/Card';
import { Hash, Users, Clock, TrendingUp, Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MyQueue() {
  const { t } = useLanguage();
  const { activeBooking, loading: bookingLoading } = useMyBookings();
  const centreId = activeBooking?.centre_id || 'c0000000-0000-0000-0000-000000000001';
  const { queue: liveCentreQueue, loading: queueLoading } = useLiveQueue(centreId);

  const isConnected = true;

  // Determine token stats from real database queue
  const yourTokenNum = activeBooking?.token_number || '#128';
  const tokenStatus = activeBooking?.token_status || activeBooking?.booking_status || 'WAITING';

  // Find currently called or processing token for this centre
  const activeServing = liveCentreQueue.find(q => q.status === 'CALLED' || q.status === 'IN_PROCESSING');
  const currentServingToken = activeServing?.id || '#101';

  // Calculate position
  const yourPos = activeBooking?.queue_position || (liveCentreQueue.findIndex(q => q.id === yourTokenNum || q.tokenId === activeBooking?.booking_id) + 1) || 1;
  const farmersAhead = Math.max(0, yourPos - 1);
  const estimatedWaitMins = farmersAhead * 15;
  const totalTokensCount = Math.max(liveCentreQueue.length, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('queue')}</h1>
          <p className="page-subtitle">Live queue tracking for {activeBooking?.centre_name || 'your procurement centre'}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
          isConnected 
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? t('liveQueueConnected') : t('liveQueueDisconnected')}
        </div>
      </div>

      {tokenStatus === 'CALLED' && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center gap-3 shadow-lg animate-bounce">
          <CheckCircle2 className="w-6 h-6" />
          <span>YOUR TOKEN HAS BEEN CALLED! Please proceed to Counter {activeBooking?.counter_number || 1} immediately.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Your Token</p>
          <p className="text-4xl font-bold text-primary-600 mt-2">{yourTokenNum}</p>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 mt-2">
            ● {tokenStatus}
          </span>
        </Card>
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('currentToken')}</p>
          <p className="text-4xl font-bold text-surface-900 dark:text-white mt-2">{currentServingToken}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('farmersAhead')}</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">{farmersAhead}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('estimatedWait')}</p>
          <p className="text-4xl font-bold text-sky-600 mt-2">{estimatedWaitMins}</p>
          <p className="text-xs text-surface-400">{t('minutes')}</p>
        </Card>
      </div>

      {/* Queue Progress */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">{t('queueProgress')}</h3>
        <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(10, (1 - farmersAhead / totalTokensCount) * 100))}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-surface-500 dark:text-surface-400">
          <span>Serving #{currentServingToken}</span>
          <span>Your Token {yourTokenNum}</span>
          <span>Queue Total #{totalTokensCount}</span>
        </div>
      </Card>

      {/* Smart Arrival Recommendation */}
      <Card className="border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">{t('recommendedArrival')}: {activeBooking?.start_time || '10:30 AM'}</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{t('basedOnQueue')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

