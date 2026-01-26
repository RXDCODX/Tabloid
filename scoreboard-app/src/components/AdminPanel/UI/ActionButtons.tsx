import React, { memo, useCallback } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { ArrowLeftRight, ArrowRepeat } from 'react-bootstrap-icons';
import { useConnection } from '../../../providers/SignalRProvider';
import { useAdminStore } from '../../../store/adminStateStore';
import styles from './ActionButtons.module.scss';

const ActionButtons: React.FC = () => {
  console.log('[ActionButtons] Render');

  const connection = useConnection();
  console.log('[ActionButtons] Connection:', connection?.state);

  const handleSwapNames = useCallback(async () => {
    const { player1, player2, setPlayer1, setPlayer2 } =
      useAdminStore.getState();
    if (!connection || connection.state !== 'Connected') {
      // fallback to local swap
      setPlayer1({ ...player1, name: player2.name });
      setPlayer2({ ...player2, name: player1.name });
      return;
    }
    try {
      await connection.invoke('UpdatePlayer1', {
        ...player1,
        name: player2.name,
      });
      await connection.invoke('UpdatePlayer2', {
        ...player2,
        name: player1.name,
      });
    } catch (e) {
      console.error('Swap names failed:', e);
    }
  }, [connection]);

  const handleSwapPlayers = useCallback(() => {
    useAdminStore.getState().swapPlayers();
  }, []);

  const handleReset = useCallback(() => {
    useAdminStore.getState().reset();
  }, []);

  return (
    <Stack
      gap={3}
      className={`${styles.actionButtons} w-100 w-md-auto align-items-center`}
    >
      <Button
        variant='info'
        className={`${styles.actionButton} ${styles.swapButton} fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container`}
        onClick={handleSwapNames}
        title='Поменять имена'
      >
        <ArrowLeftRight /> Name
      </Button>
      <Button
        variant='info'
        className={`${styles.actionButton} ${styles.swapButton} fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container`}
        onClick={handleSwapPlayers}
        title='Поменять игроков местами'
      >
        <ArrowLeftRight /> All
      </Button>
      <Button
        variant='danger'
        className={`${styles.actionButton} ${styles.resetButton} fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container`}
        onClick={handleReset}
        title='Сбросить всё'
      >
        <ArrowRepeat /> Reset
      </Button>
    </Stack>
  );
};

export default memo(ActionButtons);
