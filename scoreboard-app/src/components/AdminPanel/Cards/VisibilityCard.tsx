import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Clock, Eye, EyeSlash, PlayCircle } from 'react-bootstrap-icons';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../../store/adminStateStore';
import styles from './VisibilityCard.module.scss';

const VisibilityCard: React.FC = () => {
  const { isVisible, animationDuration } = useAdminStore(
    useShallow(s => ({
      isVisible: s.isVisible,
      animationDuration: s.animationDuration,
    }))
  );

  // fallback value
  const duration = animationDuration ?? 500;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isShowing, setIsShowing] = useState(false); // Новое состояние для отслеживания действия показа
  const [pageOpenTime] = useState<number>(Date.now());
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Обновляем время последнего обновления при изменении видимости
  useEffect(() => {
    setLastUpdateTime(Date.now());
  }, [isVisible]);

  const handleVisibilityToggle = useCallback(() => {
    const newVisibility = !isVisible;

    // Блокируем кнопку на время любой анимации
    if (isTransitioning) return;

    if (newVisibility) {
      // Показываем панель - блокируем кнопку на время анимации
      setIsTransitioning(true);
      setIsShowing(true); // Устанавливаем флаг показа
      useAdminStore.getState().setVisibility(newVisibility);
      setTimeout(() => {
        setIsTransitioning(false);
        setIsShowing(false); // Сбрасываем флаг показа
      }, duration);
    } else {
      // Скрываем панель - также блокируем кнопку на короткое время для предотвращения множественных кликов
      setIsTransitioning(true);
      setIsShowing(false); // Устанавливаем флаг скрытия
      useAdminStore.getState().setVisibility(newVisibility);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100); // Короткая блокировка для скрытия
    }
  }, [isVisible, isTransitioning, duration]);

  const handleAnimationDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 100 && value <= 99999) {
        useAdminStore.getState().setAnimationDuration(value);
      }
    },
    []
  );

  const handleDurationIncrease = useCallback(() => {
    const newValue = Math.min((duration ?? 500) + 500, 10000);
    useAdminStore.getState().setAnimationDuration(newValue);
  }, [duration]);

  const handleDurationDecrease = useCallback(() => {
    const newValue = Math.max((duration ?? 500) - 500, 100);
    useAdminStore.getState().setAnimationDuration(newValue);
  }, [duration]);

  // Функция для форматирования времени
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  // Компонент, отвечающий только за отображение времени с момента открытия
  const OpenDuration: React.FC<{ start: number }> = ({ start }) => {
    const [now, setNow] = useState<number>(Date.now());
    useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }, []);

    const diff = Math.max(0, now - start);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0)
      return (
        <>
          {hours}ч {minutes % 60}м {seconds % 60}с
        </>
      );
    if (minutes > 0)
      return (
        <>
          {minutes}м {seconds % 60}с
        </>
      );
    return <>{seconds}с</>;
  };

  // Определяем, должна ли кнопка быть заблокирована
  const shouldDisableButton = isTransitioning; // Блокируем кнопку на время любой анимации

  return (
    <Card className={styles.visibilityCard}>
      <Card.Body className={styles.cardBody}>
        <div>
          <div className={styles.cardHeader}>
            {isVisible ? (
              <Eye color='#dc3545' size={20} />
            ) : (
              <EyeSlash color='#dc3545' size={20} />
            )}
            <span className={styles.cardTitle}>Видимость</span>
          </div>

          {/* Кнопка и input для времени анимации в одном ряду */}
          <div className={styles.controlsSection}>
            <Button
              variant={isVisible ? 'danger' : 'success'}
              className={`${styles.visibilityButton} fw-bold py-2 px-3 text-white`}
              style={
                {
                  '--animation-duration': `${animationDuration}ms`,
                } as React.CSSProperties
              }
              onClick={handleVisibilityToggle}
              disabled={shouldDisableButton}
            >
              {shouldDisableButton ? (
                <div className={styles.loadingSpinner}>
                  <div
                    className='spinner-border spinner-border-sm'
                    role='status'
                  >
                    <span className='visually-hidden'>Загрузка...</span>
                  </div>
                  <span className={styles.spinnerText}>
                    {isShowing ? 'Показываем...' : 'Скрываем...'}
                  </span>
                </div>
              ) : (
                <div className='d-flex align-items-center gap-1'>
                  {isVisible ? <EyeSlash size={14} /> : <Eye size={14} />}
                  <span style={{ fontSize: 12 }}>
                    {isVisible ? 'Скрыть' : 'Показать'}
                  </span>
                </div>
              )}
            </Button>

            {/* Input для времени анимации с кнопками */}
            <div className={styles.animationControls}>
              <Form.Label className={styles.animationLabel}>
                Анимация (мс)
              </Form.Label>
              <div className={styles.animationInputGroup}>
                <Button
                  variant='outline-danger'
                  size='sm'
                  onClick={handleDurationDecrease}
                  disabled={animationDuration <= 100}
                  className={`${styles.animationButton} fw-bold`}
                >
                  -
                </Button>
                <Form.Control
                  type='number'
                  value={duration}
                  onChange={handleAnimationDurationChange}
                  min={100}
                  max={10000}
                  step={100}
                  size='sm'
                  className={`${styles.animationInput} bg-dark text-white border-danger border-2 fw-bold rounded-3 text-center`}
                  placeholder='800'
                />
                <Button
                  variant='outline-danger'
                  size='sm'
                  onClick={handleDurationIncrease}
                  disabled={animationDuration >= 10000}
                  className={`${styles.animationButton} fw-bold`}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о времени - по центру */}
        <div className={styles.infoSection}>
          {/* Время последнего обновления */}
          <div className={styles.infoItem}>
            <Clock size={14} color='#dc3545' />
            <span className={styles.infoText}>
              Обновлено: {formatTime(lastUpdateTime)}
            </span>
          </div>

          {/* Время открытия страницы */}
          <div className={styles.infoItem}>
            <PlayCircle size={14} color='#dc3545' />
            <span className={styles.infoText}>
              Открыто: <OpenDuration start={pageOpenTime} />
            </span>
          </div>

          {/* Статус панели */}
          <div className={styles.statusText}>
            <small
              className={isVisible ? styles.statusVisible : styles.statusHidden}
            >
              {isVisible ? 'Панель видна' : 'Панель скрыта'}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default memo(VisibilityCard);
