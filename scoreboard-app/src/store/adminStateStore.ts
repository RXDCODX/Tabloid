import type * as signalR from '@microsoft/signalr';
import { create } from 'zustand';
import {
  ColorPreset,
  defaultPreset,
  FontConfiguration,
  Images,
  LayoutConfig,
  MetaInfo,
  Player,
  ScoreboardState,
  TextConfiguration,
} from '../types/types';

const DEFAULT_PLAYER_1: Player = {
  name: 'Player 1',
  score: 0,
  tag: '',
  flag: 'ru',
  final: 'none',
};

const DEFAULT_PLAYER_2: Player = {
  name: 'Player 2',
  score: 0,
  tag: '',
  flag: 'us',
  final: 'none',
};

const DEFAULT_COMMENTATOR_1: Player = {
  name: 'Commentator 1',
  score: 0,
  tag: '',
  flag: 'ru',
  final: 'none',
};

const DEFAULT_COMMENTATOR_2: Player = {
  name: 'Commentator 2',
  score: 0,
  tag: '',
  flag: 'us',
  final: 'none',
};

const DEFAULT_COMMENTATOR_3: Player = {
  name: 'Commentator 3',
  score: 0,
  tag: '',
  flag: 'gb',
  final: 'none',
};

const DEFAULT_COMMENTATOR_4: Player = {
  name: 'Commentator 4',
  score: 0,
  tag: '',
  flag: 'it',
  final: 'none',
};

const DEFAULT_META: MetaInfo = {
  title: 'Tournament',
  fightRule: 'Grand Finals',
};

const DEFAULT_LAYOUT: LayoutConfig = {
  center: { top: '15px', left: '50%', width: '540px', height: '60px' },
  left: { top: '15px', left: '167px', width: '540px', height: '120px' },
  right: { top: '15px', right: '167px', width: '540px', height: '120px' },
  fightMode: { top: '150px', left: '50%', width: '300px', height: '50px' },
  commentator1: { top: '200px', left: '50px', width: '300px', height: '80px' },
  commentator2: { top: '200px', left: '50%', width: '300px', height: '80px' },
  commentator3: { top: '200px', right: '50px', width: '300px', height: '80px' },
  commentator4: { top: '280px', left: '50%', width: '300px', height: '80px' },
};

const isConnected = (connection: signalR.HubConnection | null) => {
  // Provider sets connection only after successful start.
  // Avoid relying on connection.state representation (enum vs string).
  return !!connection;
};

const invokeSafe = async (
  connection: signalR.HubConnection | null,
  method: string,
  payload?: unknown
) => {
  if (!isConnected(connection)) return;
  try {
    // SignalR invoke signature accepts optional args.
    if (payload === undefined) {
      await connection!.invoke(method);
    } else {
      await connection!.invoke(method, payload);
    }
  } catch (err) {
    console.error(`Error invoking ${method}:`, err);
  }
};

const debounceTimers = new Map<
  string,
  ReturnType<typeof globalThis.setTimeout>
>();
const debouncedInvoke = (
  connection: signalR.HubConnection | null,
  method: string,
  payload: unknown,
  delayMs = 300
) => {
  const existing = debounceTimers.get(method);
  if (existing) {
    console.log(`[debouncedInvoke] Clearing existing timer for ${method}`);
    globalThis.clearTimeout(existing);
  }

  const id = globalThis.setTimeout(() => {
    console.log(`[debouncedInvoke] Invoking ${method}`, payload);
    debounceTimers.delete(method);
    void invokeSafe(connection, method, payload);
  }, delayMs);

  debounceTimers.set(method, id);
};

const playersEqual = (a?: Player, b?: Player) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.name === b.name &&
    a.tag === b.tag &&
    a.flag === b.flag &&
    (a.score ?? 0) === (b.score ?? 0) &&
    a.final === b.final
  );
};

const shallowEqualObject = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    const k = ka[i];
    if (a[k] !== b[k]) return false;
  }
  return true;
};

const deepEqualLayoutConfig = (a: LayoutConfig, b: LayoutConfig) => {
  if (a === b) return true;
  if (!a || !b) return false;

  const keys: (keyof LayoutConfig)[] = ['center', 'left', 'right', 'fightMode'];
  for (const key of keys) {
    if (!shallowEqualObject(a[key], b[key])) {
      return false;
    }
  }
  return true;
};

export type AdminStateStore = {
  // connection injected from React via sync component
  connection: signalR.HubConnection | null;
  setConnection: (connection: signalR.HubConnection | null) => void;

  // state
  player1: Player;
  player2: Player;
  commentator1: Player;
  commentator2: Player;
  commentator3: Player;
  commentator4: Player;
  meta: MetaInfo;
  isVisible: boolean;
  isShowBorders: boolean;
  animationDuration: number;
  colors: ColorPreset;
  textConfig: TextConfiguration;
  backgroundImages: Images;
  layoutConfig: LayoutConfig;
  fontConfig: FontConfiguration;

  // actions (local + server)
  setPlayer1: (p: Player) => void;
  setPlayer2: (p: Player) => void;
  swapPlayers: () => void;

  setCommentator1: (p: Player) => void;
  setCommentator2: (p: Player) => void;
  setCommentator3: (p: Player) => void;
  setCommentator4: (p: Player) => void;
  swapCommentators1And2: () => void;
  swapCommentators2And3: () => void;
  swapCommentators3And4: () => void;
  swapCommentators1And3: () => void;
  swapCommentators2And4: () => void;
  swapCommentators1And2Names: () => void;
  swapCommentators3And4Names: () => void;
  swapCommentators1And3Names: () => void;
  swapCommentators2And4Names: () => void;
  resetAllCommentators: () => void;

  setMeta: (m: MetaInfo) => void;
  setVisibility: (visible: boolean) => void;
  setAnimationDuration: (d: number) => void;

  handleColorChange: (newColors: ColorPreset) => void;
  setShowBorders: (enabled: boolean) => void;

  setTextConfig: (cfg: TextConfiguration) => void;
  setBackgroundImages: (images: Images) => void;

  setLayoutConfig: (next: LayoutConfig) => void;

  setFontConfiguration: (config: FontConfiguration) => void;

  reset: () => void;

  // remote (ReceiveState)
  applyRemoteState: (state: ScoreboardState) => void;
};
export const useAdminStore = create<AdminStateStore>((set, get) => ({
  connection: null,
  setConnection: connection => set({ connection }),

  player1: DEFAULT_PLAYER_1,
  player2: DEFAULT_PLAYER_2,
  commentator1: DEFAULT_COMMENTATOR_1,
  commentator2: DEFAULT_COMMENTATOR_2,
  commentator3: DEFAULT_COMMENTATOR_3,
  commentator4: DEFAULT_COMMENTATOR_4,
  meta: DEFAULT_META,
  isVisible: true,
  isShowBorders: false,
  animationDuration: 800,
  colors: defaultPreset,
  textConfig: {},
  backgroundImages: {},
  layoutConfig: DEFAULT_LAYOUT,
  fontConfig: {
    PlayerNameFont: '',
    PlayerTagFont: '',
    ScoreFont: '',
    TournamentTitleFont: '',
    FightModeFont: '',
    CommentatorNameFont: '',
    CommentatorTagFont: '',
    CommentatorScoreFont: '',
  },

  setPlayer1: p => {
    console.log('[adminStateStore] setPlayer1', p);
    set({ player1: p });
    debouncedInvoke(get().connection, 'UpdatePlayer1', p);
  },

  setPlayer2: p => {
    console.log('[adminStateStore] setPlayer2', p);
    set({ player2: p });
    debouncedInvoke(get().connection, 'UpdatePlayer2', p);
  },

  swapPlayers: () => {
    const { player1, player2 } = get();
    // Use action wrappers so updates propagate to server
    get().setPlayer1(player2);
    get().setPlayer2(player1);
  },

  setCommentator1: p => {
    console.log('[adminStateStore] setCommentator1', p);
    set({ commentator1: p });
    debouncedInvoke(get().connection, 'UpdateCommentator1', p);
  },

  setCommentator2: p => {
    console.log('[adminStateStore] setCommentator2', p);
    set({ commentator2: p });
    debouncedInvoke(get().connection, 'UpdateCommentator2', p);
  },

  setCommentator3: p => {
    console.log('[adminStateStore] setCommentator3', p);
    set({ commentator3: p });
    debouncedInvoke(get().connection, 'UpdateCommentator3', p);
  },

  setCommentator4: p => {
    console.log('[adminStateStore] setCommentator4', p);
    set({ commentator4: p });
    debouncedInvoke(get().connection, 'UpdateCommentator4', p);
  },

  swapCommentators1And2: () => {
    const { commentator1, commentator2 } = get();
    get().setCommentator1(commentator2);
    get().setCommentator2(commentator1);
  },

  swapCommentators2And3: () => {
    const { commentator2, commentator3 } = get();
    get().setCommentator2(commentator3);
    get().setCommentator3(commentator2);
  },

  swapCommentators3And4: () => {
    const { commentator3, commentator4 } = get();
    get().setCommentator3(commentator4);
    get().setCommentator4(commentator3);
  },

  swapCommentators1And3: () => {
    const { commentator1, commentator3 } = get();
    get().setCommentator1(commentator3);
    get().setCommentator3(commentator1);
  },

  swapCommentators2And4: () => {
    const { commentator2, commentator4 } = get();
    get().setCommentator2(commentator4);
    get().setCommentator4(commentator2);
  },

  swapCommentators1And2Names: () => {
    const { commentator1, commentator2 } = get();
    get().setCommentator1({ ...commentator1, name: commentator2.name });
    get().setCommentator2({ ...commentator2, name: commentator1.name });
  },

  swapCommentators3And4Names: () => {
    const { commentator3, commentator4 } = get();
    get().setCommentator3({ ...commentator3, name: commentator4.name });
    get().setCommentator4({ ...commentator4, name: commentator3.name });
  },

  swapCommentators1And3Names: () => {
    const { commentator1, commentator3 } = get();
    get().setCommentator1({ ...commentator1, name: commentator3.name });
    get().setCommentator3({ ...commentator3, name: commentator1.name });
  },

  swapCommentators2And4Names: () => {
    const { commentator2, commentator4 } = get();
    get().setCommentator2({ ...commentator2, name: commentator4.name });
    get().setCommentator4({ ...commentator4, name: commentator2.name });
  },

  resetAllCommentators: () => {
    get().setCommentator1(DEFAULT_COMMENTATOR_1);
    get().setCommentator2(DEFAULT_COMMENTATOR_2);
    get().setCommentator3(DEFAULT_COMMENTATOR_3);
    get().setCommentator4(DEFAULT_COMMENTATOR_4);
  },

  setMeta: m => {
    set({ meta: m });
    debouncedInvoke(get().connection, 'UpdateMeta', m);
  },

  setVisibility: visible => {
    set({ isVisible: visible });
    void invokeSafe(get().connection, 'UpdateVisibility', visible);
  },

  setAnimationDuration: d => {
    set({ animationDuration: d });
    void invokeSafe(get().connection, 'UpdateAnimationDuration', d);
  },

  handleColorChange: newColors => {
    set({ colors: newColors });
    debouncedInvoke(get().connection, 'UpdateColors', newColors);
  },

  setShowBorders: enabled => {
    set({ isShowBorders: enabled });
    void invokeSafe(get().connection, 'UpdateBordersShowingState', enabled);
  },

  setTextConfig: cfg => {
    set({ textConfig: cfg });
  },

  setBackgroundImages: images => {
    set({ backgroundImages: images });
  },

  setLayoutConfig: next => {
    set({ layoutConfig: next });
    debouncedInvoke(get().connection, 'UpdateLayoutConfig', next);
  },

  setFontConfiguration: config => {
    set({ fontConfig: config });
    debouncedInvoke(get().connection, 'UpdateFontConfig', config);
  },

  reset: () => {
    const connection = get().connection;
    if (isConnected(connection)) {
      void invokeSafe(connection, 'ResetToDefault');
      return;
    }

    set({
      player1: DEFAULT_PLAYER_1,
      player2: DEFAULT_PLAYER_2,
      commentator1: DEFAULT_COMMENTATOR_1,
      commentator2: DEFAULT_COMMENTATOR_2,
      commentator3: DEFAULT_COMMENTATOR_3,
      commentator4: DEFAULT_COMMENTATOR_4,
      meta: DEFAULT_META,
      isVisible: true,
      isShowBorders: false,
      animationDuration: 800,
      colors: defaultPreset,
      textConfig: {},
      backgroundImages: {},
      layoutConfig: DEFAULT_LAYOUT,
      fontConfig: {
        PlayerNameFont: '',
        PlayerTagFont: '',
        ScoreFont: '',
        TournamentTitleFont: '',
        FightModeFont: '',
        CommentatorNameFont: '',
        CommentatorTagFont: '',
        CommentatorScoreFont: '',
      },
    });
  },

  applyRemoteState: state => {
    if (!state) return;

    console.log('[adminStateStore] applyRemoteState called', state);

    const current = get();
    const patch: Partial<AdminStateStore> = {};

    if (state.player1 && !playersEqual(state.player1, current.player1)) {
      console.log('[adminStateStore] player1 changed', {
        old: current.player1,
        new: state.player1,
      });
      patch.player1 = state.player1;
    }

    if (state.player2 && !playersEqual(state.player2, current.player2)) {
      console.log('[adminStateStore] player2 changed', {
        old: current.player2,
        new: state.player2,
      });
      patch.player2 = state.player2;
    }

    if (
      state.commentator1 &&
      !playersEqual(state.commentator1, current.commentator1)
    ) {
      console.log('[adminStateStore] commentator1 changed', {
        old: current.commentator1,
        new: state.commentator1,
      });
      patch.commentator1 = state.commentator1;
    }

    if (
      state.commentator2 &&
      !playersEqual(state.commentator2, current.commentator2)
    ) {
      console.log('[adminStateStore] commentator2 changed', {
        old: current.commentator2,
        new: state.commentator2,
      });
      patch.commentator2 = state.commentator2;
    }

    if (
      state.commentator3 &&
      !playersEqual(state.commentator3, current.commentator3)
    ) {
      console.log('[adminStateStore] commentator3 changed', {
        old: current.commentator3,
        new: state.commentator3,
      });
      patch.commentator3 = state.commentator3;
    }

    if (
      state.commentator4 &&
      !playersEqual(state.commentator4, current.commentator4)
    ) {
      console.log('[adminStateStore] commentator4 changed', {
        old: current.commentator4,
        new: state.commentator4,
      });
      patch.commentator4 = state.commentator4;
    }

    if (state.meta && !shallowEqualObject(state.meta, current.meta)) {
      patch.meta = state.meta;
    }

    if (
      typeof state.isVisible === 'boolean' &&
      state.isVisible !== current.isVisible
    ) {
      patch.isVisible = state.isVisible;
    }

    if (
      typeof state.isShowBorders === 'boolean' &&
      state.isShowBorders !== current.isShowBorders
    ) {
      patch.isShowBorders = state.isShowBorders;
    }

    if (
      state.animationDuration !== undefined &&
      state.animationDuration !== current.animationDuration
    ) {
      patch.animationDuration = state.animationDuration;
    }

    if (state.colors && !shallowEqualObject(state.colors, current.colors)) {
      patch.colors = state.colors;
    }

    if (
      state.textConfig &&
      !shallowEqualObject(state.textConfig, current.textConfig)
    ) {
      patch.textConfig = state.textConfig;
    }

    if (
      state.images &&
      !shallowEqualObject(state.images, current.backgroundImages)
    ) {
      patch.backgroundImages = state.images;
    }

    if (
      state.layoutConfig &&
      !deepEqualLayoutConfig(state.layoutConfig, current.layoutConfig)
    ) {
      console.log('[adminStateStore] layoutConfig changed', {
        old: current.layoutConfig,
        new: state.layoutConfig,
      });
      patch.layoutConfig = state.layoutConfig;
    }

    // Handle both fontConfig and FontConfig (server sends camelCase keys)
    const incomingFontConfig =
      (state as any).fontConfig || (state as any).FontConfig;
    if (incomingFontConfig) {
      // Convert camelCase keys from server to PascalCase for frontend
      const normalizedFontConfig: FontConfiguration = {
        PlayerNameFont:
          incomingFontConfig.PlayerNameFont ||
          incomingFontConfig.playerNameFont ||
          '',
        PlayerTagFont:
          incomingFontConfig.PlayerTagFont ||
          incomingFontConfig.playerTagFont ||
          '',
        ScoreFont:
          incomingFontConfig.ScoreFont || incomingFontConfig.scoreFont || '',
        TournamentTitleFont:
          incomingFontConfig.TournamentTitleFont ||
          incomingFontConfig.tournamentTitleFont ||
          '',
        FightModeFont:
          incomingFontConfig.FightModeFont ||
          incomingFontConfig.fightModeFont ||
          '',
        CommentatorNameFont:
          incomingFontConfig.CommentatorNameFont ||
          incomingFontConfig.commentatorNameFont ||
          '',
        CommentatorTagFont:
          incomingFontConfig.CommentatorTagFont ||
          incomingFontConfig.commentatorTagFont ||
          '',
        CommentatorScoreFont:
          incomingFontConfig.CommentatorScoreFont ||
          incomingFontConfig.commentatorScoreFont ||
          '',
      };

      if (!shallowEqualObject(normalizedFontConfig, current.fontConfig)) {
        console.log('[adminStateStore] fontConfig changed', {
          old: current.fontConfig,
          new: normalizedFontConfig,
          raw: incomingFontConfig,
        });
        patch.fontConfig = normalizedFontConfig;
      }
    }

    if (Object.keys(patch).length > 0) {
      console.log('[adminStateStore] Applying patch', patch);
      set(patch as any);
    } else {
      console.log('[adminStateStore] No changes detected, skipping update');
    }
  },
}));
