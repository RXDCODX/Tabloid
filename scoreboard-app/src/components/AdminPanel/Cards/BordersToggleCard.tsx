import { memo, useEffect, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { BoundingBox } from 'react-bootstrap-icons';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../../store/adminStateStore';
import styles from './BordersToggleCard.module.scss';

const BordersToggleCard = () => {
  const isShowBorders = useAdminStore(useShallow(s => s.isShowBorders));
  const [enabled, setEnabled] = useState<boolean>(!!isShowBorders);

  // Keep local state in sync when external state changes
  useEffect(() => {
    setEnabled(!!isShowBorders);
  }, [isShowBorders]);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('scoreboard-show-borders');
    } else {
      document.body.classList.remove('scoreboard-show-borders');
    }
  }, [enabled]);

  useEffect(() => {
    // no-op: handled above
  }, []);

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
            useAdminStore.getState().setShowBorders(next);
          }}
        />
      </div>
    </Card>
  );
};

export default memo(BordersToggleCard);
