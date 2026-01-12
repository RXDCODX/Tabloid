import * as signalR from '@microsoft/signalr';
import React, { createContext, useEffect, useState } from 'react';

export interface SignalRContextType {
  connection: signalR.HubConnection | null;
  automaticReconnect: boolean;
  withCredentials: boolean;
  url: string;
}

export const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  automaticReconnect: false,
  withCredentials: false,
  url: '',
});

// Провайдер для SignalR
export const SignalRProvider: React.FC<{
  children: React.ReactNode;
  url: string;
  withCredentials?: boolean;
  automaticReconnect?: boolean;
}> = ({
  children,
  url,
  withCredentials = false,
  automaticReconnect = true,
}) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Debug)
      .withUrl(url, {
        withCredentials,
      })
      .withAutomaticReconnect()
      .build();

    // Не выставляем connection до успешного старта — компоненты не будут
    // пытаться вызвать методы hub до того, как соединение действительно
    // установлено. Это предотвращает ошибки "Cannot send data if the
    // connection is not in the 'Connected' State.".
    newConnection
      .start()
      .then(() => {
        console.log('SignalR Connected');
        setConnection(newConnection);
      })
      .catch(err => console.error('SignalR Connection Error: ', err));

    return () => {
      // stop актуального экземпляра (даже если не установлен в state)
      newConnection.stop();
      setConnection(null);
    };
  }, [url, withCredentials]);

  return (
    <SignalRContext.Provider
      value={{
        connection,
        automaticReconnect,
        withCredentials,
        url,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};
