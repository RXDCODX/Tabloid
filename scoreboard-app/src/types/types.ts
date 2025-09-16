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

export interface ScoreboardState {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  colors: ColorPreset;
  isVisible: boolean;
  animationDuration?: number;
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
