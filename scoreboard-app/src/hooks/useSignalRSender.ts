import { useContext } from 'react';
import { SignalRContext } from '../providers/SignalRProvider';

export const useSignalRSender = () => {
  const signalRContext = useContext(SignalRContext);

  const sendState = async (state: any) => {
    if (!signalRContext.connection) {
      console.error('SignalR соединение не установлено');
      return;
    }

    try {
      const stateJson = JSON.stringify(state);
      await signalRContext.connection.invoke('SetState', stateJson);
    } catch (error) {
      console.error('Ошибка отправки состояния:', error);
    }
  };

  const resetToDefault = async () => {
    if (!signalRContext.connection) {
      console.error('SignalR соединение не установлено');
      return;
    }

    try {
      await signalRContext.connection.invoke('ResetToDefault');
    } catch (error) {
      console.error('Ошибка сброса к дефолтному состоянию:', error);
    }
  };

  const getState = async () => {
    if (!signalRContext.connection) {
      console.error('SignalR соединение не установлено');
      return;
    }

    try {
      await signalRContext.connection.invoke('GetState');
    } catch (error) {
      console.error('Ошибка получения состояния:', error);
    }
  };

  return {
    sendState,
    resetToDefault,
    getState,
    isConnected: !!signalRContext.connection,
  };
};
