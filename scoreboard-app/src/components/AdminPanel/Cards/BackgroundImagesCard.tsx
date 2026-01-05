import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Image } from 'react-bootstrap-icons';
import { BackgroundImages } from '../../../types/types';
import { BackgroundImageService } from '../../../services/BackgroundImageService';
import styles from './BackgroundImagesCard.module.scss';

interface BackgroundImagesCardProps {
  backgroundImages: BackgroundImages;
  onBackgroundImagesChange: (backgroundImages: BackgroundImages) => void;
}

const BackgroundImagesCard: React.FC<BackgroundImagesCardProps> = ({
  backgroundImages,
  onBackgroundImagesChange,
}) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forceRender, setForceRender] = useState<number>(0);

  // Функции для управления сообщениями
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const setErrorMessage = useCallback((message: string) => {
    console.log('Устанавливаем ошибку:', message);
    setError(message);
    setSuccess(null);
    setForceRender(prev => prev + 1);
  }, []);

  const setSuccessMessage = useCallback((message: string) => {
    console.log('Устанавливаем успех:', message);
    setSuccess(message);
    setError(null);
    setForceRender(prev => prev + 1);
  }, []);

  // Автоочистка сообщений через 5 секунд
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success, clearMessages]);

  const fileInputRefs = {
    centerImage: useRef<HTMLInputElement>(null),
    leftImage: useRef<HTMLInputElement>(null),
    rightImage: useRef<HTMLInputElement>(null),
    fightModeImage: useRef<HTMLInputElement>(null),
  };

  const handleImageUpload = useCallback(async (field: keyof BackgroundImages, event: React.ChangeEvent<HTMLInputElement>) => {
    debugger;
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Пожалуйста, выберите файл изображения');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(field);
    clearMessages();

    try {
      console.log('Начинаем загрузку изображения:', field, file.name);
      const response = await BackgroundImageService.uploadImage(field, file);
      console.log('Загрузка успешна:', response);
      
      // Обновляем состояние с путем к изображению
      onBackgroundImagesChange({
        ...backgroundImages,
        [field]: response.imagePath,
      });
      
      setSuccessMessage(`Изображение ${field} успешно загружено`);
    } catch (err) {
      console.error('Ошибка загрузки изображения:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке изображения';
      console.log('Устанавливаем ошибку:', errorMessage);
      setErrorMessage(errorMessage);
      
      // Очищаем input в случае ошибки
      const input = fileInputRefs[field].current;
      if (input) {
        input.value = '';
      }
    } finally {
      setUploading(null);
    }
  }, [backgroundImages, onBackgroundImagesChange, clearMessages, setErrorMessage, setSuccessMessage]);

  const handleRemoveImage = useCallback(async (field: keyof BackgroundImages) => {
    clearMessages();

    try {
      await BackgroundImageService.deleteImage(field);
      
      // Обновляем состояние, удаляя изображение
      onBackgroundImagesChange({
        ...backgroundImages,
        [field]: '',
      });
      
      // Очищаем input
      const input = fileInputRefs[field].current;
      if (input) {
        input.value = '';
      }
      
      setSuccessMessage(`Изображение ${field} успешно удалено`);
    } catch (err) {
      console.error('Ошибка удаления изображения:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении изображения';
      setErrorMessage(errorMessage);
    }
  }, [backgroundImages, onBackgroundImagesChange, clearMessages, setErrorMessage, setSuccessMessage]);

  const handleClearAll = useCallback(async () => {
    clearMessages();
    setClearingAll(true);

    try {
      // Удаляем только те изображения, которые действительно есть
      const deletePromises = Object.keys(backgroundImages)
        .filter(field => backgroundImages[field as keyof BackgroundImages])
        .map(field => BackgroundImageService.deleteImage(field));
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
      
      onBackgroundImagesChange({});
      
      // Очищаем все inputs
      Object.values(fileInputRefs).forEach(ref => {
        if (ref.current) {
          ref.current.value = '';
        }
      });
      
      setSuccessMessage('Все изображения успешно удалены');
    } catch (err) {
      console.error('Ошибка удаления всех изображений:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении изображений';
      setErrorMessage(errorMessage);
    } finally {
      setClearingAll(false);
    }
  }, [backgroundImages, onBackgroundImagesChange, clearMessages, setErrorMessage, setSuccessMessage]);

  const ImageUploadField = ({ 
    field, 
    label, 
    description 
  }: { 
    field: keyof BackgroundImages; 
    label: string; 
    description: string; 
  }) => {
    const hasImage = backgroundImages[field];
    const isUploading = uploading === field;
    const imageUrl = BackgroundImageService.getImageUrl(hasImage);
    
    return (
      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label className={styles.formLabel}>{label}</Form.Label>
          <div className={styles.imageUploadContainer}>
            {hasImage && imageUrl ? (
              <div className={styles.imagePreview}>
                <img 
                  src={imageUrl} 
                  alt={`Preview for ${label}`}
                  className={styles.previewImage}
                />
                <Button
                  variant="danger"
                  size="sm"
                  className={styles.removeButton}
                  onClick={() => handleRemoveImage(field)}
                  disabled={isUploading}
                >
                  ×
                </Button>
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <div className={styles.uploadIcon}>
                  {isUploading ? '⏳' : '📷'}
                </div>
                <div className={styles.uploadText}>
                  {isUploading ? 'Загрузка...' : 'Нажмите для загрузки'}
                </div>
              </div>
            )}
            <input
              ref={fileInputRefs[field]}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(field, e)}
              className={styles.hiddenInput}
              disabled={isUploading}
            />
          </div>
          <Form.Text className={styles.formText}>
            {description}
          </Form.Text>
        </Form.Group>
      </Col>
    );
  };

  // Отладочная информация
  console.log('Рендер BackgroundImagesCard:', { error, success, forceRender });

  return (
    <Card className={styles.backgroundImagesCard}>
      <Card.Body className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <Image color="#6f42c1" size={20} />
          <span className={styles.cardTitle}>
            Фоновые изображения
          </span>
        </div>
        
        {error && (
          <Alert 
            variant="danger" 
            className="mb-3"
            dismissible
            onClose={clearMessages}
          >
            <strong>Ошибка:</strong> {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            variant="success" 
            className="mb-3"
            dismissible
            onClose={clearMessages}
          >
            <strong>Успех:</strong> {success}
          </Alert>
        )}
        <Row>
          <ImageUploadField
            field="centerImage"
            label="Центральный блок (название турнира)"
            description="Изображение будет отображаться по центру блока"
          />
          <ImageUploadField
            field="leftImage"
            label="Левый блок (игрок 1)"
            description="Изображение будет отображаться по центру блока"
          />
        </Row>
        <Row>
          <ImageUploadField
            field="rightImage"
            label="Правый блок (игрок 2)"
            description="Изображение будет отображаться по центру блока"
          />
          <ImageUploadField
            field="fightModeImage"
            label="Блок режима драки"
            description="Изображение будет отображаться по центру блока"
          />
        </Row>
        
        <div className="mt-3 d-flex gap-2">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleClearAll}
            className={styles.btnOutlineDanger}
            disabled={clearingAll || Object.values(backgroundImages).filter(img => img).length === 0}
          >
            {clearingAll ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Удаление...
              </>
            ) : (
              'Удалить все изображения'
            )}
          </Button>
          
          {/* Временная кнопка для тестирования ошибок */}
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => setErrorMessage('Тестовая ошибка для проверки отображения')}
            className="btn btn-outline-warning"
          >
            Тест ошибки
          </Button>
          
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => setSuccessMessage('Тестовое успешное сообщение')}
            className="btn btn-outline-info"
          >
            Тест успеха
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BackgroundImagesCard;





