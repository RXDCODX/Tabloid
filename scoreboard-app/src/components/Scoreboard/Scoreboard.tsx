// Компонент создан на основе Scoreboard.cshtml из Tabloid
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAdminStore } from '../../store/adminStateStore';
import { ImageType } from '../../types/types';
import { BackgroundImageService } from '../AdminPanel/services/BackgroundImagesService';
import { FontsService } from '../AdminPanel/services/FontsService';
import MediaBackground from './MediaBackground';
import styles from './Scoreboard.module.scss';
import SponsorBanner from './SponsorBanner';

const Scoreboard: React.FC = () => {
  const {
    player1,
    player2,
    commentator1,
    commentator2,
    commentator3,
    commentator4,
    meta,
    colors,
    layoutConfig,
    animationDuration,
    isVisible,
    isShowBorders,
    backgroundImages,
    fontConfig,
  } = useAdminStore(
    useShallow(s => ({
      player1: s.player1,
      player2: s.player2,
      commentator1: s.commentator1,
      commentator2: s.commentator2,
      commentator3: s.commentator3,
      commentator4: s.commentator4,
      meta: s.meta,
      colors: s.colors,
      layoutConfig: s.layoutConfig,
      animationDuration: s.animationDuration,
      isVisible: s.isVisible,
      isShowBorders: s.isShowBorders,
      backgroundImages: s.backgroundImages,
      fontConfig: s.fontConfig,
    }))
  );
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load all fonts and create @font-face rules
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fonts = await FontsService.getAllFonts();

        const styleId = 'scoreboard-fonts-dynamic-styles';
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }

        // Create @font-face rules for all fonts
        const fontFaceRules = fonts
          .map(font => {
            const fontUrl = FontsService.getFontUrl(
              font.fontName,
              font.uploadedAt
            );
            return `
              @font-face {
                font-family: '${font.fontName}';
                src: url('${fontUrl}');
                font-display: swap;
              }
            `;
          })
          .join('\n');

        styleElement.textContent = fontFaceRules;
        setFontsLoaded(true);
      } catch (err) {
        console.error('Error loading fonts:', err);
      }
    };

    loadFonts();
  }, []);

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

  // Функция для получения размера шрифта
  const getFontSize = (fontSizeValue?: number): string | undefined => {
    return fontSizeValue && fontSizeValue > 0
      ? `${fontSizeValue}px`
      : undefined;
  };

  const p1 = player1;
  const p2 = player2;
  const c1 = commentator1;
  const c2 = commentator2;
  const c3 = commentator3;
  const c4 = commentator4;
  const m = meta;
  const c = colors;
  const layout = layoutConfig;
  const animDur = animationDuration ?? 800;

  // Функция для создания обводки текста
  const getTextOutline = (color: string = '#000000') => {
    return `${color} 2px 0px 0px, ${color} 1.75517px 0.958851px 0px, ${color} 1.0806px 1.68294px 0px, ${color} 0.141474px 1.99499px 0px, ${color} -0.832294px 1.81859px 0px, ${color} -1.60229px 1.19694px 0px, ${color} -1.97998px 0.28224px 0px, ${color} -1.87291px -0.701566px 0px, ${color} -1.30729px -1.5136px 0px, ${color} -0.421592px -1.95506px 0px, ${color} 0.567324px -1.91785px 0px, ${color} 1.41734px -1.41108px 0px, ${color} 1.92034px -0.558831px 0px`;
  };

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

  // background images (stretch to cover corresponding containers)
  const imgs = backgroundImages;

  const bgStyleFor = useCallback(
    (imageType?: ImageType) => {
      if (!imageType || imageType === ImageType.None) {
        return {};
      }
      const imageKey =
        imageType === ImageType.TopImage
          ? 'centerImage'
          : imageType === ImageType.LeftImage
            ? 'leftImage'
            : imageType === ImageType.RightImage
              ? 'rightImage'
              : imageType === ImageType.FightModeImage
                ? 'fightModeImage'
                : imageType === ImageType.Commentator1Image
                  ? 'commentator1Image'
                  : imageType === ImageType.Commentator2Image
                    ? 'commentator2Image'
                    : imageType === ImageType.Commentator3Image
                      ? 'commentator3Image'
                      : imageType === ImageType.Commentator4Image
                        ? 'commentator4Image'
                        : undefined;

      if (!imageKey) {
        return {};
      }

      const img = imgs[imageKey];

      if (!img?.imageName) {
        return {};
      }

      return {
        backgroundImage: `url(${BackgroundImageService.getImageUrl(
          imageType,
          img.uploadedAt
        )})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    },
    [imgs]
  );

  // Функция для проверки, является ли файл видео
  const isVideoFile = (imageName?: string) => {
    return imageName ? /\.(mp4|webm|mov)$/i.test(imageName) : false;
  };

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
    <>
      <style>
        {` 
          body {
            overflow: hidden;
          }
        `}
      </style>
      <AnimatePresence mode='wait'>
        {isVisible && (
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
                position: 'absolute',
                backgroundColor: bgColor,
                border: borderStyle,
                boxShadow: glow,
                top: layout?.center?.top,
                left: layout?.center?.left,
                right: layout?.center?.right,
                width: layout?.center?.width,
                height: layout?.center?.height,
                ...(isVideoFile(imgs?.centerImage?.imageName)
                  ? {}
                  : bgStyleFor(ImageType.TopImage)),
              }}
            >
              {isVideoFile(imgs?.centerImage?.imageName) && (
                <MediaBackground
                  imageName={imgs?.centerImage?.imageName}
                  imageType={ImageType.TopImage}
                  uploadedAt={imgs?.centerImage?.uploadedAt}
                />
              )}
              <h5
                id='metaTitle'
                style={{
                  color: c.tournamentTitleColor,
                  textShadow: getTextOutline(c.textOutlineColor || '#000000'),
                  position: 'relative',
                  zIndex: 1,
                  fontFamily: fontConfig.TournamentTitleFont
                    ? `'${fontConfig.TournamentTitleFont}', sans-serif`
                    : undefined,
                  fontSize: getFontSize(fontConfig.TournamentTitleFontSize),
                }}
              >
                {m.title}
              </h5>
            </motion.div>

            {/* Левый див - 167px от левого края, длина 540px, отступ сверху 15px */}
            {p1.name && (
              <motion.div
                className={styles.leftDiv}
                variants={itemVariants}
                style={{
                  position: 'absolute',
                  backgroundColor: bgColor,
                  border: borderStyle,
                  boxShadow: glow,
                  top: layout?.left?.top,
                  left: layout?.left?.left,
                  right: layout?.left?.right,
                  width: layout?.left?.width,
                  height: layout?.left?.height,
                  ...(isVideoFile(imgs?.leftImage?.imageName)
                    ? {}
                    : bgStyleFor(ImageType.LeftImage)),
                }}
              >
                {isVideoFile(imgs?.leftImage?.imageName) && (
                  <MediaBackground
                    imageName={imgs?.leftImage?.imageName}
                    imageType={ImageType.LeftImage}
                    uploadedAt={imgs?.leftImage?.uploadedAt}
                  />
                )}
                <div
                  className={styles.playerInfo}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <h4
                    className={styles.playerName}
                    style={{
                      color: c.playerNamesColor,
                      textShadow: getTextOutline(
                        c.textOutlineColor || '#000000'
                      ),
                      fontFamily: fontConfig.PlayerNameFont
                        ? `'${fontConfig.PlayerNameFont}', sans-serif`
                        : undefined,
                      fontSize: getFontSize(fontConfig.PlayerNameFontSize),
                    }}
                  >
                    <span
                      data-side='left'
                      style={{ color: c.playerNamesColor }}
                    >
                      {p1.final === 'winner'
                        ? '[W] '
                        : p1.final === 'loser'
                          ? '[L] '
                          : ''}
                      {isValidTag(p1.tag) && (
                        <span
                          style={{
                            color: c.mainColor,
                            textShadow: getTextOutline(
                              c.textOutlineColor || '#000000'
                            ),
                            fontFamily: fontConfig.PlayerTagFont
                              ? `'${fontConfig.PlayerTagFont}', sans-serif`
                              : undefined,
                            fontSize: getFontSize(fontConfig.PlayerTagFontSize),
                          }}
                        >
                          {p1.tag}
                        </span>
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
                      position: 'relative',
                      zIndex: 1,
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
                        objectFit: 'fill',
                      }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div
                  className={styles.score}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <h2
                    data-side='left'
                    style={{
                      color: c.scoreColor,
                      fontFamily: fontConfig.ScoreFont
                        ? `'${fontConfig.ScoreFont}', sans-serif`
                        : undefined,
                      fontSize: getFontSize(fontConfig.ScoreFontSize),
                    }}
                  >
                    {p1.score}
                  </h2>
                </div>
              </motion.div>
            )}

            {/* Правый див - 167px от правого края, длина 540px, отступ сверху 15px */}
            {p2.name && (
              <motion.div
                className={styles.rightDiv}
                variants={itemVariants}
                style={{
                  position: 'absolute',
                  backgroundColor: bgColor,
                  border: borderStyle,
                  boxShadow: glow,
                  top: layout?.right?.top,
                  left: layout?.right?.left,
                  right: layout?.right?.right,
                  width: layout?.right?.width,
                  height: layout?.right?.height,
                  ...(isVideoFile(imgs?.rightImage?.imageName)
                    ? {}
                    : bgStyleFor(ImageType.RightImage)),
                }}
              >
                {isVideoFile(imgs?.rightImage?.imageName) && (
                  <MediaBackground
                    imageName={imgs?.rightImage?.imageName}
                    imageType={ImageType.RightImage}
                    uploadedAt={imgs?.rightImage?.uploadedAt}
                  />
                )}
                <div
                  className={styles.score}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <h2
                    data-side='right'
                    style={{
                      color: c.scoreColor,
                      fontFamily: fontConfig.ScoreFont
                        ? `'${fontConfig.ScoreFont}', sans-serif`
                        : undefined,
                      fontSize: getFontSize(fontConfig.ScoreFontSize),
                    }}
                  >
                    {p2.score}
                  </h2>
                </div>
                {p2.flag && p2.flag !== 'none' && (
                  <div
                    className={styles.flag}
                    style={{
                      position: 'relative',
                      zIndex: 1,
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
                        objectFit: 'fill',
                      }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div
                  className={styles.playerInfo}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <h4
                    className={styles.playerName}
                    style={{
                      color: c.playerNamesColor,
                      textShadow: getTextOutline(
                        c.textOutlineColor || '#000000'
                      ),
                      fontFamily: fontConfig.PlayerNameFont
                        ? `'${fontConfig.PlayerNameFont}', sans-serif`
                        : undefined,
                      fontSize: getFontSize(fontConfig.PlayerNameFontSize),
                    }}
                  >
                    <span
                      data-side='right'
                      style={{ color: c.playerNamesColor }}
                    >
                      {p2.final === 'winner'
                        ? '[W] '
                        : p2.final === 'loser'
                          ? '[L] '
                          : ''}
                      {p2.name}
                      {isValidTag(p2.tag) && ' | '}
                      {isValidTag(p2.tag) && (
                        <span
                          style={{
                            color: c.mainColor,
                            textShadow: getTextOutline(
                              c.textOutlineColor || '#000000'
                            ),
                            fontFamily: fontConfig.PlayerTagFont
                              ? `'${fontConfig.PlayerTagFont}', sans-serif`
                              : undefined,
                            fontSize: getFontSize(fontConfig.PlayerTagFontSize),
                          }}
                        >
                          {p2.tag}
                        </span>
                      )}
                    </span>
                  </h4>
                </div>
              </motion.div>
            )}

            {/* Четвертый див - режим драки (отображается только если есть значение и не "None") */}
            {shouldShowFightMode() && (
              <motion.div
                className={styles.fightModeDiv}
                variants={fightModeVariants}
                style={{
                  position: 'absolute',
                  backgroundColor: bgColor,
                  border: borderStyle,
                  boxShadow: glow,
                  top: layout?.fightMode?.top,
                  left: layout?.fightMode?.left,
                  right: layout?.fightMode?.right,
                  width: layout?.fightMode?.width,
                  height: layout?.fightMode?.height,
                  ...(isVideoFile(imgs?.fightModeImage?.imageName)
                    ? {}
                    : bgStyleFor(ImageType.FightModeImage)),
                }}
              >
                {isVideoFile(imgs?.fightModeImage?.imageName) && (
                  <MediaBackground
                    imageName={imgs?.fightModeImage?.imageName}
                    imageType={ImageType.FightModeImage}
                    uploadedAt={imgs?.fightModeImage?.uploadedAt}
                  />
                )}
                <h4
                  style={{
                    color: c.fightModeColor,
                    textShadow: getTextOutline(c.textOutlineColor || '#000000'),
                    position: 'relative',
                    zIndex: 1,
                    fontFamily: fontConfig.FightModeFont
                      ? `'${fontConfig.FightModeFont}', sans-serif`
                      : undefined,
                    fontSize: getFontSize(fontConfig.FightModeFontSize),
                  }}
                >
                  {m.fightRule}
                </h4>
              </motion.div>
            )}

            {/* Комментатор 1 */}
            {c1.name && (
              <motion.div
                className={styles.commentatorDiv}
                variants={itemVariants}
                style={{
                  position: 'absolute',
                  backgroundColor: bgColor,
                  border: borderStyle,
                  boxShadow: glow,
                  top: layout?.commentator1?.top,
                  left: layout?.commentator1?.left,
                  right: layout?.commentator1?.right,
                  width: layout?.commentator1?.width,
                  height: layout?.commentator1?.height,
                  ...(isVideoFile(imgs?.commentator1Image?.imageName)
                    ? {}
                    : bgStyleFor(ImageType.Commentator1Image)),
                }}
              >
                {isVideoFile(imgs?.commentator1Image?.imageName) && (
                  <MediaBackground
                    imageName={imgs?.commentator1Image?.imageName}
                    imageType={ImageType.Commentator1Image}
                    uploadedAt={imgs?.commentator1Image?.uploadedAt}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {c1.flag && c1.flag !== 'none' && (
                    <img
                      src={getFlagPath(c1.flag)}
                      alt={c1.flag}
                      style={{
                        height: '30px',
                        marginBottom: '5px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {c1.name && (
                    <h6
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        margin: 0,
                        fontFamily: fontConfig.CommentatorNameFont
                          ? `'${fontConfig.CommentatorNameFont}', sans-serif`
                          : undefined,
                        fontSize: getFontSize(
                          fontConfig.CommentatorNameFontSize
                        ),
                      }}
                    >
                      {c1.name}
                    </h6>
                  )}
                  {isValidTag(c1.tag) && (
                    <span
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        fontFamily: fontConfig.CommentatorTagFont
                          ? `'${fontConfig.CommentatorTagFont}', sans-serif`
                          : undefined,
                        fontSize:
                          getFontSize(fontConfig.CommentatorTagFontSize) ||
                          '0.9em',
                      }}
                    >
                      {c1.tag}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Комментатор 2 */}
            {c2.name && (
              <motion.div
                className={styles.commentatorDiv}
                variants={itemVariants}
                style={{
                  position: 'absolute',
                  backgroundColor: bgColor,
                  border: borderStyle,
                  boxShadow: glow,
                  top: layout?.commentator2?.top,
                  left: layout?.commentator2?.left,
                  right: layout?.commentator2?.right,
                  width: layout?.commentator2?.width,
                  height: layout?.commentator2?.height,
                  ...(isVideoFile(imgs?.commentator2Image?.imageName)
                    ? {}
                    : bgStyleFor(ImageType.Commentator2Image)),
                }}
              >
                {isVideoFile(imgs?.commentator2Image?.imageName) && (
                  <MediaBackground
                    imageName={imgs?.commentator2Image?.imageName}
                    imageType={ImageType.Commentator2Image}
                    uploadedAt={imgs?.commentator2Image?.uploadedAt}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {c2.flag && c2.flag !== 'none' && (
                    <img
                      src={getFlagPath(c2.flag)}
                      alt={c2.flag}
                      style={{
                        height: '30px',
                        marginBottom: '5px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {c2.name && (
                    <h6
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        margin: 0,
                        fontFamily: fontConfig.CommentatorNameFont
                          ? `'${fontConfig.CommentatorNameFont}', sans-serif`
                          : undefined,
                        fontSize: getFontSize(
                          fontConfig.CommentatorNameFontSize
                        ),
                      }}
                    >
                      {c2.name}
                    </h6>
                  )}
                  {isValidTag(c2.tag) && (
                    <span
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        fontFamily: fontConfig.CommentatorTagFont
                          ? `'${fontConfig.CommentatorTagFont}', sans-serif`
                          : undefined,
                        fontSize:
                          getFontSize(fontConfig.CommentatorTagFontSize) ||
                          '0.9em',
                      }}
                    >
                      {c2.tag}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Комментатор 3 */}
            {c3.name && (
              <motion.div
                className={styles.commentatorDiv}
                variants={itemVariants}
                style={{
                  position: 'absolute',
                  backgroundColor: bgColor,
                  border: borderStyle,
                  boxShadow: glow,
                  top: layout?.commentator3?.top,
                  left: layout?.commentator3?.left,
                  right: layout?.commentator3?.right,
                  width: layout?.commentator3?.width,
                  height: layout?.commentator3?.height,
                  ...(isVideoFile(imgs?.commentator3Image?.imageName)
                    ? {}
                    : bgStyleFor(ImageType.Commentator3Image)),
                }}
              >
                {isVideoFile(imgs?.commentator3Image?.imageName) && (
                  <MediaBackground
                    imageName={imgs?.commentator3Image?.imageName}
                    imageType={ImageType.Commentator3Image}
                    uploadedAt={imgs?.commentator3Image?.uploadedAt}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {c3.flag && c3.flag !== 'none' && (
                    <img
                      src={getFlagPath(c3.flag)}
                      alt={c3.flag}
                      style={{
                        height: '30px',
                        marginBottom: '5px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {c3.name && (
                    <h6
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        margin: 0,
                        fontFamily: fontConfig.CommentatorNameFont
                          ? `'${fontConfig.CommentatorNameFont}', sans-serif`
                          : undefined,
                        fontSize: getFontSize(
                          fontConfig.CommentatorNameFontSize
                        ),
                      }}
                    >
                      {c3.name}
                    </h6>
                  )}
                  {isValidTag(c3.tag) && (
                    <span
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        fontFamily: fontConfig.CommentatorTagFont
                          ? `'${fontConfig.CommentatorTagFont}', sans-serif`
                          : undefined,
                        fontSize:
                          getFontSize(fontConfig.CommentatorTagFontSize) ||
                          '0.9em',
                      }}
                    >
                      {c3.tag}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Комментатор 4 */}
            {c4.name && (
              <motion.div
                className={styles.commentatorDiv}
                variants={itemVariants}
                style={{
                  position: 'absolute',
                  backgroundColor: bgColor,
                  border: borderStyle,
                  boxShadow: glow,
                  top: layout?.commentator4?.top,
                  left: layout?.commentator4?.left,
                  right: layout?.commentator4?.right,
                  width: layout?.commentator4?.width,
                  height: layout?.commentator4?.height,
                  ...(isVideoFile(imgs?.commentator4Image?.imageName)
                    ? {}
                    : bgStyleFor(ImageType.Commentator4Image)),
                }}
              >
                {isVideoFile(imgs?.commentator4Image?.imageName) && (
                  <MediaBackground
                    imageName={imgs?.commentator4Image?.imageName}
                    imageType={ImageType.Commentator4Image}
                    uploadedAt={imgs?.commentator4Image?.uploadedAt}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {c4.flag && c4.flag !== 'none' && (
                    <img
                      src={getFlagPath(c4.flag)}
                      alt={c4.flag}
                      style={{
                        height: '30px',
                        marginBottom: '5px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {c4.name && (
                    <h6
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        margin: 0,
                        fontFamily: fontConfig.CommentatorNameFont
                          ? `'${fontConfig.CommentatorNameFont}', sans-serif`
                          : undefined,
                        fontSize: getFontSize(
                          fontConfig.CommentatorNameFontSize
                        ),
                      }}
                    >
                      {c4.name}
                    </h6>
                  )}
                  {isValidTag(c4.tag) && (
                    <span
                      style={{
                        color: c.playerNamesColor,
                        textShadow: getTextOutline(
                          c.textOutlineColor || '#000000'
                        ),
                        fontFamily: fontConfig.CommentatorTagFont
                          ? `'${fontConfig.CommentatorTagFont}', sans-serif`
                          : undefined,
                        fontSize:
                          getFontSize(fontConfig.CommentatorTagFontSize) ||
                          '0.9em',
                      }}
                    >
                      {c4.tag}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Спонсорский баннер */}
          </motion.div>
        )}
      </AnimatePresence>
      <SponsorBanner />
    </>
  );
};

export default Scoreboard;
