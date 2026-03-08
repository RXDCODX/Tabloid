import { memo, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { CardKey } from '../../store/adminPanelVisibilityStore';
import { useAdminPanelVisibilityStore } from '../../store/adminPanelVisibilityStore';
import { useAdminStore } from '../../store/adminStateStore';
import styles from './AdminPanel.module.scss';
import BackgroundImagesCard from './Cards/BackgroundImagesCard';
import BordersToggleCard from './Cards/BordersToggleCard';
import ColorPresetCard from './Cards/ColorPresetCard';
import CommentatorsCard from './Cards/CommentatorsCard';
import FontsCard from './Cards/FontsCard';
import LayoutConfigCard from './Cards/LayoutConfigCard';
import MetaPanel from './Cards/MetaPanel';
import PlayerCard from './Cards/PlayerCard';
import VisibilityCard from './Cards/VisibilityCard';
import Sidebar from './Sidebar/Sidebar';

import ActionButtons from './UI/ActionButtons';

const AdminPanel = () => {
  console.log('[AdminPanel] Render');

  const { cardVisibility, cardOrder } = useAdminPanelVisibilityStore();
  const displayMode = useAdminStore(s => s.displayMode);
  const setDisplayMode = useAdminStore(s => s.setDisplayMode);

  // Редирект на админку при открытии с телефона
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      navigate('/admin');
    }
  }, [navigate]);
  // presets are requested via SignalR when needed by individual controls

  // swap names handled inside ActionButtons now

  const renderPlayersRow = (key: string) => {
    return (
      <Row key={key} className='justify-content-center align-items-center'>
        <Col
          xs={12}
          md={5}
          lg={4}
          className='d-flex justify-content-center mb-3 mb-md-0'
        >
          <PlayerCard label='Player 1' playerNumber={1} accent='#0dcaf0' />
        </Col>
        <Col
          xs={12}
          md={2}
          lg={2}
          className='d-flex flex-column align-items-center justify-content-center gap-3 mb-3 mb-md-0 mx-2'
        >
          <ActionButtons />
        </Col>
        <Col
          xs={12}
          md={5}
          lg={4}
          className='d-flex justify-content-center mb-3 mb-md-0'
        >
          <PlayerCard label='Player 2' playerNumber={2} accent='#6610f2' />
        </Col>
      </Row>
    );
  };

  // Рендер для каждого типа карточки
  const renderCard = (cardKey: CardKey) => {
    if (!cardVisibility[cardKey]) return null;

    switch (cardKey) {
      case 'visibility':
      case 'meta':
        // Эти карточки рендерятся вместе
        return null;

      case 'players':
        return renderPlayersRow(cardKey);

      case 'colorPreset':
        return <ColorPresetCard key={cardKey} />;

      case 'borders':
        return (
          <Row key={cardKey}>
            <Col xs={12}>
              <BordersToggleCard />
            </Col>
          </Row>
        );

      case 'backgroundImages':
        return <BackgroundImagesCard key={cardKey} />;

      case 'fonts':
        return <FontsCard key={cardKey} />;

      case 'layoutConfig':
        return <LayoutConfigCard key={cardKey} />;

      case 'commentators':
        return <CommentatorsCard key={cardKey} />;

      default:
        return null;
    }
  };

  // Рендер Visibility и Meta панелей (всегда вместе)
  const renderVisibilityAndMeta = () => {
    if (!cardVisibility.visibility && !cardVisibility.meta) return null;

    return (
      <Row>
        {cardVisibility.visibility && (
          <Col
            xs={12}
            md={cardVisibility.meta ? 6 : 12}
            lg={cardVisibility.meta ? 6 : 12}
          >
            <VisibilityCard />
          </Col>
        )}
        {cardVisibility.meta && (
          <Col
            xs={12}
            md={cardVisibility.visibility ? 6 : 12}
            lg={cardVisibility.visibility ? 6 : 12}
          >
            <MetaPanel />
          </Col>
        )}
      </Row>
    );
  };

  const renderSimpleModeCards = () => {
    return (
      <>
        <Row>
          <Col xs={12} md={6} lg={6}>
            <VisibilityCard />
          </Col>
          <Col xs={12} md={6} lg={6}>
            <MetaPanel />
          </Col>
        </Row>
        {renderPlayersRow('simple-players')}
        <ColorPresetCard />
      </>
    );
  };

  return (
    <>
      {displayMode === 'advanced' && <Sidebar />}
      <Container className={`py-4 admin-panel ${styles.adminPanel}`}>
        <Row>
          <Col xs={12}>
            <div className={styles.modeSwitchRow}>
              <div className={styles.modeSwitchButtons}>
                <button
                  type='button'
                  className={`${styles.modeButton} ${
                    displayMode === 'simple' ? styles.activeMode : ''
                  }`}
                  onClick={() => setDisplayMode('simple')}
                >
                  Простой
                </button>
                <button
                  type='button'
                  className={`${styles.modeButton} ${
                    displayMode === 'advanced' ? styles.activeMode : ''
                  }`}
                  onClick={() => setDisplayMode('advanced')}
                >
                  Опытный
                </button>
              </div>
              <p className={styles.modeHint}>
                {displayMode === 'simple'
                  ? 'Быстрые настройки: игроки, счет, заголовок трансляции и цвета.'
                  : 'Опытный режим: полный контроль макета, шрифтов, медиа и дополнительных блоков.'}
              </p>
            </div>
          </Col>
        </Row>

        {displayMode === 'simple' ? (
          renderSimpleModeCards()
        ) : (
          <>
            {/* Visibility и Meta всегда первыми */}
            {renderVisibilityAndMeta()}

            {/* Остальные карточки в порядке из cardOrder */}
            {cardOrder
              .filter(key => key !== 'visibility' && key !== 'meta')
              .map(cardKey => renderCard(cardKey))}
          </>
        )}
      </Container>
      <style>
        {` 
      body {
        background-color: #000;
      }
      `}
      </style>
    </>
  );
};

export default memo(AdminPanel);
