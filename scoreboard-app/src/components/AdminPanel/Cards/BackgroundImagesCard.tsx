import React, { useCallback, useRef } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Image } from 'react-bootstrap-icons';
import { BackgroundImage, ImageType, Images } from '../../../types/types';
import { BackgroundImageService } from '../services/BackgroundImagesService';
import styles from './BackgroundImagesCard.module.scss';

interface BackgroundImagesCardProps {
  backgroundImages: Images;
  onBackgroundImagesChange: (backgroundImages: Images) => void;
}

const BackgroundImagesCard: React.FC<BackgroundImagesCardProps> = ({
  backgroundImages,
  onBackgroundImagesChange,
}) => {
  const fileInputRefs: Record<
    ImageType,
    React.RefObject<HTMLInputElement | null>
  > = {
    [ImageType.TopImage]: useRef<HTMLInputElement>(null),
    [ImageType.LeftImage]: useRef<HTMLInputElement>(null),
    [ImageType.RightImage]: useRef<HTMLInputElement>(null),
    [ImageType.FightModeImage]: useRef<HTMLInputElement>(null),
    [ImageType.None]: useRef<HTMLInputElement>(null),
  };

  const IMAGE_TYPE_TO_FIELD: Record<ImageType, keyof Images | undefined> = {
    [ImageType.TopImage]: 'centerImage',
    [ImageType.LeftImage]: 'leftImage',
    [ImageType.RightImage]: 'rightImage',
    [ImageType.FightModeImage]: 'fightModeImage',
    [ImageType.None]: undefined,
  };

  const handleImageUpload = useCallback(
    async (
      imageType: ImageType,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      const field = IMAGE_TYPE_TO_FIELD[imageType];
      if (!field) {
        return;
      }

      try {
        await BackgroundImageService.updateImage(imageType, file);
      } catch (e: any) {
        alert('Не удалось загрузить изображение: ' + (e.message || e));
        onBackgroundImagesChange({
          ...backgroundImages,
          [field]: undefined,
        });
        const input = fileInputRefs[imageType].current;
        if (input) input.value = '';
      }
    },
    [backgroundImages, onBackgroundImagesChange, fileInputRefs]
  );

  const handleRemoveImage = useCallback(
    async (imageType: ImageType) => {
      const field = IMAGE_TYPE_TO_FIELD[imageType];
      if (!field) return;

      try {
        await BackgroundImageService.deleteImage(imageType);
      } catch (e: any) {
        alert('Не удалось удалить изображение: ' + (e.message || e));
        return;
      }

      onBackgroundImagesChange({
        ...backgroundImages,
        [field]: undefined,
      });
      const input = fileInputRefs[imageType].current;
      if (input) {
        input.value = '';
      }
    },
    [backgroundImages, onBackgroundImagesChange, fileInputRefs]
  );

  const handleClearAll = useCallback(() => {
    // Очищаем все inputs
    [
      ImageType.TopImage,
      ImageType.LeftImage,
      ImageType.RightImage,
      ImageType.FightModeImage,
    ].forEach(t => {
      const ref = fileInputRefs[t];
      if (ref?.current) ref.current.value = '';
    });
    BackgroundImageService.deleteAllImages();
  }, [onBackgroundImagesChange, fileInputRefs]);

  const handleContainerClick = useCallback(
    (imageType: ImageType) => {
      const ref = fileInputRefs[imageType];
      if (ref?.current) {
        ref.current.click();
      }
    },
    [fileInputRefs]
  );

  const ImageUploadField = useCallback(
    ({ field, label }: { field: ImageType; label: string }) => {
      const f = IMAGE_TYPE_TO_FIELD[field];
      const backgroundImage = f
        ? (backgroundImages[f] as BackgroundImage | undefined)
        : undefined;
      const hasImage = f ? backgroundImage?.isShouldExists : undefined;

      return (
        <Col md={6} className='mb-3'>
          <Form.Group>
            <Form.Label className={styles.brightLabel}>{label}</Form.Label>
            <div
              className={styles.imageUploadContainer}
              onClick={() => handleContainerClick(field)}
            >
              {hasImage ? (
                <div className={styles.imagePreview}>
                  <img
                    src={
                      '/Images/' +
                      (hasImage ? backgroundImage?.imageName || '' : '')
                    }
                    alt={`Preview for ${label}`}
                    className={styles.previewImage}
                  />
                  <Button
                    variant='danger'
                    size='sm'
                    className={styles.removeButton}
                    onClick={e => {
                      e.stopPropagation();
                      debugger;
                      handleRemoveImage(field);
                    }}
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
                ref={fileInputRefs[field] as React.RefObject<HTMLInputElement>}
                type='file'
                accept='image/*'
                onChange={e => handleImageUpload(field, e)}
                className={styles.hiddenInput}
              />
            </div>
            {/* Описание перемещено в общий блок снизу карточки */}
          </Form.Group>
        </Col>
      );
    },
    [backgroundImages, handleRemoveImage, handleImageUpload, fileInputRefs]
  );

  return (
    <Card className={`mb-4 ${styles.backgroundImagesCard}`}>
      <Card.Body>
        <div className={styles.cardHeader}>
          <Image color='#28a745' size={22} />
          <span className={styles.cardTitle}>Фоновые изображения</span>
        </div>
        <Row>
          <ImageUploadField
            field={ImageType.TopImage}
            label='Центральный блок (название турнира)'
          />
          <ImageUploadField
            field={ImageType.LeftImage}
            label='Левый блок (игрок 1)'
          />
        </Row>
        <Row>
          <ImageUploadField
            field={ImageType.RightImage}
            label='Правый блок (игрок 2)'
          />
          <ImageUploadField
            field={ImageType.FightModeImage}
            label='Блок режима драки'
          />
        </Row>

        <Form.Text className={styles.commonDescription}>
          Изображение будет отображаться растянутыми на весь блок
        </Form.Text>

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
