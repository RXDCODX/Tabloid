export interface Player {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  flag: string;
  final: 'winner' | 'loser' | 'none';
}

export interface MetaInfo {
  title: string;
  fightRule: string;
}

export interface ColorPreset {
  mainColor?: string;
  playerNamesColor?: string;
  tournamentTitleColor?: string;
  fightModeColor?: string;
  scoreColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface TextConfiguration {
  player1NameText?: string;
  player2NameText?: string;
  tournamentTitleText?: string;
  fightModeText?: string;
  player1ScoreText?: string;
  player2ScoreText?: string;
}

export interface Images {
  centerImage?: string;
  leftImage?: string;
  rightImage?: string;
  fightModeImage?: string;
}

export interface LayoutBlockSizeAndPosition {
  top?: string; // e.g. "15px" | "10%"
  left?: string; // e.g. "167px" | "5%"
  right?: string; // e.g. "167px" | "5%"
  width?: string; // e.g. "540px" | "50%"
  height?: string; // e.g. "120px" | "10%"
}

export interface LayoutConfig {
  center?: LayoutBlockSizeAndPosition; // Заголовок турнира
  left?: LayoutBlockSizeAndPosition; // Контейнер игрока 1
  right?: LayoutBlockSizeAndPosition; // Контейнер игрока 2
  fightMode?: LayoutBlockSizeAndPosition; // Контейнер режима боя
}

export interface ScoreboardState {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  colors: ColorPreset;
  textConfig: TextConfiguration;
  images: Images;
  isVisible: boolean;
  animationDuration: number;
  isShowBorders?: boolean;
  layoutConfig?: LayoutConfig;
}

export const defaultPreset: ColorPreset = {
  mainColor: '#3F00FF',
  playerNamesColor: '#FFFFFF',
  tournamentTitleColor: '#FFFFFF',
  fightModeColor: '#FFFFFF',
  scoreColor: '#FFFFFF',
  backgroundColor: '#1a1a1a',
  borderColor: '#3F00FF',
};
