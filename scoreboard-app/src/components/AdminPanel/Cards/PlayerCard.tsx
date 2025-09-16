import React, { useMemo, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import {
    ArrowDown,
    ArrowRepeat,
    ArrowUp,
    PersonFill,
    TrophyFill,
    XCircleFill,
} from "react-bootstrap-icons";
import { PlayerWithTimestamp } from "../types";
import FlagSelector from "../Forms/FlagSelector";
import { playerPresetRepository } from "../services/PlayerPresetService";
import { getFlagPath } from "../Utils/flagUtils";
import styles from "./PlayerCard.module.scss";

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
  onSponsor,
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

  const nameQuery = player.name || "";

  const filteredPresets = useMemo(() => {
    const query = (nameQuery || "").trim().toLowerCase();
    if (!query) return [] as { name: string; tag: string; flag: string; sponsor?: string }[];
    return playerPresetRepository
      .getAllPresets()
      .filter((p: any) => p.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [nameQuery, presetsVersion]);

  const handleSelectPreset = (p: { name: string; tag: string; flag: string }) => {
    onName(p.name);
    onTag(p.tag || "");
    onFlag(p.flag || "");
    setIsNameOpen(false);
  };

  const handleSavePreset = () => {
    playerPresetRepository.save({
      name: player.name,
      tag: player.tag,
      flag: player.flag,
      sponsor: player.sponsor,
    });
    setPresetsVersion((v) => v + 1);
  };

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
          <span
            className={styles.cardTitle}
            style={{ color: accent }}
          >
            {label}
          </span>
        </div>
        
        <div className={styles.playerInfo}>
          <Form.Control
            placeholder="Tag"
            value={player.tag}
            onChange={(e) => onTag(e.target.value)}
            size="sm"
            className={`${styles.tagInput} bg-dark text-info border-info border-2 fw-bold rounded-3`}
            style={{ maxWidth: 90 }}
          />
          <div className={styles.nameInputContainer}>
            <Form.Control
              placeholder="Name"
              value={
                (player.final === "winner"
                  ? "[W] "
                  : player.final === "loser"
                  ? "[L] "
                  : "") + player.name
              }
              onChange={(e) => {
                let val = e.target.value.replace(/^\[W\] |^\[L\] /, "");
                onName(val);
                setIsNameOpen(true);
              }}
              onFocus={() => setIsNameOpen(true)}
              onBlur={() => setTimeout(() => setIsNameOpen(false), 150)}
              size="sm"
              className={`${styles.nameInput} fw-bold bg-dark text-white border-primary border-2 rounded-3 w-100`}
            />
            {isNameOpen && filteredPresets.length > 0 && (
              <div className={styles.presetsDropdown}>
                {filteredPresets.map((p: any) => (
                  <div
                    key={`${p.name}-${p.tag}-${p.flag}`}
                    className={styles.presetItem}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectPreset(p)}
                  >
                    <img
                      src={getFlagPath(p.flag)}
                      alt={p.flag}
                      className={styles.flagImage}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className={styles.presetInfo}>
                      <span className={styles.presetName}>{p.name}</span>
                      {p.tag && <span className={styles.presetTag}>{p.tag}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.flagSelector}>
          <FlagSelector
            selectedFlag={player.flag}
            onFlagChange={onFlag}
            placeholder="Флаг"
          />
        </div>
        
        <div className={styles.scoreSection}>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => onScore(player.score + 1)}
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
            {player.score}
          </span>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => onScore(player.score - 1)}
            className={styles.scoreButton}
          >
            <ArrowDown />
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onScore(0)}
            className={styles.scoreButton}
          >
            <ArrowRepeat />
          </Button>
        </div>
        
        <div className={styles.actionsSection}>
          <Button
            variant="success"
            size="sm"
            className={`${styles.actionButton} px-3`}
            onClick={onWin}
          >
            <TrophyFill /> W
          </Button>
          <Button
            variant="danger"
            size="sm"
            className={`${styles.actionButton} px-3`}
            onClick={onLose}
          >
            <XCircleFill /> L
          </Button>
          {player.final !== "none" && (
            <Button
              variant="outline-secondary"
              size="sm"
              className={`${styles.clearButton} px-2 py-0`}
              style={{ fontSize: 14 }}
              onClick={onClearFinal}
              title="Убрать статус W/L"
            >
              ✕
            </Button>
          )}
          <Button
            variant="outline-success"
            size="sm"
            className={styles.saveButton}
            onClick={handleSavePreset}
            title="Сохранить пресет игрока"
          >
            Сохранить
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlayerCard;
