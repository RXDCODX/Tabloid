# Scoreboard Backend (.NET 9.0 + SignalR)

## Запуск

1. Перейти в папку backend:
   ```sh
   cd scoreboard-backend
   ```
2. Запустить сервер:
   ```sh
   dotnet run
   ```
   По умолчанию сервер стартует на http://localhost:5000 (или другом свободном порту).

3. Swagger доступен по адресу:
   - http://localhost:5000/swagger

## SignalR Hub

- Адрес хаба: `http://localhost:5000/scoreboardHub`
- Методы:
  - `GetState()` — получить текущее состояние
  - `UpdatePlayer1(Player)` — обновить игрока 1
  - `UpdatePlayer2(Player)` — обновить игрока 2
  - `UpdateMeta(MetaInfo)` — обновить meta-информацию
  - `SetState(ScoreboardState)` — обновить всё состояние
- Событие:
  - `ReceiveState(ScoreboardState)` — сервер отправляет новое состояние всем клиентам

## Пример клиента SignalR для React

```js
import { HubConnectionBuilder } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
  .withUrl('http://localhost:5000/scoreboardHub')
  .withAutomaticReconnect()
  .build();

// Подключение
connection.start().then(() => {
  // Получить начальное состояние
  connection.invoke('GetState');
});

// Получение состояния
connection.on('ReceiveState', (state) => {
  console.log('Новое состояние:', state);
  // setState(state) — обновить состояние в React
});

// Пример обновления игрока 1
function updatePlayer1(player) {
  connection.invoke('UpdatePlayer1', player);
}
```

## CORS
- Для фронта разрешён адрес: `http://localhost:5173`
- Если порт другой — изменить в `Program.cs`

## Хранилище
- Все данные хранятся в памяти (in-memory). Для production можно реализовать хранение в БД.

---
Если возникнут вопросы по интеграции — пиши! 