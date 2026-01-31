import React from 'react';
import { BackgroundImageService } from '../AdminPanel/services/BackgroundImagesService';
import styles from './MediaBackground.module.scss';

interface MediaBackgroundProps {
  imageName?: string;
  imageType?: string;
  className?: string;
  uploadedAt?: number;
}

const MediaBackground: React.FC<MediaBackgroundProps> = ({
  imageName,
  imageType,
  className,
  uploadedAt,
}) => {
  if (!imageName && !imageType) return null;

  // Определяем, является ли файл видео
  const isVideo = /\.(mp4|webm|mov)$/i.test(imageName || '');

  // Используем imageType если доступен (новый метод), иначе fallback на старый путь
  const mediaPath = imageType
    ? BackgroundImageService.getImageUrl(imageType, uploadedAt)
    : `/Images/${imageName}${uploadedAt ? `?t=${uploadedAt}` : ''}`;

  return (
    <div className={`${styles.mediaBackground} ${className || ''}`}>
      {isVideo ? (
        <video
          key={uploadedAt || 0}
          src={mediaPath}
          autoPlay
          loop
          muted
          playsInline
          className={styles.mediaContent}
        />
      ) : (
        <div
          className={styles.mediaContent}
          style={{
            backgroundImage: `url(${mediaPath})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

export default MediaBackground;
