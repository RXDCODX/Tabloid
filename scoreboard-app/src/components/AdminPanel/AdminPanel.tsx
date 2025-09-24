import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ActionButtons from './UI/ActionButtons';
import ColorPresetCard from './Cards/ColorPresetCard';
import MetaPanel from './Cards/MetaPanel';
import PlayerCard from './Cards/PlayerCard';
import VisibilityCard from './Cards/VisibilityCard';
import BackgroundImagesCard from './Cards/BackgroundImagesCard';
import BordersToggleCard from './Cards/BordersToggleCard';
import LayoutConfigCard from './Cards/LayoutConfigCard';
import { useAdminState } from '../../hooks/useAdminState';
import styles from './AdminPanel.module.scss';
import { playerPresetRepository } from './services/PlayerPresetService';

const AdminPanel = () => {
  const {
    player1,
    player2,
    meta,
    isVisible,
    animationDuration,
    backgroundImages,
    layoutConfig,
    setPlayer1,
    setPlayer2,
    setMeta,
    setVisibility,
    setAnimationDuration,
    setBackgroundImages,
    setLayoutConfig,
    swapPlayers,
    reset,
    handleColorChange,
  } = useAdminState();

  // Редирект на админку при открытии с телефона
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      navigate('/admin');
    }
  }, [navigate]);

  // Load presets once on admin panel mount
  useEffect(() => {
    playerPresetRepository.load?.();
  }, []);

  const handleSwapNames = () => {
    setPlayer1({ ...player1, name: player2.name });
    setPlayer2({ ...player2, name: player1.name });
  };

  return (
    <Container className={`py-4 admin-panel ${styles.adminPanel}`}>
      {/* Visibility Panel и Meta Panel в один ряд с одинаковой шириной */}
      <Row className="mb-4">
        <Col xs={12} md={6} lg={6}>
          <VisibilityCard
            isVisible={isVisible}
            onVisibilityChange={setVisibility}
            animationDuration={animationDuration} // Настраиваемое время анимации (800мс)
            onAnimationDurationChange={setAnimationDuration} // Callback для изменения времени анимации
          />
        </Col>
        <Col xs={12} md={6} lg={6}>
          <MetaPanel setMeta={setMeta} meta={meta} />
        </Col>
      </Row>

      {/* Color Preset Panel */}
      <ColorPresetCard onColorChange={handleColorChange} />

      {/* Borders Toggle */}
      <Row className="mb-4">
        <Col xs={12}>
          <BordersToggleCard />
        </Col>
      </Row>

      {/* Background Images Panel */}
      <BackgroundImagesCard 
        backgroundImages={backgroundImages}
        onBackgroundImagesChange={setBackgroundImages}
      />

      {/* Layout Config Panel */}
      <LayoutConfigCard
        layoutConfig={layoutConfig}
        onChange={setLayoutConfig}
      />

      {/* Players Cards */}
      <Row className="justify-content-center align-items-center g-4">
        <Col
          xs={12}
          md={5}
          lg={4}
          className="d-flex justify-content-center mb-3 mb-md-0"
        >
          <PlayerCard
            player={player1}
            onName={(name) => setPlayer1({ ...player1, name })}
            onSponsor={(sponsor) => setPlayer1({ ...player1, sponsor })}
            onScore={(score) =>
              setPlayer1({
                ...player1,
                score: Math.max(0, Math.min(99, score)),
              })
            }
            onWin={() => setPlayer1({ ...player1, final: 'winner' })}
            onLose={() => setPlayer1({ ...player1, final: 'loser' })}
            onTag={(tag) => setPlayer1({ ...player1, tag })}
            onFlag={(flag) => setPlayer1({ ...player1, flag })}
            onClearFinal={() => setPlayer1({ ...player1, final: 'none' })}
            label="Player 1"
            accent="#0dcaf0"
          />
        </Col>
        <Col
          xs={12}
          md={2}
          lg={2}
          className="d-flex flex-column align-items-center justify-content-center gap-3 mb-3 mb-md-0 mx-2"
        >
          <ActionButtons
            onSwapNames={handleSwapNames}
            onSwapPlayers={swapPlayers}
            onReset={reset}
          />
        </Col>
        <Col
          xs={12}
          md={5}
          lg={4}
          className="d-flex justify-content-center mb-3 mb-md-0"
        >
          <PlayerCard
            player={player2}
            onName={(name) => setPlayer2({ ...player2, name })}
            onSponsor={(sponsor) => setPlayer2({ ...player2, sponsor })}
            onScore={(score) =>
              setPlayer2({
                ...player2,
                score: Math.max(0, Math.min(99, score)),
              })
            }
            onWin={() => setPlayer2({ ...player2, final: 'winner' })}
            onLose={() => setPlayer2({ ...player2, final: 'loser' })}
            onTag={(tag) => setPlayer2({ ...player2, tag })}
            onFlag={(flag) => setPlayer2({ ...player2, flag })}
            onClearFinal={() => setPlayer2({ ...player2, final: 'none' })}
            label="Player 2"
            accent="#6610f2"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;