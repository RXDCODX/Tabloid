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
  const [customColors, setCustomColors] = useState({
    playerNamesColor: defaultPreset.playerNamesColor,
    tournamentTitleColor: defaultPreset.tournamentTitleColor,
    fightModeColor: defaultPreset.fightModeColor,
    scoreColor: defaultPreset.scoreColor,
    backgroundColor: defaultPreset.backgroundColor,
    borderColor: defaultPreset.borderColor,
  });

  const colorPresets: Partial<ColorPreset & { name: string }>[] = [
    { name: "Default", playerNamesColor: defaultPreset.playerNamesColor, tournamentTitleColor: defaultPreset.tournamentTitleColor, fightModeColor: defaultPreset.fightModeColor, scoreColor: defaultPreset.scoreColor, backgroundColor: defaultPreset.backgroundColor, borderColor: defaultPreset.borderColor },
    { name: "Classic Blue", playerNamesColor: "#ffffff", tournamentTitleColor: "#0dcaf0", fightModeColor: "#0dcaf0", scoreColor: "#0dcaf0", backgroundColor: "#1a1a1a", borderColor: "#0dcaf0" },
    { name: "Fire Red", playerNamesColor: "#ffffff", tournamentTitleColor: "#dc3545", fightModeColor: "#dc3545", scoreColor: "#dc3545", backgroundColor: "#2d1b1b", borderColor: "#dc3545" },
    { name: "Forest Green", playerNamesColor: "#ffffff", tournamentTitleColor: "#198754", fightModeColor: "#198754", scoreColor: "#198754", backgroundColor: "#1b2d1b", borderColor: "#198754" },
    { name: "Purple Night", playerNamesColor: "#ffffff", tournamentTitleColor: "#6f42c1", fightModeColor: "#6f42c1", scoreColor: "#6f42c1", backgroundColor: "#2d1b2d", borderColor: "#6f42c1" },
    { name: "Golden", playerNamesColor: "#ffffff", tournamentTitleColor: "#ffc107", fightModeColor: "#ffc107", scoreColor: "#ffc107", backgroundColor: "#2d2d1b", borderColor: "#ffc107" },
    { name: "Neon", playerNamesColor: "#ffffff", tournamentTitleColor: "#0088ff", fightModeColor: "#00ff88", scoreColor: "#00ff88", backgroundColor: "#0d1b2d", borderColor: "#0088ff" },
  ];

  // Применяем дефолтный пресет при загрузке компонента
  useEffect(() => {
    onColorChange({
      playerNamesColor: defaultPreset.playerNamesColor,
      tournamentTitleColor: defaultPreset.tournamentTitleColor,
      fightModeColor: defaultPreset.fightModeColor,
      scoreColor: defaultPreset.scoreColor,
      backgroundColor: defaultPreset.backgroundColor,
      borderColor: defaultPreset.borderColor,
    });
  }, [onColorChange]);

  const applyPreset = (preset: Partial<ColorPreset> & { name?: string }) => {
    const next = {
      playerNamesColor: preset.playerNamesColor ?? customColors.playerNamesColor,
      tournamentTitleColor: preset.tournamentTitleColor ?? customColors.tournamentTitleColor,
      fightModeColor: preset.fightModeColor ?? customColors.fightModeColor,
      scoreColor: preset.scoreColor ?? customColors.scoreColor,
      backgroundColor: preset.backgroundColor ?? customColors.backgroundColor,
      borderColor: preset.borderColor ?? customColors.borderColor,
    };
    setCustomColors(next);
    onColorChange(next);
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
                key={preset.name as string}
                variant="outline-primary"
                size="sm"
                onClick={() => applyPreset(preset)}
                className={`${styles.presetButton} fw-bold`}
                style={{
                  '--preset-color': preset.tournamentTitleColor || preset.fightModeColor || preset.scoreColor || '#6f42c1',
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
            {/* Удалено: mainColor */}
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Player Names
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.playerNamesColor as string}
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
                  value={customColors.tournamentTitleColor as string}
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
                  value={customColors.fightModeColor as string}
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
                  value={customColors.scoreColor as string}
                  onChange={(value) => handleCustomColorChange("scoreColor", value)}
                  placeholder="hex или rgba"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Background Color
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.backgroundColor as string}
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
                  value={customColors.borderColor as string}
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
