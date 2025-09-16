export interface ColorPreset {
  mainColor?: string;
  playerNamesColor?: string;
  tournamentTitleColor?: string;
  fightModeColor?: string;
  scoreColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface MetaInfoWithTimestamp {
  title: string;
  fightRule: string;
  timestamp: number;
}

export interface PlayerWithTimestamp {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  flag: string;
  final: string;
  timestamp: number;
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
