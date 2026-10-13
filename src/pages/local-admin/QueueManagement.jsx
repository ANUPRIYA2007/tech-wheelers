import React from 'react';
import { useOutletContext } from 'react-router-dom';
import useLiveQueue from '../../hooks/useLiveQueue';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { UserCheck, ArrowRight } from 'lucide-react';

export default function QueueManagement() {
  const outletCtx = useOutletContext();
  const centreId = outletCtx?.centreId || 'c0000000-0000-0000-0000-000000000001';
  const { queue: liveQueue, loading, callNextToken, updateTokenStatus } = useLiveQueue(centreId);

  const queueItems = (liveQueue || []).map(item => ({
    token: item.id,
    tokenId: item.tokenId,
    farmer: item.name,
    status: item.status,
    time: item.arrived || item.scheduled || 'Just now',
    counter: item.counter,
    crop: item.crop,
  }));

  const handleCallNext = async () => {
    await callNextToken(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Queue Management</h1>
          <p className="page-subtitle">Manage the live procurement queue in real-time</p>
        </div>
        <Button onClick={handleCallNext} disabled={loading || queueItems.filter(q => q.status === 'WAITING').length === 0}>
          <UserCheck className="w-4 h-4" /> Call Next Farmer
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-400">
          <p>Loading live queue tokens...</p>
        </div>
      ) : queueItems.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-surface-400">
            <p className="text-base font-semibold text-surface-600 dark:text-surface-300">No Farmers in Queue</p>
            <p className="text-xs mt-1">When farmers book slots or check in at this centre, their tokens will appear here live.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {queueItems.map(q => (
            <Card key={q.tokenId || q.token}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary-600">{q.token}</div>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white">{q.farmer}</p>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <span>{q.time}</span>
                      {q.crop && <span>• {q.crop}</span>}
                      {q.counter && <span className="font-semibold text-emerald-600">• {q.counter}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={q.status} />
                  {q.status === 'WAITING' && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => q.tokenId && updateTokenStatus(q.tokenId, 'CALLED', 1)}
                    >
                      Process <ArrowRight className="w-3 h-3" />
                    </Button>
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

