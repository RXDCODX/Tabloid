import { useEffect } from 'react';
import { Scoreboard, useConnection } from '../../providers/SignalRProvider';
import { useAdminStore } from '../../store/adminStateStore';
import type { ScoreboardState } from '../../types/types';

const AdminStateSignalRSync = () => {
  console.log('[AdminStateSignalRSync] Render');

  const connection = useConnection();
  console.log('[AdminStateSignalRSync] Connection:', connection?.state);

  useEffect(() => {
    console.log('[AdminStateSignalRSync] Connection changed in store effect');
    useAdminStore.getState().setConnection(connection);
    return () => {
      // ensure we clear stale connection
      useAdminStore.getState().setConnection(null);
    };
  }, [connection]);

  useEffect(() => {
    if (!connection || connection.state !== 'Connected') return;

    // Hydrate initial state (in case the server doesn't push it automatically)
    connection.invoke('GetState').catch(() => {
      /* ignore */
    });
  }, [connection]);

  const handleReceiveState = (state: ScoreboardState) => {
    console.log('[AdminStateSignalRSync] SignalR ReceiveState', state);
    useAdminStore.getState().applyRemoteState(state);
  };

  // Подписка на SignalR события
  Scoreboard.useSignalREffect('ReceiveState', handleReceiveState, []);

  return null;
};

export default AdminStateSignalRSync;
