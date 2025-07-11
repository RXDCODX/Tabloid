import React, { useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';

interface Player {
  name: string;
  sponsor: string;
  score: number;
}

const defaultPlayer1: Player = { name: 'Player 1', sponsor: '', score: 0 };
const defaultPlayer2: Player = { name: 'Player 2', sponsor: '', score: 0 };

const Players: React.FC = () => {
  const [player1, setPlayer1] = useState<Player>(defaultPlayer1);
  const [player2, setPlayer2] = useState<Player>(defaultPlayer2);

  // Инкремент/декремент/сброс для счёта
  const increment = (side: 'left' | 'right') => {
    if (side === 'left') setPlayer1(p => ({ ...p, score: Math.min(p.score + 1, 5) }));
    else setPlayer2(p => ({ ...p, score: Math.min(p.score + 1, 5) }));
  };
  const decrement = (side: 'left' | 'right') => {
    if (side === 'left') setPlayer1(p => ({ ...p, score: Math.max(p.score - 1, 0) }));
    else setPlayer2(p => ({ ...p, score: Math.max(p.score - 1, 0) }));
  };
  const zeroing = (side: 'left' | 'right') => {
    if (side === 'left') setPlayer1(p => ({ ...p, score: 0 }));
    else setPlayer2(p => ({ ...p, score: 0 }));
  };
  // Свап имён
  const swapNames = () => {
    setPlayer1(p => ({ ...p, name: player2.name }));
    setPlayer2(p => ({ ...p, name: player1.name }));
  };
  // Свап игроков полностью
  const swapPlayers = () => {
    const p1 = { ...player1 };
    setPlayer1(player2);
    setPlayer2(p1);
  };
  // Сброс обоих игроков
  const reset = () => {
    setPlayer1(defaultPlayer1);
    setPlayer2(defaultPlayer2);
  };

  return (
    <Container fluid className="bg-dark rounded-4 shadow-lg py-4 px-3" style={{ maxWidth: '100vw', marginTop: 32 }}>
      {/* Первая строка: поля игроков */}
      <Row className="align-items-center mb-2">
        <Col xs={5} className="d-flex align-items-center gap-2">
          <span style={{ fontSize: 20, color: '#a78bfa' }}>👤</span>
          <Form.Control placeholder="Sponsor" value={player1.sponsor} onChange={e => setPlayer1(p => ({ ...p, sponsor: e.target.value }))} size="sm" className="bg-secondary text-white fw-normal" style={{ maxWidth: 120 }} />
          <Form.Control placeholder="Name" value={player1.name} onChange={e => setPlayer1(p => ({ ...p, name: e.target.value }))} size="sm" className="bg-secondary text-white fw-bold" style={{ maxWidth: 120 }} />
        </Col>
        <Col xs={2}></Col>
        <Col xs={5} className="d-flex align-items-center gap-2 justify-content-end">
          <span style={{ fontSize: 20, color: '#a78bfa' }}>👤</span>
          <Form.Control placeholder="Sponsor" value={player2.sponsor} onChange={e => setPlayer2(p => ({ ...p, sponsor: e.target.value }))} size="sm" className="bg-secondary text-white fw-normal" style={{ maxWidth: 120 }} />
          <Form.Control placeholder="Name" value={player2.name} onChange={e => setPlayer2(p => ({ ...p, name: e.target.value }))} size="sm" className="bg-secondary text-white fw-bold" style={{ maxWidth: 120 }} />
        </Col>
      </Row>
      {/* Вторая строка: счетчики и кнопки управления */}
      <Row className="align-items-center mb-2">
        <Col xs={5} className="d-flex align-items-center gap-2">
          <InputGroup size="sm" style={{ width: 120 }}>
            <Form.Control value={player1.score} readOnly className="text-center bg-black text-white fw-bold" style={{ width: 38, fontSize: 22 }} />
            <Button variant="dark" size="sm" onClick={() => increment('left')}>▲</Button>
            <Button variant="dark" size="sm" onClick={() => zeroing('left')}>⟳</Button>
            <Button variant="dark" size="sm" onClick={() => decrement('left')}>▼</Button>
          </InputGroup>
        </Col>
        <Col xs={2} className="d-flex justify-content-center gap-2">
          <Button variant="secondary" size="sm" onClick={swapNames}>⇄ Name</Button>
          <Button variant="secondary" size="sm" onClick={swapPlayers}>⇄ All</Button>
          <Button variant="secondary" size="sm" onClick={reset}>⟳ Reset</Button>
        </Col>
        <Col xs={5} className="d-flex align-items-center gap-2 justify-content-end">
          <InputGroup size="sm" style={{ width: 120 }}>
            <Form.Control value={player2.score} readOnly className="text-center bg-black text-white fw-bold" style={{ width: 38, fontSize: 22 }} />
            <Button variant="dark" size="sm" onClick={() => increment('right')}>▲</Button>
            <Button variant="dark" size="sm" onClick={() => zeroing('right')}>⟳</Button>
            <Button variant="dark" size="sm" onClick={() => decrement('right')}>▼</Button>
          </InputGroup>
        </Col>
      </Row>
      {/* Третья строка: W/L */}
      <Row className="align-items-center">
        <Col xs={5} className="d-flex gap-2">
          <Button variant="primary" size="sm" className="fw-bold">W</Button>
          <Button variant="primary" size="sm" className="fw-bold">L</Button>
        </Col>
        <Col xs={2}></Col>
        <Col xs={5} className="d-flex gap-2 justify-content-end">
          <Button variant="primary" size="sm" className="fw-bold">W</Button>
          <Button variant="primary" size="sm" className="fw-bold">L</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Players; 