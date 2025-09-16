import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Palette } from "react-bootstrap-icons";
import { ColorPreset, defaultPreset } from "../types";
import ColorPickerWithTransparency from "../Forms/ColorPickerWithTransparency";
import styles from "./ColorPresetCard.module.scss";

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
    <Card className={styles.colorPresetCard}>
      <Card.Body>
        <div className={styles.cardHeader}>
          <Palette color="#6f42c1" size={22} />
          <span className={styles.cardTitle}>
            Color Presets
          </span>
        </div>

        {/* Пресеты цветов */}
        <div className={styles.presetsSection}>
          <h6 className={styles.sectionTitle}>Presets:</h6>
          <div className={styles.presetsContainer}>
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline-primary"
                size="sm"
                onClick={() => applyPreset(preset)}
                className={`${styles.presetButton} fw-bold`}
                style={{
                  '--preset-color': preset.mainColor,
                } as React.CSSProperties}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Кастомные цвета */}
        <div className={styles.customColorsSection}>
          <h6 className={styles.sectionTitle}>Custom Colors:</h6>
          <Row className="g-3 d-flex justify-content-center">
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Main Color (Tags & Glow)
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.mainColor}
                  onChange={(value) => handleCustomColorChange("mainColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Player Names
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.playerNamesColor}
                  onChange={(value) => handleCustomColorChange("playerNamesColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Tournament Title
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.tournamentTitleColor}
                  onChange={(value) => handleCustomColorChange("tournamentTitleColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Fight Mode
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.fightModeColor}
                  onChange={(value) => handleCustomColorChange("fightModeColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Score Color
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.scoreColor}
                  onChange={(value) => handleCustomColorChange("scoreColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Background
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.backgroundColor}
                  onChange={(value) => handleCustomColorChange("backgroundColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
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
