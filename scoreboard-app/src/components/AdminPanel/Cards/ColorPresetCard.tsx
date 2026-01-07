import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Palette } from 'react-bootstrap-icons';
import { SignalRContextType } from '../../../providers/SignalRProvider';
import ColorPickerWithTransparency from '../Forms/ColorPickerWithTransparency';
import { ColorPreset, defaultPreset } from '../types';
import styles from './ColorPresetCard.module.scss';

type ColorPresetCardProps = {
  onColorChange: (colors: Partial<ColorPreset>) => void;
  context: SignalRContextType;
};

type ColorPresetModel = {
  name: string;
  playerNamesColor?: string;
  tournamentTitleColor?: string;
  fightModeColor?: string;
  scoreColor?: string;
};

const ColorPresetCard: React.FC<ColorPresetCardProps> = ({
  onColorChange,
  context,
}) => {
  const signalRContext = context;
  const [customColors, setCustomColors] = useState({
    playerNamesColor: defaultPreset.playerNamesColor,
    tournamentTitleColor: defaultPreset.tournamentTitleColor,
    fightModeColor: defaultPreset.fightModeColor,
    scoreColor: defaultPreset.scoreColor,
  });
  const [colorPresets, setColorPresets] = useState<ColorPresetModel[]>([]);

  const handleReceiveColorPresets = useCallback(
    (presets: ColorPresetModel[]) => {
      console.log('SignalR ReceiveColorPresets (ColorPresetCard):', presets);
      setColorPresets(presets);
    },
    []
  );

  useEffect(() => {
    onColorChange({
      playerNamesColor: defaultPreset.playerNamesColor,
      tournamentTitleColor: defaultPreset.tournamentTitleColor,
      fightModeColor: defaultPreset.fightModeColor,
      scoreColor: defaultPreset.scoreColor,
    });
  }, [onColorChange]);

  useEffect(() => {
    signalRContext.connection?.on(
      'ReceiveColorPresets',
      handleReceiveColorPresets
    );
    (async () => {
      try {
        await signalRContext.connection?.invoke('GetColorPresets');
      } catch (err) {
        console.error('Error fetching color presets:', err);
      }
    })();

    return () => {
      signalRContext.connection?.off(
        'ReceiveColorPresets',
        handleReceiveColorPresets
      );
    };
  }, [signalRContext.connection]);

  const applyPreset = useCallback(
    (preset: ColorPresetModel) => {
      const newColors = {
        playerNamesColor:
          preset.playerNamesColor || defaultPreset.playerNamesColor,
        tournamentTitleColor:
          preset.tournamentTitleColor || defaultPreset.tournamentTitleColor,
        fightModeColor: preset.fightModeColor || defaultPreset.fightModeColor,
        scoreColor: preset.scoreColor || defaultPreset.scoreColor,
      } as Partial<ColorPreset>;

      // Обновим локально UI сразу
      setCustomColors(newColors as any);
      onColorChange(newColors);

      // Посылаем на сервер
      signalRContext.connection
        ?.invoke('ApplyColorPreset', preset.name)
        .catch(err => {
          console.error('Error applying color preset:', err);
        });
    },
    [signalRContext.connection]
  );

  const handleCustomColorChange = useCallback(
    (field: keyof typeof customColors, value: string) => {
      const newColors = { ...customColors, [field]: value };
      setCustomColors(newColors);
      onColorChange(newColors);
    },
    [customColors, onColorChange]
  );

  return (
    <Card className={styles.colorPresetCard}>
      <Card.Body>
        <div className={styles.cardHeader}>
          <Palette color='#6f42c1' size={22} />
          <span className={styles.cardTitle}>Color Presets</span>
        </div>

        {/* Пресеты цветов */}
        <div className={styles.presetsSection}>
          <h6 className={styles.sectionTitle}>Presets:</h6>
          <div className={styles.presetsContainer}>
            {colorPresets.map(preset => (
              <Button
                key={preset.name}
                variant='outline-primary'
                size='sm'
                onClick={() => applyPreset(preset)}
                className={`${styles.presetButton} fw-bold`}
                style={
                  {
                    '--preset-color':
                      preset.tournamentTitleColor ||
                      preset.fightModeColor ||
                      preset.scoreColor ||
                      '#6f42c1',
                  } as React.CSSProperties
                }
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Кастомные цвета */}
        <div className={styles.customColorsSection}>
          <h6 className={styles.sectionTitle}>Custom Colors:</h6>
          <Row className='g-3 d-flex justify-content-center'>
            <Col xs={6} md={3} className={styles.colorField}>
              <Form.Group>
                <Form.Label className={styles.fieldLabel}>
                  Player Names
                </Form.Label>
                <ColorPickerWithTransparency
                  value={customColors.playerNamesColor as string}
                  onChange={value =>
                    handleCustomColorChange('playerNamesColor', value)
                  }
                  placeholder='hex или rgba'
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
                  onChange={value =>
                    handleCustomColorChange('tournamentTitleColor', value)
                  }
                  placeholder='hex или rgba'
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
                  onChange={value =>
                    handleCustomColorChange('fightModeColor', value)
                  }
                  placeholder='hex или rgba'
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
                  onChange={value =>
                    handleCustomColorChange('scoreColor', value)
                  }
                  placeholder='hex или rgba'
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
