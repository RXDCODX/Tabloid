import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Row,
  Stack,
} from "react-bootstrap";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRepeat,
  ArrowUp,
  InfoCircle,
  Palette,
  PersonFill,
  TrophyFill,
  XCircleFill,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { SignalRContext } from "../SignalRProvider";

// Типы
type Player = {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  final: string; // "winner", "loser", "none"
};

type MetaInfo = {
  title: string;
  fightRule: string;
};

type ScoreboardState = {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  colors: ColorPreset;
};

// Типы с timestamp для отслеживания времени изменений
type PlayerWithTimestamp = Player & {
  _lastEdit?: number;
};

type MetaInfoWithTimestamp = MetaInfo & {
  _lastEdit?: number;
};

type ScoreboardStateWithTimestamp = {
  player1: PlayerWithTimestamp;
  player2: PlayerWithTimestamp;
  meta: MetaInfoWithTimestamp;
  _receivedAt?: number;
};

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

const MetaPanel: React.FC<{
  setMeta: (meta: any) => void;
  meta: MetaInfoWithTimestamp;
}> = ({ setMeta, meta }) => {
  const [customFightRule, setCustomFightRule] = useState(meta.fightRule || "");

  const fightRules = ["FT1", "FT2", "FT3", "FT4", "FT5"];

  const handleFightRuleChange = (rule: string) => {
    setMeta({ fightRule: rule });
    if (fightRules.includes(rule)) {
      setCustomFightRule(""); // сбрасываем customFightRule
    } else {
      setCustomFightRule(rule);
    }
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
                  onClick={() => handleFightRuleChange("Custom")}
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
                    value={customFightRule || ""}
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

type ColorPreset = {
  name: string;
  textColor: string; // primary -> textColor (цвет текста)
  scoreColor: string; // secondary -> scoreColor (цвет чисел счетчиков)
  scoreBackgroundColor: string; // фон счетчиков
  titleColor: string; // accent -> titleColor (цвет metaTitle)
  backgroundColor: string; // background -> backgroundColor (фон для left, middle, right, subBar1, subBar2)
};

type ColorPresetCardProps = {
  onColorChange: (colors: Partial<ColorPreset>) => void;
};

const ColorPresetCard: React.FC<ColorPresetCardProps> = ({ onColorChange }) => {
  const defaultPreset: ColorPreset = {
    name: "Default",
    textColor: "#3F00FF",
    scoreColor: "#fff",
    scoreBackgroundColor: "#23272f",
    titleColor: "#3F00FF",
    backgroundColor: "#fff",
  };

  const [customColors, setCustomColors] = useState(defaultPreset);

  const colorPresets: ColorPreset[] = [
    defaultPreset,
    {
      name: "Classic Blue",
      textColor: "#ffffff",
      scoreColor: "#0dcaf0",
      scoreBackgroundColor: "#1a1d23",
      titleColor: "#ffc107",
      backgroundColor: "#23272f",
    },
    {
      name: "Fire Red",
      textColor: "#ffffff",
      scoreColor: "#dc3545",
      scoreBackgroundColor: "#1a1d23",
      titleColor: "#ffc107",
      backgroundColor: "#1a1d23",
    },
    {
      name: "Forest Green",
      textColor: "#ffffff",
      scoreColor: "#198754",
      scoreBackgroundColor: "#1a1d23",
      titleColor: "#ffc107",
      backgroundColor: "#1a1d23",
    },
    {
      name: "Purple Night",
      textColor: "#ffffff",
      scoreColor: "#6f42c1",
      scoreBackgroundColor: "#1a1d23",
      titleColor: "#ffc107",
      backgroundColor: "#1a1d23",
    },
    {
      name: "Golden",
      textColor: "#ffffff",
      scoreColor: "#ffc107",
      scoreBackgroundColor: "#1a1d23",
      titleColor: "#dc3545",
      backgroundColor: "#23272f",
    },
    {
      name: "Neon",
      textColor: "#ffffff",
      scoreColor: "#00ff88",
      scoreBackgroundColor: "#000000",
      titleColor: "#0088ff",
      backgroundColor: "#000000",
    },
  ];

  // Применяем дефолтный пресет при загрузке компонента
  useEffect(() => {
    onColorChange(defaultPreset);
  }, [onColorChange]);

  const applyPreset = (preset: ColorPreset) => {
    setCustomColors(preset);
    onColorChange(preset);
  };

  const handleCustomColorChange = (field: keyof typeof customColors, value: string) => {
    const newColors = { ...customColors, [field]: value };
    setCustomColors(newColors);
    onColorChange(newColors);
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
          <Palette color="#6f42c1" size={22} />
          <span
            className="fw-bold text-uppercase"
            style={{ color: "#6f42c1", letterSpacing: 1 }}
          >
            Color Presets
          </span>
        </div>
        
        {/* Пресеты цветов */}
        <div className="mb-4">
          <h6 className="text-white fw-bold mb-3">Presets:</h6>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline-primary"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="fw-bold"
                style={{
                  borderColor: preset.scoreColor,
                  color: preset.scoreColor,
                  minWidth: 100,
                }}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Кастомные цвета */}
        <div>
          <h6 className="text-white fw-bold mb-3">Custom Colors:</h6>
          <Row className="g-3 d-flex justify-content-center">
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">Text Color</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.textColor}
                    onChange={(e) => handleCustomColorChange("textColor", e.target.value)}
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.textColor}
                    onChange={(e) => handleCustomColorChange("textColor", e.target.value)}
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">Score Color</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.scoreColor}
                    onChange={(e) => handleCustomColorChange("scoreColor", e.target.value)}
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.scoreColor}
                    onChange={(e) => handleCustomColorChange("scoreColor", e.target.value)}
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">Score BG</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.scoreBackgroundColor}
                    onChange={(e) => handleCustomColorChange("scoreBackgroundColor", e.target.value)}
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.scoreBackgroundColor}
                    onChange={(e) => handleCustomColorChange("scoreBackgroundColor", e.target.value)}
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">Title Color</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.titleColor}
                    onChange={(e) => handleCustomColorChange("titleColor", e.target.value)}
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.titleColor}
                    onChange={(e) => handleCustomColorChange("titleColor", e.target.value)}
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">Background</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.backgroundColor}
                    onChange={(e) => handleCustomColorChange("backgroundColor", e.target.value)}
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.backgroundColor}
                    onChange={(e) => handleCustomColorChange("backgroundColor", e.target.value)}
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

const AdminPanel = () => {
  // Состояние с timestamp
  const [player1, setPlayer1State] = useState<PlayerWithTimestamp>({
    name: "Player 1",
    sponsor: "",
    score: 0,
    tag: "",
    final: "none",
  });
  const [player2, setPlayer2State] = useState<PlayerWithTimestamp>({
    name: "Player 2",
    sponsor: "",
    score: 0,
    tag: "",
    final: "none",
  });
  const [meta, setMetaState] = useState<MetaInfoWithTimestamp>({
    title: "",
    fightRule: "",
  });

  // Редирект на админку при открытии с телефона
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      navigate("/admin");
    }
  }, [navigate]);

  // Подписка на SignalR события
  useEffect(() => {
    const handleReceiveState = (state: ScoreboardState) => {
      const now = Date.now();
      const stateWithTimestamp: ScoreboardStateWithTimestamp = {
        ...state,
        _receivedAt: now,
      };

      // Проверяем и обновляем только те поля, которые не были изменены локально недавно
      setPlayer1State((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 1000; // Если локальное изменение было больше 1 секунды назад
        return shouldUpdate
          ? { ...state.player1, _lastEdit: prev._lastEdit }
          : prev;
      });

      setPlayer2State((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 1000;
        return shouldUpdate
          ? { ...state.player2, _lastEdit: prev._lastEdit }
          : prev;
      });

      setMetaState((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 1000;
        return shouldUpdate
          ? { ...state.meta, _lastEdit: prev._lastEdit }
          : prev;
      });
    };

    SignalRContext.connection?.on("ReceiveState", handleReceiveState);

    return () => {
      SignalRContext.connection?.off("ReceiveState", handleReceiveState);
    };
  }, []);

  // Методы для отправки данных с timestamp
  const setPlayer1 = useCallback(
    (playerUpdate: any) => {
      const now = Date.now();
      const updatedPlayer = { ...player1, ...playerUpdate, _lastEdit: now };
      setPlayer1State(updatedPlayer); // Оптимистичное обновление
      SignalRContext.invoke("UpdatePlayer1", updatedPlayer);
    },
    [player1],
  );

  const setPlayer2 = useCallback(
    (playerUpdate: any) => {
      const now = Date.now();
      const updatedPlayer = { ...player2, ...playerUpdate, _lastEdit: now };
      setPlayer2State(updatedPlayer); // Оптимистичное обновление
      SignalRContext.invoke("UpdatePlayer2", updatedPlayer);
    },
    [player2],
  );
  const setMeta = useCallback(
    (metaUpdate: any) => {
      const now = Date.now();
      const updatedMeta = { ...meta, ...metaUpdate, _lastEdit: now };
      setMetaState(updatedMeta); // Оптимистичное обновление
      SignalRContext.connection?.invoke("UpdateMeta", updatedMeta);
    },
    [meta],
  );
  const setState = useCallback((state: any) => {
    const now = Date.now();
    setPlayer1State({ ...state.player1, _lastEdit: now }); // Оптимистичное обновление
    setPlayer2State({ ...state.player2, _lastEdit: now }); // Оптимистичное обновление
    setMetaState({ ...state.meta, _lastEdit: now }); // Оптимистичное обновление
    SignalRContext.invoke("SetState", state);
  }, []);
  const getState = useCallback(() => SignalRContext.invoke("GetState"), []);

  // Вспомогательные функции
  const swapPlayers = useCallback(() => {
    const now = Date.now();
    const newPlayer1 = { ...player2, _lastEdit: now };
    const newPlayer2 = { ...player1, _lastEdit: now };
    setPlayer1State(newPlayer1);
    setPlayer2State(newPlayer2);
    SignalRContext.invoke("UpdatePlayer1", newPlayer1);
    SignalRContext.invoke("UpdatePlayer2", newPlayer2);
  }, [player1, player2]);

  const reset = useCallback(() => {
    const now = Date.now();
    const initialState: ScoreboardState = {
      player1: {
        name: "Player 1",
        sponsor: "",
        score: 0,
        tag: "",
        final: "none",
      },
      player2: {
        name: "Player 2",
        sponsor: "",
        score: 0,
        tag: "",
        final: "none",
      },
      meta: {
        title: "",
        fightRule: "",
      },
      colors: {
        name: "Default",
        textColor: "#ffffff",
        scoreColor: "#0dcaf0",
        scoreBackgroundColor: "#23272f",
        titleColor: "#ffc107",
        backgroundColor: "#23272f",
      },
    };
    setPlayer1State({ ...initialState.player1, _lastEdit: now });
    setPlayer2State({ ...initialState.player2, _lastEdit: now });
    setMetaState({ ...initialState.meta, _lastEdit: now });
    SignalRContext.invoke("SetState", initialState);
  }, []);

  const handleColorChange = useCallback((colors: Partial<ColorPreset>) => {
    // Отправляем на сервер
    SignalRContext.connection?.invoke("UpdateColors", colors);
    
    console.log("Sending colors to server:", colors);
  }, []);

  return (
    <Container className="py-4">
      {/* Meta Panel */}
      <MetaPanel setMeta={setMeta} meta={meta} />

      {/* Color Preset Panel */}
      <ColorPresetCard onColorChange={handleColorChange} />

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
            onWin={() => setPlayer1({ ...player1, final: "winner" })}
            onLose={() => setPlayer1({ ...player1, final: "loser" })}
            onTag={(tag) => setPlayer1({ ...player1, tag })}
            onClearFinal={() => setPlayer1({ ...player1, final: "none" })}
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
            <Button
              variant="info"
              className="fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container"
              style={{
                fontSize: 18,
                background: "#0dcaf0",
                border: "none",
                boxShadow: "0 2px 8px #0dcaf055",
                position: "relative",
              }}
              onClick={() => {
                setPlayer1({ ...player1, name: player2.name });
                setPlayer2({ ...player2, name: player1.name });
              }}
              title="Поменять имена"
            >
              <ArrowLeftRight /> Name
            </Button>
            <Button
              variant="info"
              className="fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container"
              style={{
                fontSize: 18,
                background: "#0dcaf0",
                border: "none",
                boxShadow: "0 2px 8px #0dcaf055",
                position: "relative",
              }}
              onClick={swapPlayers}
              title="Поменять игроков местами"
            >
              <ArrowLeftRight /> All
            </Button>
            <Button
              variant="danger"
              className="fw-bold py-2 text-white w-100 w-md-auto mx-2 tooltip-container"
              style={{
                fontSize: 18,
                background: "#dc3545",
                border: "none",
                boxShadow: "0 2px 8px #dc354555",
                position: "relative",
              }}
              onClick={reset}
              title="Сбросить всё"
            >
              <ArrowRepeat /> Reset
            </Button>
          </Stack>
        </Col>
        <Col xs={12} md={5} lg={4} className="d-flex justify-content-center">
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
            onWin={() => setPlayer2({ ...player2, final: "winner" })}
            onLose={() => setPlayer2({ ...player2, final: "loser" })}
            onTag={(tag) => setPlayer2({ ...player2, tag })}
            onClearFinal={() => setPlayer2({ ...player2, final: "none" })}
            label="Player 2"
            accent="#6610f2"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
