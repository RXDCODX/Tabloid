import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Palette } from 'react-bootstrap-icons';
import { Scoreboard, useConnection } from '../../../providers/SignalRProvider';
import { useAdminStore } from '../../../store/adminStateStore';
import ColorPickerWithTransparency from '../Forms/ColorPickerWithTransparency';
import { ColorPreset, defaultPreset } from '../types';
import styles from './ColorPresetCard.module.scss';

type ColorPresetCardProps = {
  // no external props; uses Zustand store internally
};

type ColorPresetModel = {
  name: string;
  playerNamesColor?: string;
  tournamentTitleColor?: string;
  fightModeColor?: string;
  scoreColor?: string;
  textOutlineColor?: string;
  commentatorTagColor?: string;
  commentatorNamesColor?: string;
};

const ColorPresetCard: React.FC<ColorPresetCardProps> = () => {
  console.log('[ColorPresetCard] Render');

  const connection = useConnection();
  console.log('[ColorPresetCard] Connection:', connection?.state);

  const handleColorChange = useCallback((colors: ColorPreset) => {
    useAdminStore.getState().handleColorChange(colors);
  }, []);

  const [customColors, setCustomColors] = useState<Partial<ColorPreset>>({
    playerNamesColor: defaultPreset.playerNamesColor,
    tournamentTitleColor: defaultPreset.tournamentTitleColor,
    fightModeColor: defaultPreset.fightModeColor,
    scoreColor: defaultPreset.scoreColor,
    textOutlineColor: defaultPreset.textOutlineColor,
    commentatorTagColor: defaultPreset.commentatorTagColor,
    commentatorNamesColor: defaultPreset.commentatorNamesColor,
  });
  const [colorPresets, setColorPresets] = useState<ColorPresetModel[]>([]);
  const [presetName, setPresetName] = useState<string>('');
  const [selectedPresetToDelete, setSelectedPresetToDelete] =
    useState<string>('');

  const handleReceiveColorPresets = useCallback(
    (presets: ColorPresetModel[]) => {
      console.log('[ColorPresetCard] SignalR ReceiveColorPresets', presets);
      setColorPresets(presets);
    },
    []
  );

  // Подписка на SignalR события
  Scoreboard.useSignalREffect(
    'ReceiveColorPresets',
    handleReceiveColorPresets,
    [handleReceiveColorPresets]
  );

  useEffect(() => {
    handleColorChange({
      playerNamesColor: defaultPreset.playerNamesColor,
      tournamentTitleColor: defaultPreset.tournamentTitleColor,
      fightModeColor: defaultPreset.fightModeColor,
      scoreColor: defaultPreset.scoreColor,
      textOutlineColor: defaultPreset.textOutlineColor,
      commentatorTagColor: defaultPreset.commentatorTagColor,
      commentatorNamesColor: defaultPreset.commentatorNamesColor,
    });
  }, [handleColorChange]);

  useEffect(() => {
    if (!connection || connection.state !== 'Connected') return;

    (async () => {
      try {
        await connection.invoke('GetColorPresets');
      } catch (err) {
        console.error('Error fetching color presets:', err);
      }
    })();
  }, [connection]);

  const applyPreset = useCallback(
    (preset: ColorPresetModel) => {
      const newColors = {
        playerNamesColor:
          preset.playerNamesColor || defaultPreset.playerNamesColor,
        tournamentTitleColor:
          preset.tournamentTitleColor || defaultPreset.tournamentTitleColor,
        fightModeColor: preset.fightModeColor || defaultPreset.fightModeColor,
        scoreColor: preset.scoreColor || defaultPreset.scoreColor,
        textOutlineColor:
          preset.textOutlineColor || defaultPreset.textOutlineColor,
        commentatorTagColor:
          preset.commentatorTagColor || defaultPreset.commentatorTagColor,
        commentatorNamesColor:
          preset.commentatorNamesColor || defaultPreset.commentatorNamesColor,
      };

      // Обновим локально UI сразу
      setCustomColors(newColors);
      handleColorChange(newColors);

      // Посылаем на сервер
      if (connection && connection.state === 'Connected') {
        connection
          .invoke('ApplyColorPreset', preset.name)
          .catch((err: Error) => {
            console.error('Error applying color preset:', err);
          });
      }
    },
    [connection, handleColorChange]
  );

  const handleCustomColorChange = useCallback(
    (field: keyof typeof customColors, value: string) => {
      const newColors = { ...customColors, [field]: value };
      setCustomColors(newColors);
      handleColorChange(newColors);
    },
    [customColors, handleColorChange]
  );

  const handleSavePreset = useCallback(async () => {
    if (!presetName.trim()) {
      alert('Пожалуйста, введите название пресета');
      return;
    }

    const newPreset: ColorPresetModel = {
      name: presetName.trim(),
      playerNamesColor: customColors.playerNamesColor,
      tournamentTitleColor: customColors.tournamentTitleColor,
      fightModeColor: customColors.fightModeColor,
      scoreColor: customColors.scoreColor,
      textOutlineColor: customColors.textOutlineColor,
      commentatorTagColor: customColors.commentatorTagColor,
      commentatorNamesColor: customColors.commentatorNamesColor,
    };

    try {
      const response = await fetch('/api/ColorPresets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreset),
      });

      if (response.ok) {
        // Обновляем список пресетов
        if (connection && connection.state === 'Connected') {
          await connection.invoke('GetColorPresets');
        }
        setPresetName('');
        alert(`Пресет "${newPreset.name}" успешно сохранен!`);
      } else {
        alert('Ошибка при сохранении пресета');
      }
    } catch (error) {
      console.error('Error saving preset:', error);
      alert('Ошибка при сохранении пресета');
    }
  }, [presetName, customColors, connection]);

  const handleDeletePreset = useCallback(async () => {
    if (!selectedPresetToDelete) {
      alert('Пожалуйста, выберите пресет для удаления');
      return;
    }

    if (
      !confirm(
        `Вы уверены, что хотите удалить пресет "${selectedPresetToDelete}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/ColorPresets/${encodeURIComponent(selectedPresetToDelete)}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Обновляем список пресетов
        if (connection && connection.state === 'Connected') {
          await connection.invoke('GetColorPresets');
        }
        setSelectedPresetToDelete('');
        alert(`Пресет "${selectedPresetToDelete}" успешно удален!`);
      } else {
        alert('Ошибка при удалении пресета');
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      alert('Ошибка при удалении пресета');
    }
  }, [selectedPresetToDelete, connection]);
  return (
    <Card className={styles.colorPresetCard}>
      <Card.Body>
        <div className={styles.cardHeader}>
          <Palette color='#6f42c1' size={22} />
          <span className={styles.cardTitle}>Color Presets</span>
        </div>

        <Row className='g-3'>
          {/* ОБЛАСТЬ 1: Пресеты цветов */}
          <Col xs={12} lg={5}>
            <div className={styles.presetsArea}>
              <div className={styles.areaHeader}>
                <h6 className={styles.areaTitle}>Доступные пресеты</h6>
              </div>
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
          </Col>

          {/* ОБЛАСТЬ 2: Управление пресетами */}
          <Col xs={12} lg={7}>
            <div className={styles.managementArea}>
              <div className={styles.areaHeader}>
                <h6 className={styles.areaTitle}>Создание и управление</h6>
              </div>

              {/* Настройка цветов */}
              <div className={styles.colorSettings}>
                {/* Первый ряд */}
                <Row className='g-3 mb-3 justify-content-center'>
                  <Col xs={12} md={6} className={styles.colorField}>
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
                  <Col xs={12} md={6} className={styles.colorField}>
                    <Form.Group>
                      <Form.Label className={styles.fieldLabel}>
                        Player Tags
                      </Form.Label>
                      <ColorPickerWithTransparency
                        value={customColors.playerTagsColor as string}
                        onChange={value =>
                          handleCustomColorChange('playerTagsColor', value)
                        }
                        placeholder='hex или rgba'
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Второй ряд */}
                <Row className='g-3 mb-3 justify-content-center'>
                  <Col xs={12} md={6} className={styles.colorField}>
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
                  <Col xs={12} md={6} className={styles.colorField}>
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
                </Row>
                {/* Третий ряд - обводка текста */}
                <Row className='g-3 mb-3 justify-content-center'>
                  <Col xs={12} md={6} className={styles.colorField}>
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
                  <Col xs={12} md={12} className={styles.colorField}>
                    <Form.Group>
                      <Form.Label className={styles.fieldLabel}>
                        Text Outline
                      </Form.Label>
                      <ColorPickerWithTransparency
                        value={customColors.textOutlineColor as string}
                        onChange={value =>
                          handleCustomColorChange('textOutlineColor', value)
                        }
                        placeholder='hex или rgba'
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Блок настроек для комментаторов */}
              <div
                className={styles.colorSettings}
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '2px solid #6f42c1',
                }}
              >
                <div
                  className={styles.areaHeader}
                  style={{ marginBottom: '16px' }}
                >
                  <h6 className={styles.areaTitle}>Commentators Colors</h6>
                </div>
                {/* Цвета комментаторов */}
                <Row className='g-3 justify-content-center'>
                  <Col xs={12} md={6} className={styles.colorField}>
                    <Form.Group>
                      <Form.Label className={styles.fieldLabel}>
                        Commentator Names
                      </Form.Label>
                      <ColorPickerWithTransparency
                        value={customColors.commentatorNamesColor as string}
                        onChange={value =>
                          handleCustomColorChange(
                            'commentatorNamesColor',
                            value
                          )
                        }
                        placeholder='hex или rgba'
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} className={styles.colorField}>
                    <Form.Group>
                      <Form.Label className={styles.fieldLabel}>
                        Commentator Tag Color
                      </Form.Label>
                      <ColorPickerWithTransparency
                        value={customColors.commentatorTagColor as string}
                        onChange={value =>
                          handleCustomColorChange('commentatorTagColor', value)
                        }
                        placeholder='hex или rgba'
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Блок управления сохранением/удалением */}
              <div className={styles.presetActions}>
                <Row className='g-2 align-items-end'>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className={styles.fieldLabel}>
                        Название пресета
                      </Form.Label>
                      <Form.Control
                        type='text'
                        value={presetName}
                        onChange={e => setPresetName(e.target.value)}
                        placeholder='Введите название'
                        className={`${styles.presetNameInput} bg-dark text-white border-secondary`}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={2}>
                    <Button
                      variant='success'
                      size='sm'
                      onClick={handleSavePreset}
                      disabled={!presetName.trim()}
                      className='w-100 fw-bold'
                    >
                      Сохранить
                    </Button>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className={styles.fieldLabel}>
                        Удалить пресет
                      </Form.Label>
                      <Form.Select
                        value={selectedPresetToDelete}
                        onChange={e =>
                          setSelectedPresetToDelete(e.target.value)
                        }
                        className={`${styles.presetSelect} bg-dark text-white border-secondary`}
                      >
                        <option value=''>Выберите пресет</option>
                        {colorPresets.map(preset => (
                          <option key={preset.name} value={preset.name}>
                            {preset.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={2}>
                    <Button
                      variant='danger'
                      size='sm'
                      onClick={handleDeletePreset}
                      disabled={!selectedPresetToDelete}
                      className='w-100 fw-bold'
                    >
                      Удалить
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default memo(ColorPresetCard);
