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
  // Состояние с timestamp
  const [player1, setPlayer1State] = useState<PlayerWithTimestamp>({
    name: "Player 1",
    sponsor: "",
    score: 0,
    tag: "",
    final: "none",
  });
  const [player2, setPlayer2State] = useState<PlayerWithTimestamp>({
    name: "Player 2",
    sponsor: "",
    score: 0,
    tag: "",
    final: "none",
  });
  const [meta, setMetaState] = useState<MetaInfoWithTimestamp>({
    title: "",
    fightRule: "",
  });

  // Подписка на SignalR события
  useEffect(() => {
    const handleReceiveState = (state: ScoreboardState) => {
      const now = Date.now();
      const stateWithTimestamp: ScoreboardStateWithTimestamp = {
        ...state,
        _receivedAt: now,
      };

      // Проверяем и обновляем только те поля, которые не были изменены локально недавно
      setPlayer1State((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 1000; // Если локальное изменение было больше 1 секунды назад
        return shouldUpdate
          ? { ...state.player1, _lastEdit: prev._lastEdit }
          : prev;
      });

      setPlayer2State((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 1000;
        return shouldUpdate
          ? { ...state.player2, _lastEdit: prev._lastEdit }
          : prev;
      });

      setMetaState((prev) => {
        const shouldUpdate = !prev._lastEdit || prev._lastEdit < now - 1000;
        return shouldUpdate
          ? { ...state.meta, _lastEdit: prev._lastEdit }
          : prev;
      });
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

  const setState = useCallback((state: any) => {
    const now = Date.now();
    setPlayer1State({ ...state.player1, _lastEdit: now }); // Оптимистичное обновление
    setPlayer2State({ ...state.player2, _lastEdit: now }); // Оптимистичное обновление
    setMetaState({ ...state.meta, _lastEdit: now }); // Оптимистичное обновление
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
        final: "none",
      },
      player2: {
        name: "Player 2",
        sponsor: "",
        score: 0,
        tag: "",
        final: "none",
      },
      meta: {
        title: "",
        fightRule: "",
      },
      colors: {
        name: "Default",
        textColor: "#ffffff",
        scoreColor: "#0dcaf0",
        scoreBackgroundColor: "#23272f",
        titleColor: "#ffc107",
        backgroundColor: "#23272f",
      },
    };
    setPlayer1State({ ...initialState.player1, _lastEdit: now });
    setPlayer2State({ ...initialState.player2, _lastEdit: now });
    setMetaState({ ...initialState.meta, _lastEdit: now });
    SignalRContext.invoke("SetState", initialState);
  }, []);

  const handleColorChange = useCallback((colors: Partial<ColorPreset>) => {
    // Отправляем на сервер
    SignalRContext.connection?.invoke("UpdateColors", colors);
    
    console.log("Sending colors to server:", colors);
  }, []);

  return {
    player1,
    player2,
    meta,
    setPlayer1,
    setPlayer2,
    setMeta,
    setState,
    getState,
    swapPlayers,
    reset,
    handleColorChange,
  };
}; 