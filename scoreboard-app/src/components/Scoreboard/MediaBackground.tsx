import React from 'react';
import styles from './MediaBackground.module.scss';

interface MediaBackgroundProps {
  imageName?: string;
  className?: string;
  uploadedAt?: number;
}

const MediaBackground: React.FC<MediaBackgroundProps> = ({
  imageName,
  className,
  uploadedAt,
}) => {
  if (!imageName) return null;

  // Определяем, является ли файл видео
  const isVideo = /\.(mp4|webm|mov)$/i.test(imageName);
  const mediaPath = `/Images/${imageName}${uploadedAt ? `?t=${uploadedAt}` : ''}`;

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
