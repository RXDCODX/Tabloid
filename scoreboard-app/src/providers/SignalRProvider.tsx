import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as signalR from '@microsoft/signalr';

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

// Создаем соединение SignalR
const createConnection = (url: string, withCredentials: boolean) => {
  return new signalR.HubConnectionBuilder()
    .withUrl(url, { withCredentials })
    .withAutomaticReconnect()
    .build();
};

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
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const memoUrl = useMemo(() => url, [url]);
  const memoWithCredentials = useMemo(() => withCredentials, [withCredentials]);
  const conn = createConnection(memoUrl, memoWithCredentials);

  const start = useCallback(async () => {
    try {
      await conn.start();
    } catch {
      // Пауза и повтор при ошибке старта
      setTimeout(() => {
        if (connection?.state == signalR.HubConnectionState.Disconnected) {
          start();
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    setConnection(conn);
    start();
    return () => {
      conn.stop().catch(() => {});
    };
  }, []);

  return (
    <SignalRContext.Provider
      value={{
        connection,
        automaticReconnect,
        url: memoUrl,
        withCredentials
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};
