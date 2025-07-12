import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Palette } from "react-bootstrap-icons";
import { ColorPreset, defaultPreset } from "./types";

type ColorPresetCardProps = {
  onColorChange: (colors: Partial<ColorPreset>) => void;
};

const ColorPresetCard: React.FC<ColorPresetCardProps> = ({ onColorChange }) => {
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
                <Form.Label className="text-white fw-bold small">
                  Text Color
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.textColor}
                    onChange={(e) =>
                      handleCustomColorChange("textColor", e.target.value)
                    }
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.textColor}
                    onChange={(e) =>
                      handleCustomColorChange("textColor", e.target.value)
                    }
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Score Color
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.scoreColor}
                    onChange={(e) =>
                      handleCustomColorChange("scoreColor", e.target.value)
                    }
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.scoreColor}
                    onChange={(e) =>
                      handleCustomColorChange("scoreColor", e.target.value)
                    }
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Score BG
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.scoreBackgroundColor}
                    onChange={(e) =>
                      handleCustomColorChange(
                        "scoreBackgroundColor",
                        e.target.value,
                      )
                    }
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.scoreBackgroundColor}
                    onChange={(e) =>
                      handleCustomColorChange(
                        "scoreBackgroundColor",
                        e.target.value,
                      )
                    }
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Title Color
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.titleColor}
                    onChange={(e) =>
                      handleCustomColorChange("titleColor", e.target.value)
                    }
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.titleColor}
                    onChange={(e) =>
                      handleCustomColorChange("titleColor", e.target.value)
                    }
                    className="bg-dark text-white border-primary border-2 fw-bold rounded-3"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="text-white fw-bold small">
                  Background
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={customColors.backgroundColor}
                    onChange={(e) =>
                      handleCustomColorChange("backgroundColor", e.target.value)
                    }
                    className="p-1"
                    style={{ width: 50, height: 38 }}
                  />
                  <Form.Control
                    type="text"
                    value={customColors.backgroundColor}
                    onChange={(e) =>
                      handleCustomColorChange("backgroundColor", e.target.value)
                    }
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

export default ColorPresetCard;
