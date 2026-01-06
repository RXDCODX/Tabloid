import { useCallback, useContext, useState } from 'react';
import { SignalRContext } from '../providers/SignalRProvider';
import {
    BackgroundImages,
    ColorPreset,
    LayoutConfig,
    MetaInfo,
    Player,
    TextConfiguration,
} from '../types/types';

export const useAdminState = () => {
  const signalRContext = useContext(SignalRContext);
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

  const swapPlayers = useCallback(() => {
    const temp = player1;
    setPlayer1(player2);
    setPlayer2(temp);
  }, [player1, player2]);

  const reset = useCallback(() => {
    setPlayer1({
      name: 'Player 1',
      sponsor: '',
      score: 0,
      tag: '',
      flag: 'none',
      final: 'none',
    });
    setPlayer2({
      name: 'Player 2',
      sponsor: '',
      score: 0,
      tag: '',
      flag: 'none',
      final: 'none',
    });
    setMeta({
      title: 'Tournament',
      fightRule: 'Grand Finals',
    });
    setTextConfig({});
    setBackgroundImages({});
    setLayoutConfig({
      center: { top: '15px', left: '50%', width: '540px', height: '60px' },
      left: { top: '15px', left: '167px', width: '540px', height: '120px' },
      right: { top: '15px', right: '167px', width: '540px', height: '120px' },
      fightMode: { top: '150px', left: '50%', width: '300px', height: '50px' },
    });
  }, []);

  const handleColorChange = useCallback((colors: ColorPreset) => {
    signalRContext.connection?.invoke('UpdateColors', colors).catch((err) => {
      console.error('Error updating colors:', err);
    });
  }, [signalRContext.connection]);

  return {
    player1,
    player2,
    meta,
    isVisible,
    animationDuration,
    textConfig,
    backgroundImages,
    layoutConfig,
    setPlayer1,
    setPlayer2,
    setMeta,
    setVisibility: setIsVisible,
    setAnimationDuration,
    setTextConfig,
    setBackgroundImages,
    setLayoutConfig,
    swapPlayers,
    reset,
    handleColorChange,
  };
};
