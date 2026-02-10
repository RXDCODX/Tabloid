import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import {
  ArrowDown,
  ArrowRepeat,
  ArrowUp,
  CheckCircleFill,
  PersonFill,
  Save,
  Trash,
  TrophyFill,
  XCircleFill,
} from 'react-bootstrap-icons';
import { useShallow } from 'zustand/react/shallow';
import useDebouncedCallback from '../../../hooks/useDebouncedCallback';
import { Scoreboard, useConnection } from '../../../providers/SignalRProvider';
import { useAdminStore } from '../../../store/adminStateStore';
import FlagSelector from '../Forms/FlagSelector';
import { Player } from '../types';
import { getCountryCodeFromValue, getFlagPath } from '../Utils/flagUtils';
import styles from './PlayerCard.module.scss';

type PlayerCardProps = {
  playerNumber: 1 | 2;
  label?: string;
  accent?: string;
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerNumber,
  label,
  accent = '#0dcaf0',
}) => {
  console.log(`[PlayerCard ${playerNumber}] Render`);

  const [isNameOpen, setIsNameOpen] = useState(false);
  const [presetsVersion, setPresetsVersion] = useState(0);
  const [presets, setPresets] = useState<Player[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounced = useDebouncedCallback(
    (q: string) => setDebouncedQuery(q),
    300
  );

  const connection = useConnection();
  console.log(`[PlayerCard ${playerNumber}] Connection:`, connection?.state);

  const player = useAdminStore(
    useShallow(s => (playerNumber === 1 ? s.player1 : s.player2))
  );

  const setPlayer = useAdminStore(
    useShallow(s => (playerNumber === 1 ? s.setPlayer1 : s.setPlayer2))
  );

  const normalizePresets = useCallback(
    (data: Player[]) => {
      const normalized: Player[] = (Array.isArray(data) ? data : []).map(
        (p: any) => {
          const rawFlag = p.flag || p.country || '';
          const flagCode = getCountryCodeFromValue(rawFlag);
          return {
            name: p.name || '',
            tag: p.tag || '',
            flag: flagCode || '',
            final: 'none',
            score: 0,
          };
        }
      );
      setPresets(normalized);
    },
    [setPresets]
  );

  const handler = useCallback(
    (data: Player[]) => {
      console.log(
        `[PlayerCard ${playerNumber}] SignalR ReceivePlayerPresets`,
        data
      );
      normalizePresets(data);
    },
    [normalizePresets, playerNumber]
  );

  // Подписка на SignalR события
  Scoreboard.useSignalREffect('ReceivePlayerPresets', handler, [handler]);

  useEffect(() => {
    console.log(`[PlayerCard ${playerNumber}] useEffect (GetPlayerPresets)`, {
      debouncedQuery,
      presetsVersion,
      connectionState: connection?.state,
    });

    let cancelled = false;
    const q = (debouncedQuery || '').trim();
    if (!q) {
      setPresets([]);
      return;
    }

    if (!connection || connection.state !== 'Connected') return;

    connection.invoke('GetPlayerPresets', 100, q).catch(() => {
      /* ignore */
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, presetsVersion, connection]);

  const filteredPresets = useMemo(() => presets.slice(0, 8), [presets]);

  // Проверяем, совпадают ли текущие данные игрока с каким-либо пресетом
  const matchesPreset = useMemo(() => {
    if (!player.name || !player.name.trim()) return false;
    return presets.some(
      p =>
        p.name === player.name && p.tag === player.tag && p.flag === player.flag
    );
  }, [player.name, player.tag, player.flag, presets]);

  const handleSelectPreset = useCallback(
    (p: Player) => {
      setPlayer({
        ...player,
        name: p.name,
        tag: p.tag || '',
        flag: p.flag || '',
      });
      setIsNameOpen(false);
    },
    [player, setPlayer]
  );

  const handleSavePreset = useCallback(async () => {
    if (!connection || connection.state !== 'Connected' || !playerNumber)
      return;
    try {
      await connection.invoke('UpsertPlayerPreset', playerNumber);
      setPresetsVersion(v => v + 1);
    } catch (e) {
      // ignore
    }
  }, [connection, playerNumber]);

  const handleDeletePreset = useCallback(async () => {
    if (!connection || connection.state !== 'Connected' || !playerNumber)
      return;
    try {
      await connection.invoke('DeletePlayerPreset', playerNumber);
      setPresetsVersion(v => v + 1);
    } catch (e) {
      // ignore
    }
  }, [connection, playerNumber]);

  const handleDropdownWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const deltaY = e.deltaY;
      const atTop = el.scrollTop === 0;
      const atBottom =
        Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <Card
      className={`${styles.playerCard} shadow-lg p-4 mb-2 player-card-responsive`}
      style={{
        border: `2px solid ${accent}`,
      }}
    >
      <Card.Body>
        <div className={styles.cardHeader}>
          <PersonFill color={accent} size={22} />
          <span className={styles.cardTitle} style={{ color: accent }}>
            {label}
          </span>
        </div>

        <div className={styles.playerInfo}>
          <input
            type='text'
            placeholder='Tag'
            value={player.tag ?? ''}
            onChange={e => setPlayer({ ...player, tag: e.target.value })}
            className={`form-control form-control-sm ${styles.tagInput} bg-dark text-info border-info border-2 fw-bold rounded-3`}
            style={{ maxWidth: 90 }}
          />
          <div
            className={styles.nameInputContainer}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <input
              type='text'
              placeholder='Name'
              value={
                (player.final === 'winner'
                  ? '[W] '
                  : player.final === 'loser'
                    ? '[L] '
                    : '') + (player.name ?? '')
              }
              onChange={e => {
                const val = e.target.value.replace(/^\[W\]\s|^\[L\]\s/, '');
                setPlayer({ ...player, name: val });
                setIsNameOpen(true);
                debounced(val);
              }}
              onFocus={() => setIsNameOpen(true)}
              onBlur={() => setTimeout(() => setIsNameOpen(false), 150)}
              className={`form-control form-control-sm ${styles.nameInput} fw-bold bg-dark text-white border-primary border-2 rounded-3 w-100`}
              style={{ paddingRight: matchesPreset ? '32px' : undefined }}
            />
            {matchesPreset && (
              <CheckCircleFill
                className={styles.checkIcon}
                color='#198754'
                size={18}
              />
            )}
            {isNameOpen && filteredPresets.length > 0 && (
              <div
                className={styles.presetsDropdown}
                onWheel={handleDropdownWheel}
              >
                {filteredPresets.map((p: Player) => (
                  <div
                    key={`${p.name}-${p.tag}-${p.flag}`}
                    className={styles.presetItem}
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelectPreset(p);
                    }}
                  >
                    <img
                      src={getFlagPath(p.flag)}
                      alt={p.flag}
                      className={styles.flagImage}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          'none';
                      }}
                    />
                    <div className={styles.presetInfo}>
                      <span className={styles.presetName}>{p.name}</span>
                      {p.tag && (
                        <span className={styles.presetTag}>{p.tag}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  color: '#fff',
                  fontSize: '12px',
                  borderRadius: '6px',
                  zIndex: 1000,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  pointerEvents: 'none',
                }}
              >
                💡 Оставьте поле пустым, чтобы скрыть блок на скорборде
              </div>
            )}
          </div>
        </div>

        <div
          className={styles.flagSelector}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FlagSelector
            selectedFlag={player.flag ?? 'none'}
            onFlagChange={flag => setPlayer({ ...player, flag })}
            placeholder='Флаг'
          />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button
              variant='outline-success'
              size='sm'
              className={styles.saveButton}
              onClick={handleSavePreset}
              title='Сохранить пресет игрока'
              disabled={matchesPreset}
            >
              <Save />
            </Button>
            <Button
              variant='outline-danger'
              size='sm'
              onClick={handleDeletePreset}
              title='Удалить пресет'
            >
              <Trash />
            </Button>
          </div>
        </div>

        <div className={styles.scoreSection}>
          <Button
            variant='outline-info'
            size='sm'
            onClick={() =>
              setPlayer({ ...player, score: (player.score ?? 0) + 1 })
            }
            className={styles.scoreButton}
          >
            <ArrowUp />
          </Button>
          <span
            className={styles.scoreDisplay}
            style={{
              color: accent,
            }}
          >
            {player.score ?? 0}
          </span>
          <Button
            variant='outline-info'
            size='sm'
            onClick={() =>
              setPlayer({ ...player, score: (player.score ?? 0) - 1 })
            }
            className={styles.scoreButton}
          >
            <ArrowDown />
          </Button>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={() => setPlayer({ ...player, score: 0 })}
            className={styles.scoreButton}
          >
            <ArrowRepeat />
          </Button>
        </div>

        <div className={styles.actionsSection}>
          <Button
            variant='success'
            size='sm'
            className={`${styles.actionButton} px-3`}
            onClick={() => setPlayer({ ...player, final: 'winner' })}
          >
            <TrophyFill /> W
          </Button>
          <Button
            variant='danger'
            size='sm'
            className={`${styles.actionButton} px-3`}
            onClick={() => setPlayer({ ...player, final: 'loser' })}
          >
            <XCircleFill /> L
          </Button>
          {player.final !== 'none' && (
            <Button
              variant='outline-secondary'
              size='sm'
              className={`${styles.clearButton} px-2 py-0`}
              style={{ fontSize: 14 }}
              onClick={() => setPlayer({ ...player, final: 'none' })}
              title='Убрать статус W/L'
            >
              ✕
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default memo(PlayerCard);
