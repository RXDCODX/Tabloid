import React, { useRef } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { BackgroundImages } from '../../../types/types';
import styles from './BackgroundImagesCard.module.scss';

interface BackgroundImagesCardProps {
  backgroundImages: BackgroundImages;
  onBackgroundImagesChange: (backgroundImages: BackgroundImages) => void;
}

const BackgroundImagesCard: React.FC<BackgroundImagesCardProps> = ({
  backgroundImages,
  onBackgroundImagesChange,
}) => {
  const fileInputRefs = {
    center: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
    fightMode: useRef<HTMLInputElement>(null),
  };

  const handleImageUpload = (field: keyof BackgroundImages, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onBackgroundImagesChange({
        ...backgroundImages,
        [field]: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: keyof BackgroundImages) => {
    onBackgroundImagesChange({
      ...backgroundImages,
      [field]: '',
    });
    // Очищаем input
    const input = fileInputRefs[field].current;
    if (input) {
      input.value = '';
    }
  };

  const handleClearAll = () => {
    onBackgroundImagesChange({});
    // Очищаем все inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
  };

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
    
    return (
      <Col md={6} className="mb-3">
        <Form.Group>
          <Form.Label>{label}</Form.Label>
          <div className={styles.imageUploadContainer}>
            {hasImage ? (
              <div className={styles.imagePreview}>
                <img 
                  src={hasImage} 
                  alt={`Preview for ${label}`}
                  className={styles.previewImage}
                />
                <Button
                  variant="danger"
                  size="sm"
                  className={styles.removeButton}
                  onClick={() => handleRemoveImage(field)}
                >
                  ×
                </Button>
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <div className={styles.uploadIcon}>📷</div>
                <div className={styles.uploadText}>Нажмите для загрузки</div>
              </div>
            )}
            <input
              ref={fileInputRefs[field]}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(field, e)}
              className={styles.hiddenInput}
            />
          </div>
          <Form.Text className="text-muted">
            {description}
          </Form.Text>
        </Form.Group>
      </Col>
    );
  };

  return (
    <Card className={`mb-4 ${styles.backgroundImagesCard}`}>
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">Фоновые изображения</h5>
      </Card.Header>
      <Card.Body>
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
        
        <div className="mt-3">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleClearAll}
          >
            Удалить все изображения
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BackgroundImagesCard;





