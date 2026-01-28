export type TimeStamp = {
  _lastEdit?: number;
};

export interface Player {
  name: string;
  score: number;
  tag: string;
  flag: string;
  final: 'winner' | 'loser' | 'none' | string;
}

export interface MetaInfo {
  title: string;
  fightRule: string;
}

export type PlayerWithTimestamp = Player & TimeStamp;
export type MetaInfoWithTimestamp = MetaInfo & TimeStamp;

export type ScoreboardStateWithTimestamp = {
  player1: PlayerWithTimestamp;
  player2: PlayerWithTimestamp;
  meta: MetaInfoWithTimestamp;
  _receivedAt?: number;
};

export interface ColorPreset {
  name?: string;
  mainColor?: string;
  playerNamesColor?: string;
  tournamentTitleColor?: string;
  fightModeColor?: string;
  scoreColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  textOutlineColor?: string;
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
  centerImage?: BackgroundImage;
  leftImage?: BackgroundImage;
  rightImage?: BackgroundImage;
  fightModeImage?: BackgroundImage;
}

export interface BackgroundImage {
  imageName: string;
  imageType: ImageType;
  isShouldExists: boolean;
  uploadedAt?: number;
}

export enum ImageType {
  None = 'None',
  LeftImage = 'LeftImage',
  RightImage = 'RightImage',
  TopImage = 'TopImage',
  FightModeImage = 'FightModeImage',
}

export interface LayoutBlockSizeAndPosition {
  top?: string;
  left?: string;
  right?: string;
  width?: string;
  height?: string;
}

export interface LayoutConfig {
  center?: LayoutBlockSizeAndPosition;
  left?: LayoutBlockSizeAndPosition;
  right?: LayoutBlockSizeAndPosition;
  fightMode?: LayoutBlockSizeAndPosition;
}

export interface ScoreboardState {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  colors: ColorPreset;
  textConfig?: TextConfiguration;
  images?: Images;
  isVisible?: boolean;
  animationDuration?: number;
  isShowBorders?: boolean;
  layoutConfig?: LayoutConfig;
}

export const defaultPreset: ColorPreset = {
  name: 'Default',
  mainColor: '#3F00FF',
  playerNamesColor: '#FFFFFF',
  tournamentTitleColor: '#FFFFFF',
  fightModeColor: '#FFFFFF',
  scoreColor: '#FFFFFF',
  backgroundColor: '#1a1a1a',
  borderColor: '#3F00FF',
  textOutlineColor: '#000000',
};
