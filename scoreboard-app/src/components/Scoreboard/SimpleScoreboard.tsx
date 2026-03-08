import { AnimatePresence, motion } from 'framer-motion';
import React, { type CSSProperties } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../store/adminStateStore';
import styles from './SimpleScoreboard.module.scss';
import SponsorBanner from './SponsorBanner';

type SimpleLayoutSettings = {
  headerTop: number;
  headerLeft: number;
  playersTop: number;
  playersLeft: number;
  playersRight: number;
  headerHeight: number;
  headerWidth: number;
  playerBarHeight: number;
  playerBarWidth: number;
  scoreSize: number;
  spacing: number;
  padding: number;
  showHeader: boolean;
  showFlags: boolean;
  showTags: boolean;
};

const defaultSimpleLayout: SimpleLayoutSettings = {
  headerTop: 0,
  headerLeft: 50,
  playersTop: 20,
  playersLeft: 125,
  playersRight: 125,
  headerHeight: 40,
  headerWidth: 300,
  playerBarHeight: 52,
  playerBarWidth: 550,
  scoreSize: 60,
  spacing: 16,
  padding: 16,
  showHeader: true,
  showFlags: true,
  showTags: true,
};

const isValidTag = (tag: string): boolean => {
  if (!tag || tag.trim() === '') return false;
  return /[a-zA-Zа-яА-Я]/.test(tag);
};

const getFlagPath = (countryCode: string): string => {
  if (!countryCode) return '';
  return `/assets/flags/${countryCode.toLowerCase()}.svg`;
};

const shouldShowFightMode = (fightRule: string): boolean => {
  return (
    !!fightRule &&
    fightRule.trim() !== '' &&
    fightRule.toLowerCase() !== 'none' &&
    fightRule.toLowerCase() !== 'n/a'
  );
};

const getTextOutline = (color: string = '#000000') => {
  return `${color} 2px 0px 0px, ${color} 1.75517px 0.958851px 0px, ${color} 1.0806px 1.68294px 0px, ${color} 0.141474px 1.99499px 0px, ${color} -0.832294px 1.81859px 0px, ${color} -1.60229px 1.19694px 0px, ${color} -1.97998px 0.28224px 0px, ${color} -1.87291px -0.701566px 0px, ${color} -1.30729px -1.5136px 0px, ${color} -0.421592px -1.95506px 0px, ${color} 0.567324px -1.91785px 0px, ${color} 1.41734px -1.41108px 0px, ${color} 1.92034px -0.558831px 0px`;
};

const SimpleScoreboard: React.FC = () => {
  const { player1, player2, meta, colors, animationDuration, isVisible } =
    useAdminStore(
      useShallow(s => ({
        player1: s.player1,
        player2: s.player2,
        meta: s.meta,
        colors: s.colors,
        animationDuration: s.animationDuration,
        isVisible: s.isVisible,
      }))
    );

  const layout = defaultSimpleLayout;
  const animDur = animationDuration ?? 800;

  const borderColor = colors.borderColor || colors.mainColor || '#3f00ff';
  const mainColor = colors.mainColor || borderColor;
  const backgroundColor = colors.backgroundColor || 'rgba(0, 0, 0, 0.8)';
  const namesColor = colors.playerNamesColor || '#ffffff';
  const titleColor = colors.tournamentTitleColor || '#ffffff';
  const fightModeColor = colors.fightModeColor || '#ffffff';
  const scoreColor = colors.scoreColor || '#ffffff';
  const outlineColor = colors.textOutlineColor || '#000000';

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: animDur / 1000 },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: animDur / 1000 },
      transform: 'translateX(-50%)',
    },
  };

  const baseHeaderHeight = 60;
  const delta = baseHeaderHeight - layout.headerHeight;
  const borderTopPx = -2 - 0.225 * delta;
  const borderHeightPercent = 130 + 2.025 * delta;
  const leftRotateDeg = 148 - 0.425 * delta;
  const rightRotateDeg = 32 + 0.425 * delta;

  const leftBorderStyle: CSSProperties = {
    borderColor,
    top: `${borderTopPx}px`,
    height: `${borderHeightPercent}%`,
    transform: `rotate(${leftRotateDeg}deg)`,
  };

  const rightBorderStyle: CSSProperties = {
    borderColor,
    top: `${borderTopPx}px`,
    height: `${borderHeightPercent}%`,
    transform: `rotate(${rightRotateDeg}deg)`,
  };

  return (
    <>
      <style>
        {`
          :root {
            --banner-skew: 10px;
          }

          body {
            overflow: hidden;
          }
        `}
      </style>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={styles.scoreboardContainer}
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            {layout.showHeader && (
              <motion.div
                className={styles.tournamentHeader}
                variants={headerVariants}
                style={{
                  position: 'absolute',
                  top: `${layout.headerTop}px`,
                  left: `${layout.headerLeft}%`,
                  transform: 'translateX(-50%)',
                  width: `${layout.headerWidth}px`,
                  height: `${layout.headerHeight}px`,
                  backgroundColor,
                  borderColor,
                  padding: `${layout.padding}px`,
                }}
              >
                <div
                  className={styles.headerLeftBorder}
                  style={leftBorderStyle}
                ></div>
                <h1
                  style={{
                    color: titleColor,
                    textShadow: getTextOutline(outlineColor),
                  }}
                >
                  {meta.title}
                </h1>
                {shouldShowFightMode(meta.fightRule) && (
                  <div
                    className={styles.fightMode}
                    style={{
                      color: fightModeColor,
                      textShadow: getTextOutline(outlineColor),
                    }}
                  >
                    {meta.fightRule}
                  </div>
                )}
                <div
                  className={styles.headerRightBorder}
                  style={rightBorderStyle}
                ></div>
              </motion.div>
            )}

            <motion.div
              className={styles.playersContainer}
              variants={itemVariants}
              style={{
                position: 'absolute',
                top: `${layout.playersTop}px`,
                left: `${layout.playersLeft}px`,
                right: `${layout.playersRight}px`,
                gap: `${layout.spacing}px`,
              }}
            >
              <motion.div
                className={`${styles.playerLeft} ${
                  player1.final === 'winner'
                    ? styles.winner
                    : player1.final === 'loser'
                      ? styles.loser
                      : ''
                }`}
                style={{
                  width: `${layout.playerBarWidth}px`,
                  height: `${layout.playerBarHeight}px`,
                  backgroundColor,
                  borderColor,
                  padding: `${layout.padding}px`,
                }}
              >
                {layout.showFlags &&
                  player1.flag &&
                  player1.flag !== 'none' && (
                    <div className={styles.flag} style={{ height: 'auto' }}>
                      <img
                        src={getFlagPath(player1.flag)}
                        alt='Player 1 flag'
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                <div
                  className={styles.score}
                  style={{
                    width: layout.scoreSize,
                    backgroundColor: borderColor,
                    height: layout.playerBarHeight,
                  }}
                >
                  <h3
                    style={{
                      color: scoreColor,
                      textShadow: getTextOutline(outlineColor),
                    }}
                  >
                    {player1.score}
                  </h3>
                </div>

                <div className={styles.playerInfo}>
                  <h2
                    style={{
                      color: namesColor,
                      textShadow: getTextOutline(outlineColor),
                    }}
                  >
                    {player1.final === 'winner' && '[W] '}
                    {player1.final === 'loser' && '[L] '}
                    {layout.showTags && isValidTag(player1.tag) && (
                      <span
                        className={styles.playerTag}
                        style={{ color: mainColor }}
                      >
                        {player1.tag}
                      </span>
                    )}
                    {layout.showTags && isValidTag(player1.tag) && ' | '}
                    {player1.name}
                  </h2>
                </div>
              </motion.div>

              <motion.div
                className={`${styles.playerRight} ${
                  player2.final === 'winner'
                    ? styles.winner
                    : player2.final === 'loser'
                      ? styles.loser
                      : ''
                }`}
                style={{
                  width: `${layout.playerBarWidth}px`,
                  height: `${layout.playerBarHeight}px`,
                  backgroundColor,
                  borderColor,
                  padding: `${layout.padding}px`,
                }}
              >
                {layout.showFlags &&
                  player2.flag &&
                  player2.flag !== 'none' && (
                    <div className={styles.flag} style={{ height: 'auto' }}>
                      <img
                        src={getFlagPath(player2.flag)}
                        alt='Player 2 flag'
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                <div className={styles.playerInfo}>
                  <h2
                    style={{
                      color: namesColor,
                      textShadow: getTextOutline(outlineColor),
                    }}
                  >
                    {player2.final === 'winner' && '[W] '}
                    {player2.final === 'loser' && '[L] '}
                    {player2.name}
                    {layout.showTags && isValidTag(player2.tag) && ' | '}
                    {layout.showTags && isValidTag(player2.tag) && (
                      <span
                        className={styles.playerTag}
                        style={{ color: mainColor }}
                      >
                        {player2.tag}
                      </span>
                    )}
                  </h2>
                </div>

                <div
                  className={styles.score}
                  style={{
                    width: layout.scoreSize,
                    backgroundColor: borderColor,
                    height: layout.playerBarHeight,
                  }}
                >
                  <h3
                    style={{
                      color: scoreColor,
                      textShadow: getTextOutline(outlineColor),
                    }}
                  >
                    {player2.score}
                  </h3>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SponsorBanner />
    </>
  );
};

export default SimpleScoreboard;
