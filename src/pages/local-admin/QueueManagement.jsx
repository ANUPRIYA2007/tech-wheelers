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

  const defaultQueue = [
    { token: '#101', farmer: 'Ramesh Kumar', status: 'IN_PROCESSING', time: '09:45 AM' },
    { token: '#102', farmer: 'Selvi M.', status: 'WAITING', time: '09:50 AM' },
    { token: '#103', farmer: 'Kumar S.', status: 'WAITING', time: '09:55 AM' },
  ];

  const queueItems = liveQueue && liveQueue.length > 0 ? liveQueue.map(item => ({
    token: item.id,
    tokenId: item.tokenId,
    farmer: item.name,
    status: item.status,
    time: item.arrived || item.scheduled,
  })) : defaultQueue;

  const handleCallNext = async () => {
    await callNextToken(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Queue Management</h1>
          <p className="page-subtitle">Manage the live procurement queue</p>
        </div>
        <Button onClick={handleCallNext}><UserCheck className="w-4 h-4" /> Call Next Farmer</Button>
      </div>
      <div className="space-y-3">
        {queueItems.map(q => (
          <Card key={q.token}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary-600">{q.token}</div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">{q.farmer}</p>
                  <p className="text-xs text-surface-400">{q.time}</p>
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
    </div>
  );
}

