import { memo, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPanel.module.scss';
import BackgroundImagesCard from './Cards/BackgroundImagesCard';
import BordersToggleCard from './Cards/BordersToggleCard';
import ColorPresetCard from './Cards/ColorPresetCard';
import FontsCard from './Cards/FontsCard';
import LayoutConfigCard from './Cards/LayoutConfigCard';
import MetaPanel from './Cards/MetaPanel';
import PlayerCard from './Cards/PlayerCard';
import VisibilityCard from './Cards/VisibilityCard';

import ActionButtons from './UI/ActionButtons';

const AdminPanel = () => {
  console.log('[AdminPanel] Render');

  // Редирект на админку при открытии с телефона
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      navigate('/admin');
    }
  }, [navigate]);
  // presets are requested via SignalR when needed by individual controls

  // swap names handled inside ActionButtons now

  return (
    <>
      <Container className={`py-4 admin-panel ${styles.adminPanel}`}>
        {/* Visibility Panel и Meta Panel в один ряд с одинаковой шириной */}
        <Row className='mb-4'>
          <Col xs={12} md={6} lg={6}>
            <VisibilityCard />
          </Col>
          <Col xs={12} md={6} lg={6}>
            <MetaPanel />
          </Col>
        </Row>

        {/* Color Preset Panel */}
        <ColorPresetCard />

        {/* Borders Toggle */}
        <Row className='mb-4'>
          <Col xs={12}>
            <BordersToggleCard />
          </Col>
        </Row>

        {/* Background Images Panel */}
        <BackgroundImagesCard />

        {/* Fonts Panel */}
        <FontsCard />

        {/* Layout Config Panel */}
        <LayoutConfigCard />

        {/* Players Cards */}
        <Row className='justify-content-center align-items-center g-4'>
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
