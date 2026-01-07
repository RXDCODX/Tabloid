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

    // Устанавливаем connection сразу, чтобы компоненты могли подписаться на обработчики
    setConnection(newConnection);

    newConnection
      .start()
      .then(() => {
        console.log('SignalR Connected');
      })
      .catch(err => console.error('SignalR Connection Error: ', err));

    return () => {
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
