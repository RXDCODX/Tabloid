import { useState, useCallback } from 'react';
import {
  Player,
  MetaInfo,
  ColorPreset,
  TextConfiguration,
  BackgroundImages,
} from '../types/types';

export const useAdminState = () => {
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
  }, []);

  const handleColorChange = useCallback((colors: ColorPreset) => {
    // Здесь можно добавить логику для изменения цветов
    console.log('Colors changed:', colors);
  }, []);

  return {
    player1,
    player2,
    meta,
    isVisible,
    animationDuration,
    textConfig,
    backgroundImages,
    setPlayer1,
    setPlayer2,
    setMeta,
    setVisibility: setIsVisible,
    setAnimationDuration,
    setTextConfig,
    setBackgroundImages,
    swapPlayers,
    reset,
    handleColorChange,
  };
};
