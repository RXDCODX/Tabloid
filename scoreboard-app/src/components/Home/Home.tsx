import { useNavigate } from 'react-router-dom';
import { useAdminState } from '../../hooks/useAdminState';
import styles from './Home.module.scss';

export const Home = () => {
  const navigate = useNavigate();
  const state = useAdminState();

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
          <pre className={styles.stateJson}>
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
