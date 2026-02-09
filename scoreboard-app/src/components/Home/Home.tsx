import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../store/adminStateStore';
import styles from './Home.module.scss';

export const Home = () => {
  const navigate = useNavigate();
  const state = useAdminStore(
    useShallow(s => ({
      player1: s.player1,
      player2: s.player2,
      meta: s.meta,
      colors: s.colors,
      textConfig: s.textConfig,
      backgroundImages: s.backgroundImages,
      layoutConfig: s.layoutConfig,
      fontConfig: s.fontConfig,
      isVisible: s.isVisible,
      isShowBorders: s.isShowBorders,
      animationDuration: s.animationDuration,
    }))
  );

  const displayed = useMemo(() => JSON.stringify(state, null, 2), [state]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Scoreboard Application</h1>

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.navButton} ${styles.scoreboardButton}`}
            onClick={() => navigate('/scoreboard')}
          >
            Scoreboard
          </button>
          <button
            className={`${styles.navButton} ${styles.adminButton}`}
            onClick={() => navigate('/adminpanel')}
          >
            Admin Panel
          </button>
        </div>

        <div className={styles.stateContainer}>
          <h2 className={styles.stateTitle}>Current State (SignalR)</h2>
          <pre className={styles.stateJson}>{displayed}</pre>
        </div>
      </div>
    </div>
  );
};
