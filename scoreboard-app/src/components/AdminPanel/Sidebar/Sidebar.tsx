import { memo, useState } from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import type { CardKey } from '../../../store/adminPanelVisibilityStore';
import { useAdminPanelVisibilityStore } from '../../../store/adminPanelVisibilityStore';
import styles from './Sidebar.module.scss';

const Sidebar = () => {
  const {
    cardVisibility,
    toggleCard,
    showAll,
    hideAll,
    cardOrder,
    reorderCards,
  } = useAdminPanelVisibilityStore();

  const [draggedItem, setDraggedItem] = useState<CardKey | null>(null);
  const [dragOverItem, setDragOverItem] = useState<CardKey | null>(null);

  const cardLabels: Record<CardKey, string> = {
    visibility: 'Visibility Panel',
    meta: 'Meta Info',
    colorPreset: 'Color Presets',
    borders: 'Borders Toggle',
    backgroundImages: 'Background Images',
    fonts: 'Fonts',
    layoutConfig: 'Layout Config',
    players: 'Players',
    commentators: 'Commentators',
  };

  // Группируем visibility и meta как locked группу
  const lockedGroup: CardKey[] = ['visibility', 'meta'];
  const draggableCards = cardOrder.filter(key => !lockedGroup.includes(key));

  const handleDragStart = (e: React.DragEvent, cardKey: CardKey) => {
    if (lockedGroup.includes(cardKey)) {
      e.preventDefault();
      return;
    }
    setDraggedItem(cardKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, cardKey: CardKey) => {
    e.preventDefault();
    if (lockedGroup.includes(cardKey) || draggedItem === cardKey) return;
    setDragOverItem(cardKey);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetKey: CardKey) => {
    e.preventDefault();
    if (
      !draggedItem ||
      lockedGroup.includes(targetKey) ||
      draggedItem === targetKey
    ) {
      setDragOverItem(null);
      return;
    }

    const newOrder = [...cardOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetKey);

    // Удаляем draggedItem и вставляем его на новое место
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    reorderCards(newOrder);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const renderLockedGroup = () => {
    const tooltip = (
      <Tooltip id='locked-tooltip'>
        Эти панели всегда отображаются вместе и не могут быть перемещены
      </Tooltip>
    );

    return (
      <OverlayTrigger placement='right' overlay={tooltip}>
        <div className={styles.lockedGroup}>
          {lockedGroup.map(key => (
            <div key={key} className={styles.lockedItem}>
              <Form.Check
                type='switch'
                id={`switch-${key}`}
                label={cardLabels[key]}
                checked={cardVisibility[key]}
                onChange={() => toggleCard(key)}
                className={styles.switch}
              />
            </div>
          ))}
        </div>
      </OverlayTrigger>
    );
  };

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
            {/* Locked группа (visibility и meta) */}
            {renderLockedGroup()}

            {/* Draggable карточки */}
            {draggableCards.map(key => (
              <div
                key={key}
                className={`${styles.cardItem} ${
                  draggedItem === key ? styles.dragging : ''
                } ${dragOverItem === key ? styles.dragOver : ''}`}
                draggable={true}
                onDragStart={e => handleDragStart(e, key)}
                onDragOver={e => handleDragOver(e, key)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, key)}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.dragHandle}>⋮⋮</div>
                <Form.Check
                  type='switch'
                  id={`switch-${key}`}
                  label={cardLabels[key]}
                  checked={cardVisibility[key]}
                  onChange={() => toggleCard(key)}
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
