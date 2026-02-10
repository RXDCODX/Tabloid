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
  commentatorTagColor?: string;
  commentatorNamesColor?: string;
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
  commentator1Image?: BackgroundImage;
  commentator2Image?: BackgroundImage;
  commentator3Image?: BackgroundImage;
  commentator4Image?: BackgroundImage;
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
  Commentator1Image = 'Commentator1Image',
  Commentator2Image = 'Commentator2Image',
  Commentator3Image = 'Commentator3Image',
  Commentator4Image = 'Commentator4Image',
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
  commentator1?: LayoutBlockSizeAndPosition;
  commentator2?: LayoutBlockSizeAndPosition;
  commentator3?: LayoutBlockSizeAndPosition;
  commentator4?: LayoutBlockSizeAndPosition;
}

export interface ScoreboardState {
  player1: Player;
  player2: Player;
  commentator1: Player;
  commentator2: Player;
  commentator3: Player;
  commentator4: Player;
  meta: MetaInfo;
  colors: ColorPreset;
  textConfig?: TextConfiguration;
  images?: Images;
  isVisible?: boolean;
  animationDuration?: number;
  isShowBorders?: boolean;
  layoutConfig?: LayoutConfig;
  fontConfig?: FontConfiguration;
}

export interface FontConfiguration {
  PlayerNameFont: string; // Шрифт для имен игроков
  PlayerNameFontSize: number; // Размер шрифта для имен игроков
  PlayerTagFont: string; // Шрифт для тегов игроков
  PlayerTagFontSize: number; // Размер шрифта для тегов игроков
  ScoreFont: string; // Шрифт для счета
  ScoreFontSize: number; // Размер шрифта для счета
  TournamentTitleFont: string; // Шрифт для заголовка турнира
  TournamentTitleFontSize: number; // Размер шрифта для заголовка турнира
  FightModeFont: string; // Шрифт для правила драки
  FightModeFontSize: number; // Размер шрифта для правила драки
  CommentatorNameFont: string; // Шрифт для имен комментаторов
  CommentatorNameFontSize: number; // Размер шрифта для имен комментаторов
  CommentatorTagFont: string; // Шрифт для тегов комментаторов
  CommentatorTagFontSize: number; // Размер шрифта для тегов комментаторов
  CommentatorScoreFont: string; // Шрифт для счета комментаторов
  CommentatorScoreFontSize: number; // Размер шрифта для счета комментаторов
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
  commentatorTagColor: '#3F00FF',
  commentatorNamesColor: '#FFFFFF',
};
