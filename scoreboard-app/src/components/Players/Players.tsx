import React, { useCallback } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../store/adminStateStore';
import { Player } from '../../types/types';

const Players: React.FC = () => {
  const { player1, player2, setPlayer1, setPlayer2, swapPlayers, reset } =
    useAdminStore(
      useShallow(s => ({
        player1: s.player1,
        player2: s.player2,
        setPlayer1: s.setPlayer1,
        setPlayer2: s.setPlayer2,
        swapPlayers: s.swapPlayers,
        reset: s.reset,
      }))
    );

  const updatePlayer = useCallback(
    (side: 'left' | 'right', updated: Player) => {
      if (side === 'left') setPlayer1(updated);
      else setPlayer2(updated);
    },
    [setPlayer1, setPlayer2]
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
            placeholder='Tag'
            value={player1.tag ?? ''}
            onChange={e =>
              updatePlayer('left', { ...player1, tag: e.target.value })
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
            placeholder='Tag'
            value={player2.tag ?? ''}
            onChange={e =>
              updatePlayer('right', { ...player2, tag: e.target.value })
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
