import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import { Hash, Users, Clock, TrendingUp, Wifi, WifiOff } from 'lucide-react';

export default function MyQueue() {
  const { t } = useLanguage();
  const isConnected = true;

  const queue = {
    yourToken: '024',
    currentToken: '012',
    farmersAhead: 12,
    estimatedWait: 31,
    totalTokens: 128,
    progress: ((12 / 128) * 100),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('queue')}</h1>
          <p className="page-subtitle">Live queue tracking for your procurement centre</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Your Token</p>
          <p className="text-4xl font-bold text-primary-600 mt-2">#{queue.yourToken}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('currentToken')}</p>
          <p className="text-4xl font-bold text-surface-900 dark:text-white mt-2">#{queue.currentToken}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('farmersAhead')}</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">{queue.farmersAhead}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('estimatedWait')}</p>
          <p className="text-4xl font-bold text-sky-600 mt-2">{queue.estimatedWait}</p>
          <p className="text-xs text-surface-400">{t('minutes')}</p>
        </Card>
      </div>

      {/* Queue Progress */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">{t('queueProgress')}</h3>
        <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${100 - (queue.farmersAhead / queue.totalTokens) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-surface-500 dark:text-surface-400">
          <span>Token #{queue.currentToken}</span>
          <span>Your Token #{queue.yourToken}</span>
          <span>Total #{queue.totalTokens}</span>
        </div>
      </Card>

      {/* Smart Arrival Recommendation */}
      <Card className="border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">{t('recommendedArrival')}: 10:35 AM</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{t('basedOnQueue')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
