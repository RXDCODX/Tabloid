import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Clock, Eye, EyeSlash, PlayCircle } from 'react-bootstrap-icons';
import styles from './VisibilityCard.module.scss';

type VisibilityCardProps = {
  isVisible: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
  animationDuration?: number; // Время анимации в миллисекундах
  onAnimationDurationChange?: (duration: number) => void; // Новый callback для изменения времени анимации
};

const VisibilityCard: React.FC<VisibilityCardProps> = ({
  isVisible,
  onVisibilityChange,
  animationDuration = 500, // По умолчанию 500мс
  onAnimationDurationChange,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isShowing, setIsShowing] = useState(false); // Новое состояние для отслеживания действия показа
  const [pageOpenTime, setPageOpenTime] = useState<number>(Date.now());
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(Date.now()); // New state for current time

  // Обновляем текущее время каждую секунду для корректного расчета времени открытия страницы
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      onVisibilityChange(newVisibility);
      setTimeout(() => {
        setIsTransitioning(false);
        setIsShowing(false); // Сбрасываем флаг показа
      }, animationDuration);
    } else {
      // Скрываем панель - также блокируем кнопку на короткое время для предотвращения множественных кликов
      setIsTransitioning(true);
      setIsShowing(false); // Устанавливаем флаг скрытия
      onVisibilityChange(newVisibility);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100); // Короткая блокировка для скрытия
    }
  }, [isVisible, isTransitioning, animationDuration, onVisibilityChange]);

  const handleAnimationDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (
        !isNaN(value) &&
        value >= 100 &&
        value <= 99999 &&
        onAnimationDurationChange
      ) {
        onAnimationDurationChange(value);
      }
    },
    [onAnimationDurationChange]
  );

  const handleDurationIncrease = useCallback(() => {
    if (onAnimationDurationChange) {
      const newValue = Math.min(animationDuration + 500, 10000);
      onAnimationDurationChange(newValue);
    }
  }, [animationDuration, onAnimationDurationChange]);

  const handleDurationDecrease = useCallback(() => {
    if (onAnimationDurationChange) {
      const newValue = Math.max(animationDuration - 500, 100);
      onAnimationDurationChange(newValue);
    }
  }, [animationDuration, onAnimationDurationChange]);

  // Функция для форматирования времени
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Функция для форматирования времени открытия страницы
  const formatPageOpenTime = () => {
    const diff = currentTime - pageOpenTime; // Use currentTime
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}ч ${minutes % 60}м ${seconds % 60}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${seconds % 60}с`;
    } else {
      return `${seconds}с`;
    }
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
                  value={animationDuration}
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
              Открыто: {formatPageOpenTime()}
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

export default VisibilityCard;
