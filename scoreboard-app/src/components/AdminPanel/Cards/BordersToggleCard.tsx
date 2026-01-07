import { useEffect, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { BoundingBox } from 'react-bootstrap-icons';
import styles from './BordersToggleCard.module.scss';

interface BordersToggleCardProps {
  initial?: boolean;
  onToggle?: (enabled: boolean) => void;
}

const BordersToggleCard = ({
  initial = false,
  onToggle,
}: BordersToggleCardProps) => {
  const [enabled, setEnabled] = useState<boolean>(initial);

  // Keep local state in sync when parent updates `initial` (controlled usage)
  useEffect(() => {
    setEnabled(initial);
  }, [initial]);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('scoreboard-show-borders');
    } else {
      document.body.classList.remove('scoreboard-show-borders');
    }
  }, [enabled]);

  useEffect(() => {
    if(typeof initial === 'boolean') {
      setEnabled(initial);
    }
  }, [initial]);

  return (
    <Card className={styles.bordersToggleCard}>
      <div className={styles.cardHeader}>
        <BoundingBox color='#dc3545' size={22} />
        <span className={styles.cardTitle}>Container Borders</span>
      </div>
      <div className='d-flex align-items-center justify-content-center'>
        <div className='d-flex flex-column'>
          <small className='text-secondary'>
            Показать/скрыть вспомогательные границы
          </small>
        </div>
        <Form.Check
          type='switch'
          id='toggle-scoreboard-borders'
          className='ms-3'
          checked={enabled}
          onChange={e => {
            const next = e.target.checked;
            setEnabled(next);
            if (onToggle) onToggle(next);
          }}
        />
      </div>
    </Card>
  );
};

export default BordersToggleCard;
