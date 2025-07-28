import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Palette } from "react-bootstrap-icons";
import { ColorPreset, defaultPreset } from "./types";
import ColorPickerWithTransparency from "./ColorPickerWithTransparency";

type ColorPresetCardProps = {
  onColorChange: (colors: Partial<ColorPreset>) => void;
};

const ColorPresetCard: React.FC<ColorPresetCardProps> = ({ onColorChange }) => {
  const [customColors, setCustomColors] = useState(defaultPreset);

  const colorPresets: ColorPreset[] = [
    defaultPreset,
    {
      name: "Classic Blue",
      mainColor: "#0dcaf0",
      playerNamesColor: "#ffffff",
      tournamentTitleColor: "#0dcaf0",
      fightModeColor: "#0dcaf0",
      scoreColor: "#0dcaf0",
      backgroundColor: "#1a1d23",
      borderColor: "#0dcaf0",
    },
    {
      name: "Fire Red",
      mainColor: "#dc3545",
      playerNamesColor: "#ffffff",
      tournamentTitleColor: "#dc3545",
      fightModeColor: "#dc3545",
      scoreColor: "#dc3545",
      backgroundColor: "#1a1d23",
      borderColor: "#dc3545",
    },
    {
      name: "Forest Green",
      mainColor: "#198754",
      playerNamesColor: "#ffffff",
      tournamentTitleColor: "#198754",
      fightModeColor: "#198754",
      scoreColor: "#198754",
      backgroundColor: "#1a1d23",
      borderColor: "#198754",
    },
    {
      name: "Purple Night",
      mainColor: "#6f42c1",
      playerNamesColor: "#ffffff",
      tournamentTitleColor: "#6f42c1",
      fightModeColor: "#6f42c1",
      scoreColor: "#6f42c1",
      backgroundColor: "#1a1d23",
      borderColor: "#6f42c1",
    },
    {
      name: "Golden",
      mainColor: "#ffc107",
      playerNamesColor: "#ffffff",
      tournamentTitleColor: "#ffc107",
      fightModeColor: "#ffc107",
      scoreColor: "#ffc107",
      backgroundColor: "#23272f",
      borderColor: "#ffc107",
    },
    {
      name: "Neon",
      mainColor: "#00ff88",
      playerNamesColor: "#ffffff",
      tournamentTitleColor: "#0088ff",
      fightModeColor: "#00ff88",
      scoreColor: "#00ff88",
      backgroundColor: "#000000",
      borderColor: "#00ff88",
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

  const handleCustomColorChange = (
    field: keyof typeof customColors,
    value: string,
  ) => {
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
                  borderColor: preset.mainColor,
                  color: preset.mainColor,
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
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Main Color (Tags & Glow)
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.mainColor}
                  onChange={(value) => handleCustomColorChange("mainColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Player Names
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.playerNamesColor}
                  onChange={(value) => handleCustomColorChange("playerNamesColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Tournament Title
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.tournamentTitleColor}
                  onChange={(value) => handleCustomColorChange("tournamentTitleColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Fight Mode
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.fightModeColor}
                  onChange={(value) => handleCustomColorChange("fightModeColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Score Color
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.scoreColor}
                  onChange={(value) => handleCustomColorChange("scoreColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Background
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.backgroundColor}
                  onChange={(value) => handleCustomColorChange("backgroundColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Border Color
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.borderColor}
                  onChange={(value) => handleCustomColorChange("borderColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ColorPresetCard;
