import { useState, useCallback, useEffect, useContext } from 'react';
import {
  Player,
  MetaInfo,
  ColorPreset,
  TextConfiguration,
  BackgroundImages,
  LayoutConfig,
} from '../types/types';
import { useSignalRSender } from './useSignalRSender';
import { SignalRContext } from '../providers/SignalRProvider';

export const useAdminState = () => {
  const { sendState, resetToDefault, getState } = useSignalRSender();
  const signalRContext = useContext(SignalRContext);
  const [isUpdating, setIsUpdating] = useState(false);

  const [player1, setPlayer1] = useState<Player>({
    name: 'Player 1',
    sponsor: '',
    score: 0,
    tag: '',
    flag: 'none',
    final: 'none',
  });

  const [player2, setPlayer2] = useState<Player>({
    name: 'Player 2',
    sponsor: '',
    score: 0,
    tag: '',
    flag: 'none',
    final: 'none',
  });

  const [meta, setMeta] = useState<MetaInfo>({
    title: 'Tournament',
    fightRule: 'Grand Finals',
  });

  const [colors, setColors] = useState<ColorPreset>({});

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [animationDuration, setAnimationDuration] = useState<number>(800);
  const [textConfig, setTextConfig] = useState<TextConfiguration>({});
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImages>(
    {}
  );

  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    center: { top: '15px', left: '50%', width: '540px', height: '60px' },
    left: { top: '15px', left: '167px', width: '540px', height: '120px' },
    right: { top: '15px', right: '167px', width: '540px', height: '120px' },
    fightMode: { top: '150px', left: '50%', width: '300px', height: '50px' },
  });

  const [showBorders, setShowBorders] = useState<boolean>(false);

  // Подписка на SignalR события для получения состояния с сервера
  useEffect(() => {
    const handleReceiveState = (stateJson: string) => {
      // Игнорируем входящие обновления, если мы сами отправляем состояние
      if (isUpdating) {
        return;
      }

      try {
        const state = JSON.parse(stateJson);

        if (state.player1) {
          setPlayer1(state.player1);
        }
        if (state.player2) {
          setPlayer2(state.player2);
        }
        if (state.meta) {
          setMeta(state.meta);
        }
        if (state.colors) {
          setColors(state.colors);
        }
        if (typeof state.isVisible === 'boolean') {
          setIsVisible(state.isVisible);
        }
        if (typeof state.animationDuration === 'number') {
          setAnimationDuration(state.animationDuration);
        }
        if (state.textConfig) {
          setTextConfig(state.textConfig);
        }
        if (state.backgroundImages) {
          setBackgroundImages(state.backgroundImages);
        }
        if (state.layoutConfig) {
          setLayoutConfig(state.layoutConfig);
        }
        if (typeof state.showBorders === 'boolean') {
          setShowBorders(state.showBorders);
        }
      } catch (error) {
        console.error('Ошибка парсинга состояния в useAdminState:', error);
      }
    };

    signalRContext.connection?.on('ReceiveState', handleReceiveState);

    return () => {
      signalRContext.connection?.off('ReceiveState', handleReceiveState);
    };
  }, [signalRContext.connection, isUpdating]);

  // Функция для создания полного состояния
  const createFullState = useCallback(() => {
    return {
      player1,
      player2,
      meta,
      colors,
      textConfig,
      backgroundImages,
      layoutConfig,
      isVisible,
      animationDuration,
      showBorders,
    };
  }, [
    player1,
    player2,
    meta,
    colors,
    textConfig,
    backgroundImages,
    layoutConfig,
    isVisible,
    animationDuration,
    showBorders,
  ]);

  // Функция для отправки состояния на сервер
  const sendCurrentState = useCallback(async () => {
    const state = createFullState();
    await sendState(state);
  }, [createFullState, sendState]);

  const swapPlayers = useCallback(async () => {
    const temp = player1;
    setPlayer1(player2);
    setPlayer2(temp);
    // Отправляем обновленное состояние
    setTimeout(sendCurrentState, 0);
  }, [player1, player2, sendCurrentState]);

  const reset = useCallback(async () => {
    const defaultPlayer1: Player = {
      name: 'Player 1',
      sponsor: '',
      score: 0,
      tag: '',
      flag: 'none',
      final: 'none' as const,
    };
    const defaultPlayer2: Player = {
      name: 'Player 2',
      sponsor: '',
      score: 0,
      tag: '',
      flag: 'none',
      final: 'none' as const,
    };
    const defaultMeta = {
      title: 'Tournament',
      fightRule: 'Grand Finals',
    };
    const defaultLayoutConfig = {
      center: { top: '15px', left: '50%', width: '540px', height: '60px' },
      left: { top: '15px', left: '167px', width: '540px', height: '120px' },
      right: { top: '15px', right: '167px', width: '540px', height: '120px' },
      fightMode: { top: '150px', left: '50%', width: '300px', height: '50px' },
    };

    setPlayer1(defaultPlayer1);
    setPlayer2(defaultPlayer2);
    setMeta(defaultMeta);
    setTextConfig({});
    setBackgroundImages({});
    setLayoutConfig(defaultLayoutConfig);

    // Отправляем сброшенное состояние на сервер
    await resetToDefault();
  }, [resetToDefault]);

  const handleColorChange = useCallback(
    async (newColors: ColorPreset) => {
      const current = JSON.stringify(colors || {});
      const incoming = JSON.stringify(newColors || {});
      if (current !== incoming) {
        setColors(newColors);
        setTimeout(sendCurrentState, 0);
      }
    },
    [colors, sendCurrentState]
  );

  // Функции-обертки для автоматической отправки состояния
  const updatePlayer1 = useCallback(
    async (newPlayer1: Player) => {
      setPlayer1(newPlayer1);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updatePlayer2 = useCallback(
    async (newPlayer2: Player) => {
      setPlayer2(newPlayer2);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updateMeta = useCallback(
    async (newMeta: MetaInfo) => {
      setMeta(newMeta);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updateVisibility = useCallback(
    async (newVisibility: boolean) => {
      setIsVisible(newVisibility);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updateAnimationDuration = useCallback(
    async (newDuration: number) => {
      setAnimationDuration(newDuration);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updateTextConfig = useCallback(
    async (newTextConfig: TextConfiguration) => {
      setTextConfig(newTextConfig);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updateBackgroundImages = useCallback(
    async (newBackgroundImages: BackgroundImages) => {
      setBackgroundImages(newBackgroundImages);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updateLayoutConfig = useCallback(
    async (newLayoutConfig: LayoutConfig) => {
      setLayoutConfig(newLayoutConfig);
      setTimeout(sendCurrentState, 0);
    },
    [sendCurrentState]
  );

  const updateShowBorders = useCallback(
    async (newShowBorders: boolean) => {
      setShowBorders(newShowBorders);
      setIsUpdating(true);

      try {
        // Создаем временное состояние с новым значением showBorders
        const tempState = {
          player1,
          player2,
          meta,
          colors,
          textConfig,
          backgroundImages,
          layoutConfig,
          isVisible,
          animationDuration,
          showBorders: newShowBorders,
        };
        await sendState(tempState);
      } finally {
        // Сбрасываем флаг после отправки
        setTimeout(() => setIsUpdating(false), 100);
      }
    },
    [
      player1,
      player2,
      meta,
      colors,
      textConfig,
      backgroundImages,
      layoutConfig,
      isVisible,
      animationDuration,
      sendState,
    ]
  );

  return {
    player1,
    player2,
    meta,
    colors,
    isVisible,
    animationDuration,
    textConfig,
    backgroundImages,
    layoutConfig,
    showBorders,
    // Новые функции с автоматической отправкой
    setPlayer1: updatePlayer1,
    setPlayer2: updatePlayer2,
    setMeta: updateMeta,
    setVisibility: updateVisibility,
    setAnimationDuration: updateAnimationDuration,
    setTextConfig: updateTextConfig,
    setBackgroundImages: updateBackgroundImages,
    setLayoutConfig: updateLayoutConfig,
    setShowBorders: updateShowBorders,
    // Старые функции для совместимости
    swapPlayers,
    reset,
    handleColorChange,
    // Дополнительные функции
    sendCurrentState,
  };
};
