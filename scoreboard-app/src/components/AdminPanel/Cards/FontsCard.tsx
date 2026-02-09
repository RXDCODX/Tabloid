import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Archive } from 'react-bootstrap-icons';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../../store/adminStateStore';
import { FontConfiguration } from '../../../types/types';
import { FontsService } from '../services/FontsService';
import styles from './FontsCard.module.scss';

type FontsCardProps = {
  // No external props needed
};

type FontMetadata = {
  fontName: string;
  fileName: string;
  contentType: string;
  uploadedAt: number;
  fileSize: number;
};

const FontsCard: React.FC<FontsCardProps> = () => {
  console.log('[FontsCard] Render');

  const [fonts, setFonts] = useState<FontMetadata[]>([]);
  const [fontName, setFontName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useFileName, setUseFileName] = useState<boolean>(false);
  const [selectedFontToDelete, setSelectedFontToDelete] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fontConfig = useAdminStore(useShallow(s => s.fontConfig));
  const setFontConfiguration = useAdminStore(s => s.setFontConfiguration);

  // Load fonts on component mount
  useEffect(() => {
    loadFonts();
  }, []);

  // Dynamically load fonts with @font-face
  useEffect(() => {
    const styleId = 'fonts-dynamic-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Create @font-face rules for all fonts
    const fontFaceRules = fonts
      .map(font => {
        const fontUrl = FontsService.getFontUrl(font.fontName, font.uploadedAt);
        return `
          @font-face {
            font-family: '${font.fontName}';
            src: url('${fontUrl}');
            font-display: swap;
          }
        `;
      })
      .join('\n');

    styleElement.textContent = fontFaceRules;

    return () => {
      // Cleanup on unmount
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [fonts]);

  const loadFonts = useCallback(async () => {
    try {
      const loadedFonts = await FontsService.getAllFonts();
      setFonts(loadedFonts);
      console.log('[FontsCard] Loaded fonts:', loadedFonts);
    } catch (err) {
      console.error('Error loading fonts:', err);
      setMessage({
        type: 'error',
        text: 'Ошибка при загрузке списка шрифтов',
      });
    }
  }, []);

  const getFontNameFromFile = useCallback((fileName: string): string => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  }, []);

  const handleFileSelected = useCallback(
    (file: File) => {
      setSelectedFile(file);
      if (useFileName) {
        setFontName(getFontNameFromFile(file.name));
      }
      console.log('[FontsCard] Selected file:', file.name);
    },
    [useFileName, getFontNameFromFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelected(e.target.files[0]);
      }
    },
    [handleFileSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelected]
  );

  const handleInputDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    },
    []
  );

  const handleInputDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      handleFileSelected(file);
    },
    [handleFileSelected]
  );

  const handleUseFileNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setUseFileName(checked);
      if (checked && selectedFile) {
        setFontName(getFontNameFromFile(selectedFile.name));
      }
    },
    [selectedFile, getFontNameFromFile]
  );

  const handleUploadFont = useCallback(async () => {
    if (!fontName.trim()) {
      setMessage({
        type: 'error',
        text: 'Пожалуйста, введите название шрифта',
      });
      return;
    }

    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: 'Пожалуйста, выберите файл шрифта',
      });
      return;
    }

    // Validate file extension
    const allowedExtensions = ['.ttf', '.otf', '.woff', '.woff2', '.eot'];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf('.'))
      .toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setMessage({
        type: 'error',
        text: `Неподдерживаемый формат шрифта. Разрешённые форматы: ${allowedExtensions.join(', ')}`,
      });
      return;
    }

    setLoading(true);
    try {
      await FontsService.uploadFont(fontName.trim(), selectedFile);
      setMessage({
        type: 'success',
        text: `Шрифт "${fontName}" успешно загружен!`,
      });
      setFontName('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh fonts list
      await loadFonts();

      console.log('[FontsCard] Font uploaded successfully:', fontName);
    } catch (err) {
      console.error('Error uploading font:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ошибка при загрузке шрифта',
      });
    } finally {
      setLoading(false);
    }
  }, [fontName, selectedFile, loadFonts]);

  const handleDeleteFont = useCallback(async () => {
    if (!selectedFontToDelete) {
      setMessage({
        type: 'error',
        text: 'Пожалуйста, выберите шрифт для удаления',
      });
      return;
    }

    if (
      !confirm(
        `Вы уверены, что хотите удалить шрифт "${selectedFontToDelete}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await FontsService.deleteFont(selectedFontToDelete);
      setMessage({
        type: 'success',
        text: `Шрифт "${selectedFontToDelete}" успешно удален!`,
      });

      // Clear the deleted font from configuration if it's being used
      const updatedConfig = { ...fontConfig };
      let configChanged = false;

      (Object.keys(updatedConfig) as Array<keyof FontConfiguration>).forEach(
        key => {
          if (updatedConfig[key] === selectedFontToDelete) {
            updatedConfig[key] = '';
            configChanged = true;
          }
        }
      );

      if (configChanged) {
        setFontConfiguration(updatedConfig);
      }

      setSelectedFontToDelete('');

      // Refresh fonts list
      await loadFonts();

      console.log(
        '[FontsCard] Font deleted successfully:',
        selectedFontToDelete
      );
    } catch (err) {
      console.error('Error deleting font:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ошибка при удалении шрифта',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedFontToDelete, loadFonts, fontConfig, setFontConfiguration]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFontConfigChange = useCallback(
    (field: keyof FontConfiguration, value: string) => {
      const newConfig = { ...fontConfig, [field]: value };
      setFontConfiguration(newConfig);
    },
    [fontConfig, setFontConfiguration]
  );

  const getLabelStyle = useCallback((fontName: string): React.CSSProperties => {
    if (!fontName) return {};
    return {
      fontFamily: `'${fontName}', sans-serif`,
      fontSize: '1.1rem',
    };
  }, []);

  return (
    <Card className={styles.fontCard}>
      <Card.Body>
        <div className={styles.cardHeader}>
          <Archive color='#0dcaf0' size={22} />
          <span className={styles.cardTitle}>Font Manager</span>
        </div>

        <Row className='g-3'>
          {/* ОБЛАСТЬ 1: Список загруженных шрифтов */}
          <Col xs={12} lg={5}>
            <div className={styles.fontsArea}>
              <div className={styles.areaHeader}>
                <h6 className={styles.areaTitle}>Загруженные шрифты</h6>
              </div>
              <div className={styles.fontsContainer}>
                {fonts.length === 0 ? (
                  <div className={styles.emptyState}>
                    Нет загруженных шрифтов
                  </div>
                ) : (
                  fonts.map(font => (
                    <div
                      key={font.fontName}
                      className={`${styles.fontButton} ${selectedFontToDelete === font.fontName ? styles.fontButtonSelected : ''}`}
                      onClick={() => setSelectedFontToDelete(font.fontName)}
                      style={{ cursor: 'pointer' } as React.CSSProperties}
                    >
                      <div className={styles.fontInfo}>
                        <span className={styles.fontName}>{font.fontName}</span>
                        <div className={styles.fontMeta}>
                          {font.fileName}
                          <br />
                          {formatFileSize(font.fileSize)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Col>

          {/* ОБЛАСТЬ 2: Управление шрифтами */}
          <Col xs={12} lg={7}>
            <div className={styles.managementArea}>
              <div className={styles.areaHeader}>
                <h6 className={styles.areaTitle}>Загрузка и управление</h6>
              </div>

              {/* Upload Section */}
              <div
                className={`${styles.uploadSection} ${dragOver ? styles.dragOver : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label className={styles.uploadLabel}>
                  Загрузить новый шрифт
                </label>

                <div className={styles.nameRow}>
                  <Form.Group className={styles.nameGroup}>
                    <Form.Label className={styles.fieldLabel}>
                      Название шрифта
                    </Form.Label>
                    <Form.Control
                      type='text'
                      value={fontName}
                      onChange={e => setFontName(e.target.value)}
                      placeholder='Введите название'
                      className='bg-dark text-white border-secondary'
                      disabled={loading || useFileName}
                    />
                  </Form.Group>
                  <Form.Check
                    type='checkbox'
                    checked={useFileName}
                    onChange={handleUseFileNameChange}
                    label='Брать название из файла'
                    className={styles.useFileName}
                    disabled={loading}
                  />
                </div>

                <div
                  className={styles.fileRow}
                  onDragOver={handleInputDragOver}
                  onDrop={handleInputDrop}
                >
                  <Form.Group className={styles.fileGroup}>
                    <Form.Label className={styles.fieldLabel}>
                      Файл шрифта
                    </Form.Label>
                    <Form.Control
                      type='file'
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept='.ttf,.otf,.woff,.woff2,.eot'
                      className='bg-dark text-white border-secondary'
                      disabled={loading}
                    />
                  </Form.Group>
                </div>

                <div className={styles.uploadRow}>
                  <Button
                    variant='info'
                    size='sm'
                    onClick={handleUploadFont}
                    disabled={!fontName.trim() || !selectedFile || loading}
                    className={`${styles.uploadButton} fw-bold`}
                  >
                    {loading ? (
                      <>
                        <span className={styles.loadingSpinner}>⏳</span>{' '}
                        Загрузка...
                      </>
                    ) : (
                      'Загрузить'
                    )}
                  </Button>
                </div>

                {selectedFile && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      color: '#0dcaf0',
                      fontSize: '0.85rem',
                    }}
                  >
                    ✓ Выбран: {selectedFile.name}
                  </div>
                )}
              </div>

              {/* Status Message */}
              {message && (
                <div
                  className={
                    message.type === 'success'
                      ? styles.successMessage
                      : styles.errorMessage
                  }
                >
                  {message.type === 'success' ? '✓' : '✗'} {message.text}
                </div>
              )}

              {/* Delete Section */}
              <div className={styles.fontActions}>
                <div className={styles.actionRow}>
                  <Form.Group className={styles.deleteSection}>
                    <Form.Label className={styles.fieldLabel}>
                      Удалить шрифт
                    </Form.Label>
                    <Form.Select
                      value={selectedFontToDelete}
                      onChange={e => setSelectedFontToDelete(e.target.value)}
                      className={`${styles.fontSelect} bg-dark text-white border-secondary`}
                      disabled={loading}
                    >
                      <option value=''>Выберите шрифт</option>
                      {fonts.map(font => (
                        <option key={font.fontName} value={font.fontName}>
                          {font.fontName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className={styles.deleteRow}>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={handleDeleteFont}
                    disabled={!selectedFontToDelete || loading}
                    className={`${styles.deleteButton} fw-bold`}
                  >
                    {loading ? (
                      <>
                        <span className={styles.loadingSpinner}>⏳</span>{' '}
                        Удаление...
                      </>
                    ) : (
                      'Удалить'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* ОБЛАСТЬ 3: Конфигурация шрифтов */}
        <Row className='g-3 mt-3'>
          <Col xs={12}>
            <div className={styles.fontConfigArea}>
              <div className={styles.areaHeader}>
                <h6 className={styles.areaTitle}>Применение шрифтов</h6>
              </div>

              <div className={styles.fontConfigList}>
                <div className={styles.fontConfigItem}>
                  <Form.Label
                    className={styles.fontConfigLabel}
                    style={getLabelStyle(fontConfig.PlayerNameFont)}
                  >
                    Имена игроков
                  </Form.Label>
                  <Form.Select
                    value={fontConfig.PlayerNameFont}
                    onChange={e =>
                      handleFontConfigChange('PlayerNameFont', e.target.value)
                    }
                    className={`${styles.fontConfigSelect} bg-dark text-white border-secondary`}
                    disabled={loading}
                  >
                    <option value=''>По умолчанию</option>
                    {fonts.map(font => (
                      <option key={font.fontName} value={font.fontName}>
                        {font.fontName}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className={styles.fontConfigItem}>
                  <Form.Label
                    className={styles.fontConfigLabel}
                    style={getLabelStyle(fontConfig.PlayerTagFont)}
                  >
                    Теги игроков
                  </Form.Label>
                  <Form.Select
                    value={fontConfig.PlayerTagFont}
                    onChange={e =>
                      handleFontConfigChange('PlayerTagFont', e.target.value)
                    }
                    className={`${styles.fontConfigSelect} bg-dark text-white border-secondary`}
                    disabled={loading}
                  >
                    <option value=''>По умолчанию</option>
                    {fonts.map(font => (
                      <option key={font.fontName} value={font.fontName}>
                        {font.fontName}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className={styles.fontConfigItem}>
                  <Form.Label
                    className={styles.fontConfigLabel}
                    style={getLabelStyle(fontConfig.ScoreFont)}
                  >
                    Счет
                  </Form.Label>
                  <Form.Select
                    value={fontConfig.ScoreFont}
                    onChange={e =>
                      handleFontConfigChange('ScoreFont', e.target.value)
                    }
                    className={`${styles.fontConfigSelect} bg-dark text-white border-secondary`}
                    disabled={loading}
                  >
                    <option value=''>По умолчанию</option>
                    {fonts.map(font => (
                      <option key={font.fontName} value={font.fontName}>
                        {font.fontName}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className={styles.fontConfigItem}>
                  <Form.Label
                    className={styles.fontConfigLabel}
                    style={getLabelStyle(fontConfig.TournamentTitleFont)}
                  >
                    Название турнира
                  </Form.Label>
                  <Form.Select
                    value={fontConfig.TournamentTitleFont}
                    onChange={e =>
                      handleFontConfigChange(
                        'TournamentTitleFont',
                        e.target.value
                      )
                    }
                    className={`${styles.fontConfigSelect} bg-dark text-white border-secondary`}
                    disabled={loading}
                  >
                    <option value=''>По умолчанию</option>
                    {fonts.map(font => (
                      <option key={font.fontName} value={font.fontName}>
                        {font.fontName}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className={styles.fontConfigItem}>
                  <Form.Label
                    className={styles.fontConfigLabel}
                    style={getLabelStyle(fontConfig.FightModeFont)}
                  >
                    Режим драки
                  </Form.Label>
                  <Form.Select
                    value={fontConfig.FightModeFont}
                    onChange={e =>
                      handleFontConfigChange('FightModeFont', e.target.value)
                    }
                    className={`${styles.fontConfigSelect} bg-dark text-white border-secondary`}
                    disabled={loading}
                  >
                    <option value=''>По умолчанию</option>
                    {fonts.map(font => (
                      <option key={font.fontName} value={font.fontName}>
                        {font.fontName}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default memo(FontsCard);
