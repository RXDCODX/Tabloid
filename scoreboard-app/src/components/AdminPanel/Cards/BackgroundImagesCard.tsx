import React, { useCallback, useRef } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Image } from 'react-bootstrap-icons';
import { BackgroundImages } from '../../../types/types';
import { BackgroundImageService } from '../services/BackgroundImagesService';
import styles from './BackgroundImagesCard.module.scss';

interface BackgroundImagesCardProps {
  backgroundImages: BackgroundImages;
  onBackgroundImagesChange: (backgroundImages: BackgroundImages) => void;
}

const BackgroundImagesCard: React.FC<BackgroundImagesCardProps> = ({
  backgroundImages,
  onBackgroundImagesChange,
}) => {
  const fileInputRefs: Record<
    keyof BackgroundImages,
    React.RefObject<HTMLInputElement | null>
  > = {
    centerImage: useRef<HTMLInputElement>(null),
    leftImage: useRef<HTMLInputElement>(null),
    rightImage: useRef<HTMLInputElement>(null),
    fightModeImage: useRef<HTMLInputElement>(null),
  };

  const mapFieldToImageType = (field: keyof BackgroundImages) => {
    switch (field) {
      case 'centerImage':
        return 'CenterImage';
      case 'leftImage':
        return 'LeftImage';
      case 'rightImage':
        return 'RightImage';
      case 'fightModeImage':
        return 'FightModeImage';
      default:
        return '';
    }
  };

  const handleImageUpload = useCallback(
    async (
      field: keyof BackgroundImages,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      // Показываем локальное превью сразу
      const previewUrl = URL.createObjectURL(file);
      onBackgroundImagesChange({
        ...backgroundImages,
        [field]: previewUrl,
      });

      const imageType = mapFieldToImageType(field);
      try {
        await BackgroundImageService.updateImage(imageType, file);
      } catch (e: any) {
        alert('Не удалось загрузить изображение: ' + (e.message || e));
        onBackgroundImagesChange({
          ...backgroundImages,
          [field]: '',
        });
        const input = fileInputRefs[field].current;
        if (input) input.value = '';
      }
    },
    [backgroundImages, onBackgroundImagesChange, fileInputRefs]
  );

  const handleRemoveImage = useCallback(
    async (field: keyof BackgroundImages) => {
      const imageType = mapFieldToImageType(field);
      try {
        await BackgroundImageService.deleteImage(imageType);
      } catch (e: any) {
        alert('Не удалось удалить изображение: ' + (e.message || e));
        return;
      }

      onBackgroundImagesChange({
        ...backgroundImages,
        [field]: '',
      });
      const input = fileInputRefs[field].current;
      if (input) {
        input.value = '';
      }
    },
    [backgroundImages, onBackgroundImagesChange, fileInputRefs]
  );

  const handleClearAll = useCallback(() => {
    onBackgroundImagesChange({});
    // Очищаем все inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
  }, [onBackgroundImagesChange, fileInputRefs]);

  const ImageUploadField = ({
    field,
    label,
    description,
  }: {
    field: keyof BackgroundImages;
    label: string;
    description: string;
  }) => {
    const hasImage = backgroundImages[field];

    return (
      <Col md={6} className='mb-3'>
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
                  variant='danger'
                  size='sm'
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
              type='file'
              accept='image/*'
              onChange={e => handleImageUpload(field, e)}
              className={styles.hiddenInput}
            />
          </div>
          <Form.Text className='text-muted'>{description}</Form.Text>
        </Form.Group>
      </Col>
    );
  };

  return (
    <Card className={`mb-4 ${styles.backgroundImagesCard}`}>
      <Card.Body>
        <div className={styles.cardHeader}>
          <Image color='#28a745' size={22} />
          <span className={styles.cardTitle}>Фоновые изображения</span>
        </div>
        <Row>
          <ImageUploadField
            field='centerImage'
            label='Центральный блок (название турнира)'
            description='Изображение будет отображаться по центру блока'
          />
          <ImageUploadField
            field='leftImage'
            label='Левый блок (игрок 1)'
            description='Изображение будет отображаться по центру блока'
          />
        </Row>
        <Row>
          <ImageUploadField
            field='rightImage'
            label='Правый блок (игрок 2)'
            description='Изображение будет отображаться по центру блока'
          />
          <ImageUploadField
            field='fightModeImage'
            label='Блок режима драки'
            description='Изображение будет отображаться по центру блока'
          />
        </Row>

        <div className='mt-3'>
          <Button variant='outline-danger' size='sm' onClick={handleClearAll}>
            Удалить все изображения
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BackgroundImagesCard;
