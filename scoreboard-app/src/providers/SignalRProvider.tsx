import React, { createContext } from 'react';
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
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url, {
      withCredentials,
    })
    .withAutomaticReconnect()
    .build();

  return connection;
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
  const connection = createConnection(url, withCredentials);

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
