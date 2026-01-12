import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import {
  ArrowDown,
  ArrowRepeat,
  ArrowUp,
  PersonFill,
  Save,
  Trash,
  TrophyFill,
  XCircleFill,
} from 'react-bootstrap-icons';
import useDebouncedCallback from '../../../hooks/useDebouncedCallback';
import FlagSelector from '../Forms/FlagSelector';
import { PlayerPresetService } from '../services/PlayerPresetService';
import { Player, PlayerWithTimestamp } from '../types';
import { getFlagPath } from '../Utils/flagUtils';
import styles from './PlayerCard.module.scss';

type PlayerCardProps = {
  player: PlayerWithTimestamp;
  onName: (name: string) => void;
  onSponsor: (sponsor: string) => void;
  onScore: (score: number) => void;
  onWin: () => void;
  onLose: () => void;
  label: string;
  accent: string;
  onTag: (tag: string) => void;
  onFlag: (flag: string) => void;
  onClearFinal: () => void;
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onName,
  onScore,
  onWin,
  onLose,
  label,
  accent,
  onTag,
  onFlag,
  onClearFinal,
}) => {
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [presetsVersion, setPresetsVersion] = useState(0);
  const [presets, setPresets] = useState<Player[]>([]);

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounced = useDebouncedCallback(
    (q: string) => setDebouncedQuery(q),
    300
  );

  useEffect(() => {
    let cancelled = false;
    const q = (debouncedQuery || '').trim();
    if (!q) {
      setPresets([]);
      return;
    }

    (async () => {
      try {
        // ask backend for presets starting with the query (limit to 20)
        const data = await PlayerPresetService.load(20, q);
        if (cancelled) return;
        const normalized = (Array.isArray(data) ? data : []).map(
          (p: any) =>
            ({
              name: p.player1?.name || p.name || '',
              tag: p.player1?.tag || '',
              flag: p.player1?.flag || '',
            }) as Player
        );
        setPresets(normalized);
      } catch (e) {
        // ignore, service logs errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, presetsVersion]);

  const filteredPresets = useMemo(() => presets.slice(0, 8), [presets]);

  const handleSelectPreset = useCallback(
    (p: { name: string; tag: string; flag: string }) => {
      onName(p.name);
      onTag(p.tag || '');
      onFlag(p.flag || '');
      setIsNameOpen(false);
    },
    [onName, onTag, onFlag]
  );

  const handleSavePreset = useCallback(async () => {
    await PlayerPresetService.save(player as any);
    setPresetsVersion(v => v + 1);
  }, [player]);

  const handleDeletePreset = useCallback(async () => {
    const name = player.name ?? '';
    if (!name) return;
    await PlayerPresetService.delete(name);
    setPresetsVersion(v => v + 1);
  }, [player]);

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
          <Form.Control
            placeholder='Tag'
            value={player.tag ?? ''}
            onChange={e => onTag(e.target.value)}
            size='sm'
            className={`${styles.tagInput} bg-dark text-info border-info border-2 fw-bold rounded-3`}
            style={{ maxWidth: 90 }}
          />
          <div className={styles.nameInputContainer}>
            <Form.Control
              placeholder='Name'
              value={
                (player.final === 'winner'
                  ? '[W] '
                  : player.final === 'loser'
                    ? '[L] '
                    : '') + (player.name ?? '')
              }
              onChange={e => {
                let val = e.target.value.replace(/^\[W\] |^\[L\] /, '');
                onName(val);
                setIsNameOpen(true);
                debounced(val);
              }}
              onFocus={() => setIsNameOpen(true)}
              onBlur={() => setTimeout(() => setIsNameOpen(false), 150)}
              size='sm'
              className={`${styles.nameInput} fw-bold bg-dark text-white border-primary border-2 rounded-3 w-100`}
            />
            {isNameOpen && filteredPresets.length > 0 && (
              <div className={styles.presetsDropdown}>
                {filteredPresets.map((p: Player) => (
                  <div
                    key={`${p.name}-${p.tag}-${p.flag}`}
                    className={styles.presetItem}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelectPreset(p)}
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
          </div>
        </div>

        <div
          className={styles.flagSelector}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FlagSelector
            selectedFlag={player.flag ?? 'none'}
            onFlagChange={onFlag}
            placeholder='Флаг'
          />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button
              variant='outline-success'
              size='sm'
              className={styles.saveButton}
              onClick={handleSavePreset}
              title='Сохранить пресет игрока'
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
            onClick={() => onScore((player.score ?? 0) + 1)}
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
            onClick={() => onScore((player.score ?? 0) - 1)}
            className={styles.scoreButton}
          >
            <ArrowDown />
          </Button>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={() => onScore(0)}
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
            onClick={onWin}
          >
            <TrophyFill /> W
          </Button>
          <Button
            variant='danger'
            size='sm'
            className={`${styles.actionButton} px-3`}
            onClick={onLose}
          >
            <XCircleFill /> L
          </Button>
          {player.final !== 'none' && (
            <Button
              variant='outline-secondary'
              size='sm'
              className={`${styles.clearButton} px-2 py-0`}
              style={{ fontSize: 14 }}
              onClick={onClearFinal}
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

export default PlayerCard;
