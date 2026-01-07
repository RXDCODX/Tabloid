import { useCallback, useContext, useEffect, useState } from 'react';
import { SignalRContext } from '../providers/SignalRProvider';
import {
  BackgroundImages,
  ColorPreset,
  defaultPreset,
  LayoutConfig,
  MetaInfo,
  Player,
  ScoreboardState,
  TextConfiguration,
} from '../types/types';
import useDebouncedCallback from './useDebouncedCallback';

export const useAdminState = () => {
  const signalRContext = useContext(SignalRContext);
  const [player1, localSetPlayer1] = useState<Player>({
    name: 'Player 1',
    sponsor: '',
    score: 0,
    tag: '',
    flag: 'none',
    final: 'none',
  });

  const [player2, localSetPlayer2] = useState<Player>({
    name: 'Player 2',
    sponsor: '',
    score: 0,
    tag: '',
    flag: 'none',
    final: 'none',
  });

  const [meta, localSetMeta] = useState<MetaInfo>({
    title: 'Tournament',
    fightRule: 'Grand Finals',
  });

  const [isVisible, localSetIsVisible] = useState<boolean>(true);
  const [isShowBorders, localSetIsShowBorders] = useState<boolean>(false);
  const [animationDuration, localSetAnimationDuration] = useState<number>(800);
  const [colors, setColors] = useState<ColorPreset>(defaultPreset);
  const [textConfig, setTextConfig] = useState<TextConfiguration>({});
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImages>(
    {}
  );

  const [layoutConfig, localSetLayoutConfig] = useState<LayoutConfig>({
    center: { top: '15px', left: '50%', width: '540px', height: '60px' },
    left: { top: '15px', left: '167px', width: '540px', height: '120px' },
    right: { top: '15px', right: '167px', width: '540px', height: '120px' },
    fightMode: { top: '150px', left: '50%', width: '300px', height: '50px' },
  });

  // debounced invoker to avoid spamming the server when typing
  const debouncedInvoke = useDebouncedCallback(
    (method: string, payload: unknown) => {
      if (!signalRContext.connection) return;
      signalRContext.connection
        .invoke(method, payload)
        .catch(err => console.error(`Error invoking ${method}:`, err));
    },
    300
  );

  const setLayoutConfig = useCallback(
    (next: LayoutConfig) => {
      localSetLayoutConfig(next);
      // debounced layout update to server (use new hub method)
      debouncedInvoke('UpdateLayoutConfig', next);
    },
    [debouncedInvoke]
  );

  const swapPlayers = useCallback(() => {
    const temp = player1;
    // use remote setters so swap is propagated to server
    setPlayer1(player2);
    setPlayer2(temp);
  }, [player1, player2]);

  const reset = useCallback(() => {
    // prefer server-side reset if connected
    if (signalRContext.connection) {
      signalRContext.connection
        .invoke('ResetToDefault')
        .catch(err => console.error('Error invoking ResetToDefault:', err));
      return;
    }
  }, [signalRContext.connection]);

  /* Remote wrappers: update local state and notify server */
  const setPlayer1 = useCallback(
    (p: Player) => {
      localSetPlayer1(p);
      debouncedInvoke('UpdatePlayer1', p);
    },
    [debouncedInvoke]
  );

  const setPlayer2 = useCallback(
    (p: Player) => {
      localSetPlayer2(p);
      debouncedInvoke('UpdatePlayer2', p);
    },
    [debouncedInvoke]
  );

  const setMeta = useCallback(
    (m: MetaInfo) => {
      localSetMeta(m);
      debouncedInvoke('UpdateMeta', m);
    },
    [debouncedInvoke]
  );

  const setVisibility = useCallback(
    (visible: boolean) => {
      localSetIsVisible(visible);
      signalRContext.connection
        ?.invoke('UpdateVisibility', visible)
        .catch(err => console.error('Error updating visibility:', err));
    },
    [signalRContext.connection]
  );

  const setAnimationDuration = useCallback(
    (d: number) => {
      localSetAnimationDuration(d);
      signalRContext.connection
        ?.invoke('UpdateAnimationDuration', d)
        .catch(err => console.error('Error updating animation duration:', err));
    },
    [signalRContext.connection]
  );

  const handleColorChange = useCallback(
    (newColors: ColorPreset) => {
      setColors(newColors);
      debouncedInvoke('UpdateColors', newColors);
    },
    [debouncedInvoke]
  );

  const setShowBorders = useCallback(
    (enabled: boolean) => {
      localSetIsShowBorders(enabled);
      signalRContext.connection
        ?.invoke('UpdateBordersShowingState', enabled)
        .catch(err => {
          console.error('Error updating borders state:', err);
        });
    },
    [signalRContext.connection]
  );

  /* ------------------------------------------------------------------> */

  const handleReceiveState = useCallback(
    (state: ScoreboardState) => {
      console.log('SignalR ReceiveState (useAdminState):', state);
      if (!state) return;
      if (state.player1) localSetPlayer1(state.player1);
      if (state.player2) localSetPlayer2(state.player2);
      if (state.meta) localSetMeta(state.meta);
      if (typeof state.isVisible === 'boolean')
        localSetIsVisible(state.isVisible);
      if (typeof state.isShowBorders === 'boolean')
        localSetIsShowBorders(state.isShowBorders as boolean);
      if (state.animationDuration)
        localSetAnimationDuration(state.animationDuration);
      if (state.colors) setColors(state.colors);
      if ((state as any).textConfig)
        setTextConfig((state as any).textConfig as TextConfiguration);
      if ((state as any).backgroundImages)
        setBackgroundImages(
          (state as any).backgroundImages as BackgroundImages
        );
      if ((state as any).layoutConfig)
        setLayoutConfig((state as any).layoutConfig as LayoutConfig);
    },
    [
      localSetPlayer1,
      localSetPlayer2,
      localSetMeta,
      localSetIsVisible,
      localSetIsShowBorders,
      localSetAnimationDuration,
      setTextConfig,
      setBackgroundImages,
      setLayoutConfig,
    ]
  );

  useEffect(() => {
    if (!signalRContext.connection) return;

    // try to start connection if not started
    signalRContext.connection.start?.().catch((err: any) => {
      // ignore if already started or not supported by provider
    });

    signalRContext.connection.on?.('ReceiveState', handleReceiveState);

    return () => {
      signalRContext.connection?.off?.('ReceiveState', handleReceiveState);
    };
  }, [signalRContext.connection]);

  return {
    player1,
    player2,
    meta,
    colors,
    isVisible,
    isShowBorders,
    animationDuration,
    textConfig,
    backgroundImages,
    layoutConfig,
    setPlayer1,
    setPlayer2,
    setMeta,
    setVisibility: setVisibility,
    setAnimationDuration,
    setTextConfig,
    setBackgroundImages,
    setLayoutConfig,
    setShowBorders,
    swapPlayers,
    reset,
    handleColorChange,
  };
};
