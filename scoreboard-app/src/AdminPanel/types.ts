export type Player = {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  flag: string;
  final: string; // "winner", "loser", "none"
};

export type MetaInfo = {
  title: string;
  fightRule: string;
};

export type ScoreboardState = {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  colors: ColorPreset;
  isVisible: boolean; // Новое поле для управления видимостью
  animationDuration?: number; // Время анимации в миллисекундах
};

// Типы с timestamp для отслеживания времени изменений
export type PlayerWithTimestamp = Player & {
  _lastEdit?: number;
};

export type MetaInfoWithTimestamp = MetaInfo & {
  _lastEdit?: number;
};

export type ScoreboardStateWithTimestamp = {
  player1: PlayerWithTimestamp;
  player2: PlayerWithTimestamp;
  meta: MetaInfoWithTimestamp;
  _receivedAt?: number;
};

export type ColorPreset = {
  name: string;
  mainColor: string; // Основной цвет для тегов и неонового свечения
  playerNamesColor: string; // Цвет имен игроков
  tournamentTitleColor: string; // Цвет названия турнира
  fightModeColor: string; // Цвет режима драки
  scoreColor: string; // Цвет счета
  backgroundColor: string; // Цвет фона всех дивов
  borderColor: string; // Цвет обводки всех дивов
};

export const defaultPreset: ColorPreset = {
  name: "Default",
  mainColor: "#3F00FF",
  playerNamesColor: "#ffffff",
  tournamentTitleColor: "#3F00FF",
  fightModeColor: "#3F00FF",
  scoreColor: "#ffffff",
  backgroundColor: "#23272f",
  borderColor: "#3F00FF",
};
