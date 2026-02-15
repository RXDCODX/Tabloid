import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useAdminStore } from '../../store/adminStateStore';
import styles from './SponsorBanner.module.scss';

const SponsorBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSponsorDisabled, setIsSponsorDisabled] = useState(false);
  const lastShownTimeRef = useRef<number>(0);

  // Отслеживаем изменения в состоянии
  const stateSnapshot = useAdminStore(state => ({
    player1: state.player1,
    player2: state.player2,
    meta: state.meta,
    isVisible: state.isVisible,
  }));

  useEffect(() => {
    // Проверяем, отключен ли спонсорский баннер
    (async () => {
      try {
        const response = await fetch('/api/Sponsor/is-sponsor-disabled');
        if (!response.ok) {
          console.warn('Sponsor API returned status:', response.status);
          setIsSponsorDisabled(false);
          return;
        }
        const disabled = await response.json();
        setIsSponsorDisabled(disabled);
      } catch (error) {
        console.error('Error checking sponsor status:', error);
        setIsSponsorDisabled(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Если баннер отключен, не показываем его
    if (isSponsorDisabled) {
      return;
    }

    // Проверяем кулдаун (45 минут = 2700000 мс)
    const now = Date.now();
    const cooldownMs = 45 * 60 * 1000; // 45 минут

    if (now - lastShownTimeRef.current < cooldownMs) {
      return;
    }

    // Функция для показа баннера
    const showBanner = () => {
      setIsVisible(true);
      lastShownTimeRef.current = Date.now();
      // Скрываем баннер через 10 секунд (время анимации)
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    };

    showBanner();
  }, [isSponsorDisabled, stateSnapshot]);

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
            при поддержке <span style={{ color: '#9146FF' }}>twitch.tv/</span>
            <span style={{ color: '#FF0000' }}>RXDCODX</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SponsorBanner;
