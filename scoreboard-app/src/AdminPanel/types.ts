export type Player = {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
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
  textColor: string; // primary -> textColor (цвет текста)
  scoreColor: string; // secondary -> scoreColor (цвет чисел счетчиков)
  scoreBackgroundColor: string; // фон счетчиков
  titleColor: string; // accent -> titleColor (цвет metaTitle)
  backgroundColor: string; // background -> backgroundColor (фон для left, middle, right, subBar1, subBar2)
};

export const defaultPreset: ColorPreset = {
  name: "Default",
  textColor: "#3F00FF",
  scoreColor: "#fff",
  scoreBackgroundColor: "#23272f",
  titleColor: "#3F00FF",
  backgroundColor: "#fff",
};
