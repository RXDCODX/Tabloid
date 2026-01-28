import React, { memo, useCallback, useMemo } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Image } from 'react-bootstrap-icons';
import { useAdminStore } from '../../../store/adminStateStore';
import { BackgroundImage, ImageType, Images } from '../../../types/types';
import { BackgroundImageService } from '../services/BackgroundImagesService';
import styles from './BackgroundImagesCard.module.scss';

const IMAGE_TYPE_TO_FIELD: Record<ImageType, keyof Images | undefined> = {
  [ImageType.TopImage]: 'centerImage',
  [ImageType.LeftImage]: 'leftImage',
  [ImageType.RightImage]: 'rightImage',
  [ImageType.FightModeImage]: 'fightModeImage',
  [ImageType.None]: undefined,
};

interface ImageUploadFieldProps {
  field: ImageType;
  label: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (imageType: ImageType, file: File) => void;
  onRemoveImage: (imageType: ImageType) => void;
}

const ImageUploadField = memo<ImageUploadFieldProps>(
  ({ field, label, fileInputRef, onImageUpload, onRemoveImage }) => {
    const f = IMAGE_TYPE_TO_FIELD[field];
    const backgroundImage = useAdminStore(
      useCallback(
        s =>
          f
            ? (s.backgroundImages[f] as BackgroundImage | undefined)
            : undefined,
        [f]
      )
    );
    const hasImage = backgroundImage?.isShouldExists;

    const isVideo = useMemo(
      () =>
        hasImage && backgroundImage?.imageName
          ? /\.(mp4|webm|mov)$/i.test(backgroundImage.imageName)
          : false,
      [hasImage, backgroundImage?.imageName]
    );

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
          alert('Пожалуйста, выберите файл изображения или видео');
          return;
        }

        const allowedExtensions = [
          '.png',
          '.jpg',
          '.jpeg',
          '.gif',
          '.webp',
          '.mp4',
          '.webm',
          '.mov',
        ];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext =>
          fileName.endsWith(ext)
        );

        if (!hasValidExtension) {
          alert(
            'Поддерживаемые форматы: PNG, JPG, JPEG, GIF, WebP, MP4, WebM, MOV'
          );
          return;
        }

        onImageUpload(field, file);
      },
      [field, onImageUpload]
    );

    const handleContainerClick = useCallback(() => {
      fileInputRef.current?.click();
    }, [fileInputRef]);

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemoveImage(field);
      },
      [field, onRemoveImage]
    );

    return (
      <Col md={6} className='mb-3'>
        <Form.Group>
          <Form.Label className={styles.brightLabel}>{label}</Form.Label>
          <div
            className={styles.imageUploadContainer}
            onClick={handleContainerClick}
          >
            {hasImage ? (
              <div className={styles.imagePreview}>
                {isVideo ? (
                  <video
                    src={
                      '/Images/' +
                      (backgroundImage?.imageName || '') +
                      (backgroundImage?.uploadedAt
                        ? `?t=${backgroundImage.uploadedAt}`
                        : '')
                    }
                    className={styles.previewImage}
                    autoPlay
                    loop
                    muted
                    key={backgroundImage?.uploadedAt || 0}
                  />
                ) : (
                  <img
                    src={
                      '/Images/' +
                      (backgroundImage?.imageName || '') +
                      (backgroundImage?.uploadedAt
                        ? `?t=${backgroundImage.uploadedAt}`
                        : '')
                    }
                    alt={`Preview for ${label}`}
                    className={styles.previewImage}
                    key={backgroundImage?.uploadedAt || 0}
                  />
                )}
                <Button
                  variant='danger'
                  size='sm'
                  className={styles.removeButton}
                  onClick={handleRemove}
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
              ref={fileInputRef}
              type='file'
              accept='image/*,video/mp4,video/webm,video/quicktime'
              onChange={handleFileChange}
              className={styles.hiddenInput}
            />
          </div>
        </Form.Group>
      </Col>
    );
  }
);

ImageUploadField.displayName = 'ImageUploadField';

const BackgroundImagesCard: React.FC = () => {
  const fileInputRefs = useMemo(
    () => ({
      [ImageType.TopImage]: React.createRef<HTMLInputElement>(),
      [ImageType.LeftImage]: React.createRef<HTMLInputElement>(),
      [ImageType.RightImage]: React.createRef<HTMLInputElement>(),
      [ImageType.FightModeImage]: React.createRef<HTMLInputElement>(),
      [ImageType.None]: React.createRef<HTMLInputElement>(),
    }),
    []
  );

  const handleImageUpload = useCallback(
    async (imageType: ImageType, file: File) => {
      const field = IMAGE_TYPE_TO_FIELD[imageType];
      if (!field) return;

      try {
        await BackgroundImageService.updateImage(imageType, file);

        const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
        const imageName = `${imageType}${fileExtension}`;

        useAdminStore.getState().setBackgroundImages({
          ...useAdminStore.getState().backgroundImages,
          [field]: {
            imageName: imageName,
            isShouldExists: true,
            imageType: imageType,
            uploadedAt: Date.now(),
          },
        });
      } catch (e: any) {
        alert('Не удалось загрузить файл: ' + (e.message || e));
        useAdminStore.getState().setBackgroundImages({
          ...useAdminStore.getState().backgroundImages,
          [field]: undefined,
        });
        const input = fileInputRefs[imageType].current;
        if (input) input.value = '';
      }
    },
    [fileInputRefs]
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

      useAdminStore.getState().setBackgroundImages({
        ...useAdminStore.getState().backgroundImages,
        [field]: undefined,
      });
      const input = fileInputRefs[imageType].current;
      if (input) {
        input.value = '';
      }
    },
    [fileInputRefs]
  );

  const handleClearAll = useCallback(() => {
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
    useAdminStore.getState().setBackgroundImages({});
  }, [fileInputRefs]);

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
            fileInputRef={fileInputRefs[ImageType.TopImage]}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />
          <ImageUploadField
            field={ImageType.LeftImage}
            label='Левый блок (игрок 1)'
            fileInputRef={fileInputRefs[ImageType.LeftImage]}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />
        </Row>
        <Row>
          <ImageUploadField
            field={ImageType.RightImage}
            label='Правый блок (игрок 2)'
            fileInputRef={fileInputRefs[ImageType.RightImage]}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />
          <ImageUploadField
            field={ImageType.FightModeImage}
            label='Блок режима драки'
            fileInputRef={fileInputRefs[ImageType.FightModeImage]}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />
        </Row>

        <Form.Text className={styles.commonDescription}>
          Изображение или видео будет отображаться растянутым на весь блок.
          Поддерживаемые форматы: PNG, JPG, JPEG, GIF, WebP, MP4, WebM, MOV
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

export default memo(BackgroundImagesCard);
