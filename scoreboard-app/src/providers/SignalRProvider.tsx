import { HubConnection } from '@microsoft/signalr';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from 'react-signalr';

export const Scoreboard = signalR.createSignalRContext({});

// Создаем React Context для connection
const ConnectionContext = createContext<HubConnection | null>(null);

// Хук для получения connection
export const useConnection = () => {
  return useContext(ConnectionContext);
};

// Экспортируем как SignalRContext для совместимости
export const SignalRContext = Scoreboard;

interface SignalRProviderProps {
  children: React.ReactNode;
}

function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<HubConnection | null>(
    Scoreboard.connection
  );

  console.log('[ConnectionProvider] Render', {
    currentConnection: connection,
    scoreboardConnection: Scoreboard.connection,
    state: connection?.state,
  });

  useEffect(() => {
    console.log('[ConnectionProvider] useEffect triggered', {
      scoreboardConnection: Scoreboard.connection,
      currentConnection: connection,
      areEqual: Scoreboard.connection === connection,
    });
    // Обновляем connection только когда он действительно изменился
    if (Scoreboard.connection !== connection) {
      console.log('[ConnectionProvider] Updating connection');
      setConnection(Scoreboard.connection);
    }
  }, [Scoreboard.connection, connection]);

  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function ScoreboardSignalRHubWrapper({
  children,
}: SignalRProviderProps) {
  return (
    <Scoreboard.Provider
      automaticReconnect={true}
      onError={error => new Promise(resolve => resolve(console.log(error)))}
      onClosed={event => console.log(event)}
      onOpen={event => console.log(event)}
      withCredentials={false}
      url={import.meta.env.VITE_BASE_PATH + 'scoreboardHub'}
      logMessageContent
    >
      <ConnectionProvider>{children}</ConnectionProvider>
    </Scoreboard.Provider>
  );
}

// Для удобства можно экспортировать Provider отдельно
export const SignalRProvider = ScoreboardSignalRHubWrapper;
