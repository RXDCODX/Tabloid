import { memo } from 'react';
import { Form } from 'react-bootstrap';
import { useAdminPanelVisibilityStore } from '../../../store/adminPanelVisibilityStore';
import styles from './Sidebar.module.scss';

const Sidebar = () => {
  const { cardVisibility, toggleCard, showAll, hideAll } =
    useAdminPanelVisibilityStore();

  const cards = [
    { key: 'visibility' as const, label: 'Visibility Panel' },
    { key: 'meta' as const, label: 'Meta Info' },
    { key: 'colorPreset' as const, label: 'Color Presets' },
    { key: 'borders' as const, label: 'Borders Toggle' },
    { key: 'backgroundImages' as const, label: 'Background Images' },
    { key: 'fonts' as const, label: 'Fonts' },
    { key: 'layoutConfig' as const, label: 'Layout Config' },
    { key: 'players' as const, label: 'Players' },
    { key: 'commentators' as const, label: 'Commentators' },
  ];

  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.sidebarTrigger} />
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.header}>
            <h5 className={styles.title}>Panel Controls</h5>
          </div>

          <div className={styles.actions}>
            <button className={styles.btn} onClick={showAll}>
              Show All
            </button>
            <button className={styles.btn} onClick={hideAll}>
              Hide All
            </button>
          </div>

          <div className={styles.cardList}>
            {cards.map(card => (
              <div key={card.key} className={styles.cardItem}>
                <Form.Check
                  type='switch'
                  id={`switch-${card.key}`}
                  label={card.label}
                  checked={cardVisibility[card.key]}
                  onChange={() => toggleCard(card.key)}
                  className={styles.switch}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);
