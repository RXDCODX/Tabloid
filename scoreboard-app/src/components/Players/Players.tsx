import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { SignalRContext } from '../../providers/SignalRProvider';
import { Player, ScoreboardState } from '../../types/types';

const Players: React.FC = () => {
  const { connection } = useContext(SignalRContext);
  const [player1, setPlayer1] = useState<Player>({
    name: 'Player 1',
    sponsor: '',
    score: 0,
    tag: '',
    country: 'none',
    final: 'none',
  });
  const [player2, setPlayer2] = useState<Player>({
    name: 'Player 2',
    sponsor: '',
    score: 0,
    tag: '',
    country: 'none',
    final: 'none',
  });

  useEffect(() => {
    if (!connection) return;
    const handler = (state: ScoreboardState) => {
      console.log('SignalR ReceiveState (Players):', state);
      setPlayer1(state.player1);
      setPlayer2(state.player2);
    };
    connection.on('ReceiveState', handler);
    return () => {
      connection.off('ReceiveState', handler);
    };
  }, [connection]);

  const updatePlayer = useCallback(
    async (side: 'left' | 'right', updated: Player) => {
      if (!connection) return;
      const method = side === 'left' ? 'UpdatePlayer1' : 'UpdatePlayer2';
      try {
        await connection.invoke(method, updated);
      } catch (e) {
        console.error('Update player failed:', e);
      }
    },
    [connection]
  );

  const increment = useCallback(
    (side: 'left' | 'right') => {
      if (side === 'left') {
        updatePlayer('left', {
          ...player1,
          score: Math.min(player1.score + 1, 5),
        });
      } else {
        updatePlayer('right', {
          ...player2,
          score: Math.min(player2.score + 1, 5),
        });
      }
    },
    [player1, player2, updatePlayer]
  );

  const decrement = useCallback(
    (side: 'left' | 'right') => {
      if (side === 'left') {
        updatePlayer('left', {
          ...player1,
          score: Math.max(player1.score - 1, 0),
        });
      } else {
        updatePlayer('right', {
          ...player2,
          score: Math.max(player2.score - 1, 0),
        });
      }
    },
    [player1, player2, updatePlayer]
  );

  const zeroing = useCallback(
    (side: 'left' | 'right') => {
      if (side === 'left') {
        updatePlayer('left', { ...player1, score: 0 });
      } else {
        updatePlayer('right', { ...player2, score: 0 });
      }
    },
    [player1, player2, updatePlayer]
  );

  const swapNames = useCallback(() => {
    updatePlayer('left', { ...player1, name: player2.name });
    updatePlayer('right', { ...player2, name: player1.name });
  }, [player1, player2, updatePlayer]);

  const swapPlayers = useCallback(() => {
    updatePlayer('left', { ...player2 });
    updatePlayer('right', { ...player1 });
  }, [player1, player2, updatePlayer]);

  const reset = useCallback(async () => {
    if (!connection) return;
    try {
      await connection.invoke('ResetToDefault');
    } catch (e) {
      console.error('Reset failed:', e);
    }
  }, [connection]);

  return (
    <Container
      fluid
      className='bg-dark rounded-4 shadow-lg py-4 px-3'
      style={{ maxWidth: '100vw', marginTop: 32 }}
    >
      {/* Первая строка: поля игроков */}
      <Row className='align-items-center mb-2'>
        <Col xs={5} className='d-flex align-items-center gap-2'>
          <span style={{ fontSize: 20, color: '#a78bfa' }}>👤</span>
          <Form.Control
            placeholder='Sponsor'
            value={player1.sponsor}
            onChange={e =>
              updatePlayer('left', { ...player1, sponsor: e.target.value })
            }
            size='sm'
            className='bg-secondary text-white fw-normal'
            style={{ maxWidth: 120 }}
          />
          <Form.Control
            placeholder='Name'
            value={player1.name}
            onChange={e =>
              updatePlayer('left', { ...player1, name: e.target.value })
            }
            size='sm'
            className='bg-secondary text-white fw-bold'
            style={{ maxWidth: 120 }}
          />
        </Col>
        <Col xs={2}></Col>
        <Col
          xs={5}
          className='d-flex align-items-center gap-2 justify-content-end'
        >
          <span style={{ fontSize: 20, color: '#a78bfa' }}>👤</span>
          <Form.Control
            placeholder='Sponsor'
            value={player2.sponsor}
            onChange={e =>
              updatePlayer('right', { ...player2, sponsor: e.target.value })
            }
            size='sm'
            className='bg-secondary text-white fw-normal'
            style={{ maxWidth: 120 }}
          />
          <Form.Control
            placeholder='Name'
            value={player2.name}
            onChange={e =>
              updatePlayer('right', { ...player2, name: e.target.value })
            }
            size='sm'
            className='bg-secondary text-white fw-bold'
            style={{ maxWidth: 120 }}
          />
        </Col>
      </Row>
      {/* Вторая строка: счетчики и кнопки управления */}
      <Row className='align-items-center mb-2'>
        <Col xs={5} className='d-flex align-items-center gap-2'>
          <InputGroup size='sm' style={{ width: 120 }}>
            <Form.Control
              value={player1.score}
              readOnly
              className='text-center bg-black text-white fw-bold'
              style={{ width: 38, fontSize: 22 }}
            />
            <Button variant='dark' size='sm' onClick={() => increment('left')}>
              ▲
            </Button>
            <Button variant='dark' size='sm' onClick={() => zeroing('left')}>
              ⟳
            </Button>
            <Button variant='dark' size='sm' onClick={() => decrement('left')}>
              ▼
            </Button>
          </InputGroup>
        </Col>
        <Col xs={2} className='d-flex justify-content-center gap-2'>
          <Button variant='secondary' size='sm' onClick={swapNames}>
            ⇄ Name
          </Button>
          <Button variant='secondary' size='sm' onClick={swapPlayers}>
            ⇄ All
          </Button>
          <Button variant='secondary' size='sm' onClick={reset}>
            ⟳ Reset
          </Button>
        </Col>
        <Col
          xs={5}
          className='d-flex align-items-center gap-2 justify-content-end'
        >
          <InputGroup size='sm' style={{ width: 120 }}>
            <Form.Control
              value={player2.score}
              readOnly
              className='text-center bg-black text-white fw-bold'
              style={{ width: 38, fontSize: 22 }}
            />
            <Button variant='dark' size='sm' onClick={() => increment('right')}>
              ▲
            </Button>
            <Button variant='dark' size='sm' onClick={() => zeroing('right')}>
              ⟳
            </Button>
            <Button variant='dark' size='sm' onClick={() => decrement('right')}>
              ▼
            </Button>
          </InputGroup>
        </Col>
      </Row>
      {/* Третья строка: W/L */}
      <Row className='align-items-center'>
        <Col xs={5} className='d-flex gap-2'>
          <Button variant='primary' size='sm' className='fw-bold'>
            W
          </Button>
          <Button variant='primary' size='sm' className='fw-bold'>
            L
          </Button>
        </Col>
        <Col xs={2}></Col>
        <Col xs={5} className='d-flex gap-2 justify-content-end'>
          <Button variant='primary' size='sm' className='fw-bold'>
            W
          </Button>
          <Button variant='primary' size='sm' className='fw-bold'>
            L
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Players;
