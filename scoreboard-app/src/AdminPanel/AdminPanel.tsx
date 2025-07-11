import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  OverlayTrigger,
  Row,
  Stack,
  Tooltip,
} from "react-bootstrap";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRepeat,
  ArrowUp,
  InfoCircle,
  PersonFill,
  TrophyFill,
  XCircleFill,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useScoreboardStore } from "../store";

// Типы
type Player = {
  name: string;
  sponsor: string;
  score: number;
  final: "none" | "winner" | "loser";
  tag: string;
};

type PlayerCardProps = {
  player: Player;
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

const MetaPanel: React.FC = () => {
  const meta = useScoreboardStore((s) => s.meta);
  const setMeta = useScoreboardStore((s) => s.setMeta);
  const [customFightRule, setCustomFightRule] = useState(meta.fightRule);

  const fightRules = ["FT1", "FT2", "FT3", "FT4", "FT5"];

  const handleFightRuleChange = (rule: string) => {
    setMeta({ fightRule: rule });
    setCustomFightRule(rule);
  };

  return (
    <Card
      className="shadow-lg p-4 mb-4"
      style={{
        background: "#1a1d23",
        borderRadius: 18,
        border: "2px solid #6f42c1",
      }}
    >
      <Card.Body>
        <div className="d-flex flex-column align-items-center mb-3 gap-2 text-center">
          <InfoCircle color="#6f42c1" size={22} />
          <span
            className="fw-bold text-uppercase"
            style={{ color: "#6f42c1", letterSpacing: 1 }}
          >
            Meta Panel
          </span>
        </div>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="text-white fw-bold">
                Название турнира
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите название турнира"
                value={meta.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                style={{ fontSize: 16 }}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="text-white fw-bold">
                Режим драки
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap mb-2 w-100">
                <ButtonGroup size="sm" className="w-100">
                  {fightRules.map((rule) => (
                    <Button
                      key={rule}
                      variant={
                        meta.fightRule === rule ? "primary" : "outline-primary"
                      }
                      onClick={() => handleFightRuleChange(rule)}
                      className="fw-bold"
                      style={{
                        minWidth: 60,
                        background:
                          meta.fightRule === rule ? "#0d6efd" : "transparent",
                        borderColor: "#0d6efd",
                      }}
                    >
                      {rule}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              <div className="d-flex gap-2 flex-wrap w-100">
                <Button
                  variant={
                    !fightRules.includes(meta.fightRule)
                      ? "primary"
                      : "outline-primary"
                  }
                  onClick={() => setMeta({ fightRule: "Custom" })}
                  className="fw-bold w-100"
                  style={{
                    minWidth: 100,
                    background: !fightRules.includes(meta.fightRule)
                      ? "#0d6efd"
                      : "transparent",
                    borderColor: "#0d6efd",
                  }}
                >
                  Custom
                </Button>
                {(meta.fightRule === "Custom" ||
                  !fightRules.includes(meta.fightRule)) && (
                  <Form.Control
                    type="text"
                    placeholder="Кастомный режим (например: FT10, BO3)"
                    value={customFightRule}
                    onChange={(e) => {
                      setCustomFightRule(e.target.value);
                      setMeta({ fightRule: e.target.value });
                    }}
                    className="bg-dark text-warning border-warning border-2 fw-bold rounded-3 w-100"
                    style={{ fontSize: 14 }}
                  />
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const AdminPanel = () => {
  // Редирект на админку при открытии с телефона
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      navigate("/admin");
    }
  }, [navigate]);

  return (
    <Container className="py-4">
      {/* Meta Panel */}
      <MetaPanel />

      {/* Players Cards */}
      <Row className="justify-content-center align-items-center g-4">
        <Col
          xs={12}
          md={5}
          lg={4}
          className="d-flex justify-content-center mb-3 mb-md-0"
        >
          <PlayerCard
            player={useScoreboardStore((s) => s.player1)}
            onName={(name) =>
              useScoreboardStore.getState().setPlayer1({ name })
            }
            onSponsor={(sponsor) =>
              useScoreboardStore.getState().setPlayer1({ sponsor })
            }
            onScore={(score) =>
              useScoreboardStore
                .getState()
                .setPlayer1({ score: Math.max(0, Math.min(99, score)) })
            }
            onWin={() =>
              useScoreboardStore.getState().setPlayer1({ final: "winner" })
            }
            onLose={() =>
              useScoreboardStore.getState().setPlayer1({ final: "loser" })
            }
            onTag={(tag) => useScoreboardStore.getState().setPlayer1({ tag })}
            onClearFinal={() =>
              useScoreboardStore.getState().setPlayer1({ final: "none" })
            }
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
          <Stack gap={3} className="w-100 w-md-auto align-items-center">
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Поменять имена</Tooltip>}
            >
              <Button
                variant="info"
                className="fw-bold py-2 text-white w-100 w-md-auto mx-2"
                style={{
                  fontSize: 18,
                  background: "#0dcaf0",
                  border: "none",
                  boxShadow: "0 2px 8px #0dcaf055",
                }}
                onClick={() => {
                  const p1 = useScoreboardStore.getState().player1;
                  const p2 = useScoreboardStore.getState().player2;
                  useScoreboardStore
                    .getState()
                    .setPlayer1({ name: p2.name, final: p2.final });
                  useScoreboardStore
                    .getState()
                    .setPlayer2({ name: p1.name, final: p1.final });
                }}
              >
                <ArrowLeftRight /> Name
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Поменять игроков местами</Tooltip>}
            >
              <Button
                variant="info"
                className="fw-bold py-2 text-white w-100 w-md-auto mx-2"
                style={{
                  fontSize: 18,
                  background: "#0dcaf0",
                  border: "none",
                  boxShadow: "0 2px 8px #0dcaf055",
                }}
                onClick={() => useScoreboardStore.getState().swapPlayers()}
              >
                <ArrowLeftRight /> All
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Сбросить всё</Tooltip>}
            >
              <Button
                variant="danger"
                className="fw-bold py-2 text-white w-100 w-md-auto mx-2"
                style={{
                  fontSize: 18,
                  background: "#dc3545",
                  border: "none",
                  boxShadow: "0 2px 8px #dc354555",
                }}
                onClick={() => useScoreboardStore.getState().reset()}
              >
                <ArrowRepeat /> Reset
              </Button>
            </OverlayTrigger>
          </Stack>
        </Col>
        <Col xs={12} md={5} lg={4} className="d-flex justify-content-center">
          <PlayerCard
            player={useScoreboardStore((s) => s.player2)}
            onName={(name) =>
              useScoreboardStore.getState().setPlayer2({ name })
            }
            onSponsor={(sponsor) =>
              useScoreboardStore.getState().setPlayer2({ sponsor })
            }
            onScore={(score) =>
              useScoreboardStore
                .getState()
                .setPlayer2({ score: Math.max(0, Math.min(99, score)) })
            }
            onWin={() =>
              useScoreboardStore.getState().setPlayer2({ final: "winner" })
            }
            onLose={() =>
              useScoreboardStore.getState().setPlayer2({ final: "loser" })
            }
            onTag={(tag) => useScoreboardStore.getState().setPlayer2({ tag })}
            onClearFinal={() =>
              useScoreboardStore.getState().setPlayer2({ final: "none" })
            }
            label="Player 2"
            accent="#6610f2"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
