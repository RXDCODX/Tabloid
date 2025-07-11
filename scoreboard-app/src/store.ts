import { create } from 'zustand';

interface Player {
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  final: 'none' | 'winner' | 'loser';
}

interface MetaInfo {
  title: string;
  fightRule: string;
}

interface ScoreboardState {
  player1: Player;
  player2: Player;
  meta: MetaInfo;
  setPlayer1: (player: Partial<Player>) => void;
  setPlayer2: (player: Partial<Player>) => void;
  setMeta: (meta: Partial<MetaInfo>) => void;
  swapPlayers: () => void;
  reset: () => void;
}

const initialPlayer: Player = {
  name: 'Player 1',
  sponsor: '',
  score: 0,
  tag: '',
  final: 'none',
};
const initialPlayer2: Player = {
  name: 'Player 2',
  sponsor: '',
  score: 0,
  tag: '',
  final: 'none',
};
const initialMeta: MetaInfo = {
  title: '',
  fightRule: '',
};

export const useScoreboardStore = create<ScoreboardState>((set, get) => ({
  player1: { ...initialPlayer },
  player2: { ...initialPlayer2 },
  meta: { ...initialMeta },
  setPlayer1: (player) => set((state) => ({ player1: { ...state.player1, ...player } })),
  setPlayer2: (player) => set((state) => ({ player2: { ...state.player2, ...player } })),
  setMeta: (meta) => set((state) => ({ meta: { ...state.meta, ...meta } })),
  swapPlayers: () => set((state) => ({ player1: state.player2, player2: state.player1 })),
  reset: () => set({ player1: { ...initialPlayer }, player2: { ...initialPlayer2 }, meta: { ...initialMeta } }),
})); 