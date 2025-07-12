import React from "react";
import { Button, Card, Form } from "react-bootstrap";
import {
    ArrowDown,
    ArrowRepeat,
    ArrowUp,
    PersonFill,
    TrophyFill,
    XCircleFill,
} from "react-bootstrap-icons";
import { PlayerWithTimestamp } from "./types";

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
  onClearFinal,
}) => (
  <Card
    className="shadow-lg p-4 mb-2 player-card-responsive"
    style={{
      minWidth: 280,
      borderRadius: 18,
      border: `2px solid ${accent}`,
      background: "#23272f",
    }}
  >
    <Card.Body>
      <div className="d-flex flex-column align-items-center mb-3 gap-2">
        <PersonFill color={accent} size={22} />
        <span
          className="fw-bold text-uppercase text-center w-100"
          style={{ color: accent, letterSpacing: 1 }}
        >
          {label}
        </span>
      </div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Form.Control
          placeholder="Tag"
          value={player.tag}
          onChange={(e) => onTag(e.target.value)}
          size="sm"
          className="bg-dark text-info border-info border-2 fw-bold rounded-3"
          style={{ maxWidth: 90 }}
        />
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
          }}
          size="sm"
          className="fw-bold bg-dark text-white border-primary border-2 rounded-3"
          style={{ maxWidth: 110 }}
        />
      </div>
      <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => onScore(player.score + 1)}
        >
          <ArrowUp />
        </Button>
        <span
          className="fw-bold"
          style={{
            fontSize: "2.5rem",
            color: accent,
            textShadow: "0 2px 8px #000a",
            minWidth: 48,
            textAlign: "center",
          }}
        >
          {player.score}
        </span>
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => onScore(player.score - 1)}
        >
          <ArrowDown />
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => onScore(0)}
        >
          <ArrowRepeat />
        </Button>
      </div>
      <div className="d-flex gap-2 justify-content-center align-items-center mt-2">
        <Button
          variant="success"
          size="sm"
          className="px-3 d-flex align-items-center gap-1"
          onClick={onWin}
        >
          <TrophyFill /> W
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="px-3 d-flex align-items-center gap-1"
          onClick={onLose}
        >
          <XCircleFill /> L
        </Button>
        {player.final !== "none" && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="ms-2 px-2 py-0"
            style={{ fontSize: 14 }}
            onClick={onClearFinal}
            title="Убрать статус W/L"
          >
            ✕
          </Button>
        )}
      </div>
    </Card.Body>
  </Card>
);

export default PlayerCard; 