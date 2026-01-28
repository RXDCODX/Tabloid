import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import styles from './SponsorBanner.module.scss';

const SponsorBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Функция для показа баннера
    const showBanner = () => {
      setIsVisible(true);
      // Скрываем баннер через 10 секунд (время анимации)
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    };

    // Показываем баннер сразу при загрузке
    showBanner();

    // Затем показываем раз в час (3600000 мс)
    const interval = setInterval(showBanner, 3600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.bannerContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={styles.bannerText}
            initial={{ x: '100vw' }}
            animate={{ x: '-100%' }}
            exit={{ x: '-100%' }}
            transition={{
              duration: 10,
              ease: 'linear',
            }}
          >
            при поддержке RXDCODX
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SponsorBanner;
