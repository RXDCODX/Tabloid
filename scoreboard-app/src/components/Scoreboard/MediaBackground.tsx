import React from 'react';
import styles from './MediaBackground.module.scss';

interface MediaBackgroundProps {
  imageName?: string;
  className?: string;
}

const MediaBackground: React.FC<MediaBackgroundProps> = ({
  imageName,
  className,
}) => {
  if (!imageName) return null;

  // Определяем, является ли файл видео
  const isVideo = /\.(mp4|webm|mov)$/i.test(imageName);
  const mediaPath = `/Images/${imageName}`;

  return (
    <div className={`${styles.mediaBackground} ${className || ''}`}>
      {isVideo ? (
        <video
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
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

export default MediaBackground;
