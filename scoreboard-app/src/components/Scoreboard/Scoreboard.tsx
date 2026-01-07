// Компонент создан на основе Scoreboard.cshtml из Tabloid
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SignalRContext } from '../../providers/SignalRProvider';
import { ScoreboardState } from '../../types/types';
import styles from './Scoreboard.module.scss';

const Scoreboard: React.FC = () => {
  const signalRContext = useContext(SignalRContext);

  // Функция для проверки валидности тега
  const isValidTag = useCallback((tag: string): boolean => {
    if (!tag || tag.trim() === '') return false;

    // Проверяем, содержит ли тег хотя бы одну букву (латинскую или русскую)
    const hasLetter = /[a-zA-Zа-яА-Я]/.test(tag);
    return hasLetter;
  }, []);

  // Функция для получения пути к флагу
  const getFlagPath = useCallback((countryCode: string): string => {
    if (!countryCode) return '';
    return `/assets/flags/${countryCode.toLowerCase()}.svg`;
  }, []);

  const [scoreboardState, setScoreboardState] =
    useState<ScoreboardState | null>(null);
  const handleReceiveState = useCallback((state: ScoreboardState) => {
    console.log('SignalR ReceiveState (Scoreboard):', state);
    setScoreboardState(state);
  }, []);

  // Подписка на SignalR события
  useEffect(() => {
    if (!signalRContext.connection) return;

    signalRContext.connection.on('ReceiveState', handleReceiveState);

    // Резервно запросим состояние у сервера (в случае, если начальное сообщение было пропущено)
    signalRContext.connection.invoke('GetState').catch(() => {
      /* ignore */
    });

    return () => {
      signalRContext.connection?.off('ReceiveState', handleReceiveState);
    };
  }, [signalRContext.connection]);

  // Ждём первичного состояния и видимости панели
  if (!scoreboardState || !scoreboardState.isVisible) {
    return null;
  }

  const p1 = scoreboardState.player1;
  const p2 = scoreboardState.player2;
  const m = scoreboardState.meta;
  const c = scoreboardState.colors!;
  const layout = scoreboardState.layoutConfig;
  const animDur = scoreboardState.animationDuration ?? 800;
  const isShowBorders = scoreboardState.isShowBorders ?? false;
  // Функция для создания неонового свечения с уменьшенной силой (15-20% от текущей)
  const getNeonGlow = (color: string) => {
    return `0 0 1px ${color}, 0 0 2px ${color}, 0 0 3px ${color}, 0 0 4px ${color}, 0 0 5px ${color}, 0 0 6px ${color}`;
  };

  const bgColor = isShowBorders ? c.backgroundColor : 'transparent';
  const borderColor = isShowBorders
    ? c.borderColor || c.mainColor || '#3F00FF'
    : undefined;
  const borderStyle = borderColor ? `2px solid ${borderColor}` : 'none';
  const glow = isShowBorders
    ? getNeonGlow(borderColor || c.mainColor || '#3F00FF')
    : 'none';

  // Функция для проверки, нужно ли отображать див режима драки
  const shouldShowFightMode = () => {
    return (
      m.fightRule &&
      m.fightRule.trim() !== '' &&
      m.fightRule.toLowerCase() !== 'none' &&
      m.fightRule.toLowerCase() !== 'n/a'
    );
  };

  // Анимационные варианты для framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: animDur / 1000,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animDur / 1000,
        ease: 'easeOut' as const,
      },
    },
  };

  const centerVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      x: '-50%',
    },
    visible: {
      opacity: 1,
      y: 0,
      x: '-50%',
      transition: {
        duration: animDur / 1000,
        ease: 'easeOut' as const,
      },
    },
  };

  const fightModeVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      x: '-50%',
    },
    visible: {
      opacity: 1,
      y: 0,
      x: '-50%',
      transition: {
        duration: animDur / 1000,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        key='scoreboard-container'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        exit='hidden'
        transition={{ duration: animDur / 1000 }}
      >
        {/* Центральный див - в самом верху по центру */}
        <motion.div
          className={styles.centerDiv}
          variants={centerVariants}
          style={{
            backgroundColor: bgColor,
            border: borderStyle,
            boxShadow: glow,
            top: layout?.center?.top,
            left: layout?.center?.left,
            right: layout?.center?.right,
            width: layout?.center?.width,
            height: layout?.center?.height,
          }}
        >
          <h5 id='metaTitle' style={{ color: c.tournamentTitleColor }}>
            {m.title}
          </h5>
        </motion.div>

        {/* Левый див - 167px от левого края, длина 540px, отступ сверху 15px */}
        <motion.div
          className={styles.leftDiv}
          variants={itemVariants}
          style={{
            backgroundColor: bgColor,
            border: borderStyle,
            boxShadow: glow,
            top: layout?.left?.top,
            left: layout?.left?.left,
            right: layout?.left?.right,
            width: layout?.left?.width,
            height: layout?.left?.height,
          }}
        >
          <div className={styles.playerInfo}>
            <h4
              className={styles.playerName}
              style={{ color: c.playerNamesColor }}
            >
              <span data-side='left' style={{ color: c.playerNamesColor }}>
                {p1.final === 'winner'
                  ? '[W] '
                  : p1.final === 'loser'
                    ? '[L] '
                    : ''}
                {isValidTag(p1.tag) && (
                  <span style={{ color: c.mainColor }}>{p1.tag}</span>
                )}
                {isValidTag(p1.tag) && ' | '}
                {p1.name}
              </span>
            </h4>
          </div>
          {p1.flag && p1.flag !== 'none' && (
            <div
              className={styles.flag}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={getFlagPath(p1.flag)}
                alt='Player 1 flag'
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  boxShadow: isShowBorders ? glow : undefined,
                }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className={styles.score}>
            <h2 data-side='left' style={{ color: c.scoreColor }}>
              {p1.score}
            </h2>
          </div>
        </motion.div>

        {/* Правый див - 167px от правого края, длина 540px, отступ сверху 15px */}
        <motion.div
          className={styles.rightDiv}
          variants={itemVariants}
          style={{
            backgroundColor: bgColor,
            border: borderStyle,
            boxShadow: glow,
            top: layout?.right?.top,
            left: layout?.right?.left,
            right: layout?.right?.right,
            width: layout?.right?.width,
            height: layout?.right?.height,
          }}
        >
          <div className={styles.score}>
            <h2 data-side='right' style={{ color: c.scoreColor }}>
              {p2.score}
            </h2>
          </div>
          {p2.flag && p2.flag !== 'none' && (
            <div
              className={styles.flag}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={getFlagPath(p2.flag)}
                alt='Player 2 flag'
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  boxShadow: isShowBorders ? glow : undefined,
                }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className={styles.playerInfo}>
            <h4
              className={styles.playerName}
              style={{ color: c.playerNamesColor }}
            >
              <span data-side='right' style={{ color: c.playerNamesColor }}>
                {p2.final === 'winner'
                  ? '[W] '
                  : p2.final === 'loser'
                    ? '[L] '
                    : ''}
                {p2.name}
                {isValidTag(p2.tag) && ' | '}
                {isValidTag(p2.tag) && (
                  <span style={{ color: c.mainColor }}>{p2.tag}</span>
                )}
              </span>
            </h4>
          </div>
        </motion.div>

        {/* Четвертый див - режим драки (отображается только если есть значение и не "None") */}
        {shouldShowFightMode() && (
          <motion.div
            className={styles.fightModeDiv}
            variants={fightModeVariants}
            style={{
              backgroundColor: bgColor,
              border: borderStyle,
              boxShadow: glow,
              top: layout?.fightMode?.top,
              left: layout?.fightMode?.left,
              right: layout?.fightMode?.right,
              width: layout?.fightMode?.width,
              height: layout?.fightMode?.height,
            }}
          >
            <h4 style={{ color: c.fightModeColor }}>{m.fightRule}</h4>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Scoreboard;
