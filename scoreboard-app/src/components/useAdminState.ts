import { useCallback, useEffect, useState } from "react";
import { SignalRContext } from "../SignalRProvider";
import {
    ColorPreset,
    MetaInfoWithTimestamp,
    PlayerWithTimestamp,
    ScoreboardState,
    ScoreboardStateWithTimestamp
} from "./types";

export const useAdminState = () => {
  const [player1, setPlayer1State] = useState<PlayerWithTimestamp>({
    name: "Daigo Umehara",
    sponsor: "Red Bull",
    score: 2,
    tag: "The Beast",
    flag: "jp",
    final: "none",
    _lastEdit: 0,
    _receivedAt: 0,
  });

  const [player2, setPlayer2State] = useState<PlayerWithTimestamp>({
    name: "Tokido",
    sponsor: "Mad Catz",
    score: 1,
    tag: "Murder Face",
    flag: "jp",
    final: "none",
    _lastEdit: 0,
    _receivedAt: 0,
  });

  const [meta, setMetaState] = useState<MetaInfoWithTimestamp>({
    title: "Street Fighter 6",
    fightRule: "Grand Finals",
    _lastEdit: 0,
    _receivedAt: 0,
  });

  const [isVisible, setIsVisibleState] = useState<boolean>(true);
  const [animationDuration, setAnimationDurationState] = useState<number>(800);

  // Подписка на SignalR события
  useEffect(() => {
    const handleReceiveState = (state: ScoreboardState) => {
      const now = Date.now();
      const stateWithTimestamp: ScoreboardStateWithTimestamp = {
        ...state,
        _receivedAt: now,
      };

      // Обновляем состояние игроков, проверяя только timestamp последнего редактирования
      setPlayer1State((prev) => {
        // Если локальное изменение было больше 500мс назад, обновляем с сервера
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 500;
        return shouldUpdate
          ? { ...state.player1, _lastEdit: prev._lastEdit, _receivedAt: now }
          : prev;
      });

      setPlayer2State((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 500;
        return shouldUpdate
          ? { ...state.player2, _lastEdit: prev._lastEdit, _receivedAt: now }
          : prev;
      });

      setMetaState((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 500;
        return shouldUpdate
          ? { ...state.meta, _lastEdit: prev._lastEdit, _receivedAt: now }
          : prev;
      });

      // Обновляем видимость без проверки timestamp, так как это глобальное состояние
      setIsVisibleState(state.isVisible);
      
      // Обновляем время анимации
      if (state.animationDuration) {
        setAnimationDurationState(state.animationDuration);
      }
    };

    SignalRContext.connection?.on("ReceiveState", handleReceiveState);

    return () => {
      SignalRContext.connection?.off("ReceiveState", handleReceiveState);
    };
  }, []);

  // Методы для отправки данных с timestamp
  const setPlayer1 = useCallback(
    (playerUpdate: any) => {
      const now = Date.now();
      const updatedPlayer = { ...player1, ...playerUpdate, _lastEdit: now };
      setPlayer1State(updatedPlayer); // Оптимистичное обновление
      SignalRContext.invoke("UpdatePlayer1", updatedPlayer);
    },
    [player1],
  );

  const setPlayer2 = useCallback(
    (playerUpdate: any) => {
      const now = Date.now();
      const updatedPlayer = { ...player2, ...playerUpdate, _lastEdit: now };
      setPlayer2State(updatedPlayer); // Оптимистичное обновление
      SignalRContext.invoke("UpdatePlayer2", updatedPlayer);
    },
    [player2],
  );

  const setMeta = useCallback(
    (metaUpdate: any) => {
      const now = Date.now();
      const updatedMeta = { ...meta, ...metaUpdate, _lastEdit: now };
      setMetaState(updatedMeta); // Оптимистичное обновление
      SignalRContext.connection?.invoke("UpdateMeta", updatedMeta);
    },
    [meta],
  );

  const setVisibility = useCallback(
    (isVisible: boolean) => {
      setIsVisibleState(isVisible); // Оптимистичное обновление
      SignalRContext.connection?.invoke("UpdateVisibility", isVisible);
    },
    [],
  );

  const setAnimationDuration = useCallback(
    (duration: number) => {
      setAnimationDurationState(duration); // Оптимистичное обновление
      SignalRContext.connection?.invoke("UpdateAnimationDuration", duration);
    },
    [],
  );

  const setState = useCallback((state: any) => {
    const now = Date.now();
    setPlayer1State({ ...state.player1, _lastEdit: now }); // Оптимистичное обновление
    setPlayer2State({ ...state.player2, _lastEdit: now }); // Оптимистичное обновление
    setMetaState({ ...state.meta, _lastEdit: now }); // Оптимистичное обновление
    setIsVisibleState(state.isVisible);
    SignalRContext.invoke("SetState", state);
  }, []);

  const getState = useCallback(() => SignalRContext.invoke("GetState"), []);

  // Вспомогательные функции
  const swapPlayers = useCallback(() => {
    const now = Date.now();
    const newPlayer1 = { ...player2, _lastEdit: now };
    const newPlayer2 = { ...player1, _lastEdit: now };
    setPlayer1State(newPlayer1);
    setPlayer2State(newPlayer2);
    SignalRContext.invoke("UpdatePlayer1", newPlayer1);
    SignalRContext.invoke("UpdatePlayer2", newPlayer2);
  }, [player1, player2]);

  const reset = useCallback(() => {
    const now = Date.now();
    const initialState: ScoreboardState = {
      player1: {
        name: "Player 1",
        sponsor: "",
        score: 0,
        tag: "",
        flag: "none",
        final: "none",
      },
      player2: {
        name: "Player 2",
        sponsor: "",
        score: 0,
        tag: "",
        flag: "none",
        final: "none",
      },
      meta: {
        title: "",
        fightRule: "",
      },
      colors: {
        name: "Default",
        mainColor: "#3F00FF",
        playerNamesColor: "#ffffff",
        tournamentTitleColor: "#3F00FF",
        fightModeColor: "#3F00FF",
        scoreColor: "#ffffff",
        backgroundColor: "#23272f",
        borderColor: "#3F00FF",
      },
      isVisible: true,
      animationDuration: 800,
    };

    setPlayer1State({ ...initialState.player1, _lastEdit: now });
    setPlayer2State({ ...initialState.player2, _lastEdit: now });
    setMetaState({ ...initialState.meta, _lastEdit: now });
    setIsVisibleState(initialState.isVisible);
    setAnimationDurationState(initialState.animationDuration);
    SignalRContext.invoke("SetState", initialState);
  }, []);

  // Обработчик изменения цветов
  const handleColorChange = useCallback(
    (colorUpdate: Partial<ColorPreset>) => {
      const currentColors = {
        name: "Custom",
        mainColor: "#3F00FF",
        playerNamesColor: "#ffffff",
        tournamentTitleColor: "#3F00FF",
        fightModeColor: "#3F00FF",
        scoreColor: "#ffffff",
        backgroundColor: "#23272f",
        borderColor: "#3F00FF",
        ...colorUpdate,
      };
      SignalRContext.invoke("UpdateColors", currentColors);
    },
    [],
  );

  return {
    player1,
    player2,
    meta,
    isVisible,
    animationDuration,
    setPlayer1,
    setPlayer2,
    setMeta,
    setVisibility,
    setAnimationDuration,
    setState,
    getState,
    swapPlayers,
    reset,
    handleColorChange,
  };
}; 