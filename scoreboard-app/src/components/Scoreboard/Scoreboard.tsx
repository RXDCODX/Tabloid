// Компонент создан на основе Scoreboard.cshtml из Tabloid
import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import { SignalRContext } from "../../providers/SignalRProvider";
import { defaultPreset, LayoutConfig } from "../../types/types";
import styles from "./Scoreboard.module.scss";

type Player = {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  flag: string;
  final: string; // "winner", "loser", "none"
};

type MetaInfo = {
  title: string;
  fightRule: string;
};

type ColorPreset = {
  mainColor?: string;
  playerNamesColor?: string;
  tournamentTitleColor?: string;
  fightModeColor?: string;
  scoreColor?: string;
  backgroundColor?: string;
  borderColor?: string;
};

type ScoreboardState = {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  colors: ColorPreset;
  isVisible: boolean; // Новое поле для управления видимостью
  animationDuration?: number; // Время анимации в миллисекундах
  layoutConfig?: LayoutConfig;
};

const Scoreboard: React.FC = () => {
  const signalRContext = useContext(SignalRContext);
  
  // Функция для проверки валидности тега
  const isValidTag = (tag: string): boolean => {
    if (!tag || tag.trim() === "") return false;
    
    // Проверяем, содержит ли тег хотя бы одну букву (латинскую или русскую)
    const hasLetter = /[a-zA-Zа-яА-Я]/.test(tag);
    return hasLetter;
  };

  // Функция для получения пути к флагу
  const getFlagPath = (countryCode: string): string => {
    if (!countryCode) return '';
    return `/assets/flags/${countryCode.toLowerCase()}.svg`;
  };

  const [player1, setPlayer1] = useState<Player>({
    name: "Daigo Umehara",
    sponsor: "Red Bull",
    score: 2,
    tag: "The Beast",
    flag: "jp",
    final: "none",
  });
  const [player2, setPlayer2] = useState<Player>({
    name: "Tokido",
    sponsor: "Mad Catz",
    score: 1,
    tag: "Murder Face",
    flag: "jp",
    final: "none",
  });
  const [meta, setMeta] = useState<MetaInfo>({
    title: "Street Fighter 6",
    fightRule: "Grand Finals",
  });
  const [colors, setColors] = useState<ColorPreset>(defaultPreset);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [animationDuration, setAnimationDuration] = useState<number>(800);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    center: { top: '15px', left: '50%', width: '540px', height: '60px' },
    left: { top: '15px', left: '167px', width: '540px', height: '120px' },
    right: { top: '15px', right: '167px', width: '540px', height: '120px' },
    fightMode: { top: '150px', left: '50%', width: '300px', height: '50px' },
  });

  // Подписка на SignalR события
  useEffect(() => {
    if (!signalRContext.connection) return;

    const handleReceiveState = (state: ScoreboardState) => {
      setPlayer1(state.player1);
      setPlayer2(state.player2);
      setMeta(state.meta);
      setIsVisible(state.isVisible);

      // Обновляем цвета с сервера
      if (state.colors) {
        setColors(state.colors);
      }

      // Обновляем время анимации
      if (state.animationDuration) {
        setAnimationDuration(state.animationDuration);
      }

      if (state as any && (state as any).layoutConfig) {
        setLayoutConfig((state as any).layoutConfig as LayoutConfig);
      }
    };

    signalRContext.connection.on("ReceiveState", handleReceiveState);

    return () => {
      signalRContext.connection?.off("ReceiveState", handleReceiveState);
    };
  }, [signalRContext.connection]);

  // Если панель скрыта, не отображаем ничего
  if (!isVisible) {
    return null;
  }

  // Функция для создания неонового свечения с уменьшенной силой (15-20% от текущей)
  const getNeonGlow = (color: string) => {
    return `0 0 1px ${color}, 0 0 2px ${color}, 0 0 3px ${color}, 0 0 4px ${color}, 0 0 5px ${color}, 0 0 6px ${color}`;
  };

  // Функция для проверки, нужно ли отображать див режима драки
  const shouldShowFightMode = () => {
    return meta.fightRule && 
           meta.fightRule.trim() !== "" && 
           meta.fightRule.toLowerCase() !== "none" &&
           meta.fightRule.toLowerCase() !== "n/a";
  };

  // Анимационные варианты для framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: animationDuration / 1000,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: animationDuration / 1000,
        ease: "easeOut" as const
      }
    }
  };

  const centerVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      x: "-50%"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: "-50%",
      transition: {
        duration: animationDuration / 1000,
        ease: "easeOut" as const
      }
    }
  };

  const fightModeVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      x: "-50%"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: "-50%",
      transition: {
        duration: animationDuration / 1000,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="scoreboard-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: animationDuration / 1000 }}
        >
          {/* Центральный див - в самом верху по центру */}
          <motion.div 
            className={styles.centerDiv}
            variants={centerVariants}
            style={{ 
              backgroundColor: colors.backgroundColor,
              border: `2px solid ${colors.borderColor || colors.mainColor || "#3F00FF"}`,
              boxShadow: getNeonGlow(colors.mainColor || "#3F00FF"),
              top: layoutConfig.center?.top,
              left: layoutConfig.center?.left,
              right: layoutConfig.center?.right,
              width: layoutConfig.center?.width,
              height: layoutConfig.center?.height,
            }}
          >
            <h5 id="metaTitle" style={{ color: colors.tournamentTitleColor }}>
              {meta.title}
            </h5>
          </motion.div>

          {/* Левый див - 167px от левого края, длина 540px, отступ сверху 15px */}
          <motion.div 
            className={styles.leftDiv}
            variants={itemVariants}
            style={{ 
              backgroundColor: colors.backgroundColor,
              border: `2px solid ${colors.borderColor || colors.mainColor || "#3F00FF"}`,
              boxShadow: getNeonGlow(colors.mainColor || "#3F00FF"),
              top: layoutConfig.left?.top,
              left: layoutConfig.left?.left,
              right: layoutConfig.left?.right,
              width: layoutConfig.left?.width,
              height: layoutConfig.left?.height,
            }}
          >
            <div className={styles.playerInfo}>
              <h4 className={styles.playerName} style={{ color: colors.playerNamesColor }}>
                <span data-side="left" style={{ color: colors.playerNamesColor }}>
                  {player1.final === "winner"
                    ? "[W] "
                    : player1.final === "loser"
                    ? "[L] "
                    : ""}
                  {isValidTag(player1.tag) && (
                    <span style={{ color: colors.mainColor }}>
                      {player1.tag}
                    </span>
                  )}
                  {isValidTag(player1.tag) && " | "}
                  {player1.name}
                </span>
              </h4>
            </div>
            {player1.flag && player1.flag !== "none" && (
              <div
                className={styles.flag}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
              >
                <img
                  src={getFlagPath(player1.flag)}
                  alt="Player 1 flag"
                  style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div 
              className={styles.score}
            >
              <h2 data-side="left" style={{ color: colors.scoreColor }}>
                {player1.score}
              </h2>
            </div>
          </motion.div>

          {/* Правый див - 167px от правого края, длина 540px, отступ сверху 15px */}
          <motion.div 
            className={styles.rightDiv}
            variants={itemVariants}
            style={{ 
              backgroundColor: colors.backgroundColor,
              border: `2px solid ${colors.borderColor || colors.mainColor || "#3F00FF"}`,
              boxShadow: getNeonGlow(colors.mainColor || "#3F00FF"),
              top: layoutConfig.right?.top,
              left: layoutConfig.right?.left,
              right: layoutConfig.right?.right,
              width: layoutConfig.right?.width,
              height: layoutConfig.right?.height,
            }}
          >
            <div 
              className={styles.score}
            >
              <h2 data-side="right" style={{ color: colors.scoreColor }}>
                {player2.score}
              </h2>
            </div>
            {player2.flag && player2.flag !== "none" && (
              <div
                className={styles.flag}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
              >
                <img
                  src={getFlagPath(player2.flag)}
                  alt="Player 2 flag"
                  style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className={styles.playerInfo}>
              <h4 className={styles.playerName} style={{ color: colors.playerNamesColor }}>
                <span data-side="right" style={{ color: colors.playerNamesColor }}>
                  {player2.final === "winner"
                    ? "[W] "
                    : player2.final === "loser"
                    ? "[L] "
                    : ""}
                  {player2.name}
                  {isValidTag(player2.tag) && " | "}
                  {isValidTag(player2.tag) && (
                    <span style={{ color: colors.mainColor }}>
                      {player2.tag}
                    </span>
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
                backgroundColor: colors.backgroundColor,
                border: `2px solid ${colors.borderColor || colors.mainColor || "#3F00FF"}`,
                boxShadow: getNeonGlow(colors.mainColor || "#3F00FF"),
                top: layoutConfig.fightMode?.top,
                left: layoutConfig.fightMode?.left,
                right: layoutConfig.fightMode?.right,
                width: layoutConfig.fightMode?.width,
                height: layoutConfig.fightMode?.height,
              }}
            >
              <h4 style={{ color: colors.fightModeColor }}>
                {meta.fightRule}
              </h4>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Scoreboard;
