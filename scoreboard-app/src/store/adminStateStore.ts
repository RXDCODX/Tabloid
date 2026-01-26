import type * as signalR from '@microsoft/signalr';
import { create } from 'zustand';
import {
  ColorPreset,
  defaultPreset,
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

const DEFAULT_META: MetaInfo = {
  title: 'Tournament',
  fightRule: 'Grand Finals',
};

const DEFAULT_LAYOUT: LayoutConfig = {
  center: { top: '15px', left: '50%', width: '540px', height: '60px' },
  left: { top: '15px', left: '167px', width: '540px', height: '120px' },
  right: { top: '15px', right: '167px', width: '540px', height: '120px' },
  fightMode: { top: '150px', left: '50%', width: '300px', height: '50px' },
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
  meta: MetaInfo;
  isVisible: boolean;
  isShowBorders: boolean;
  animationDuration: number;
  colors: ColorPreset;
  textConfig: TextConfiguration;
  backgroundImages: Images;
  layoutConfig: LayoutConfig;

  // actions (local + server)
  setPlayer1: (p: Player) => void;
  setPlayer2: (p: Player) => void;
  swapPlayers: () => void;

  setMeta: (m: MetaInfo) => void;
  setVisibility: (visible: boolean) => void;
  setAnimationDuration: (d: number) => void;

  handleColorChange: (newColors: ColorPreset) => void;
  setShowBorders: (enabled: boolean) => void;

  setTextConfig: (cfg: TextConfiguration) => void;
  setBackgroundImages: (images: Images) => void;

  setLayoutConfig: (next: LayoutConfig) => void;

  reset: () => void;

  // remote (ReceiveState)
  applyRemoteState: (state: ScoreboardState) => void;
};

export const useAdminStore = create<AdminStateStore>((set, get) => ({
  connection: null,
  setConnection: connection => set({ connection }),

  player1: DEFAULT_PLAYER_1,
  player2: DEFAULT_PLAYER_2,
  meta: DEFAULT_META,
  isVisible: true,
  isShowBorders: false,
  animationDuration: 800,
  colors: defaultPreset,
  textConfig: {},
  backgroundImages: {},
  layoutConfig: DEFAULT_LAYOUT,

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

  reset: () => {
    const connection = get().connection;
    if (isConnected(connection)) {
      void invokeSafe(connection, 'ResetToDefault');
      return;
    }

    set({
      player1: DEFAULT_PLAYER_1,
      player2: DEFAULT_PLAYER_2,
      meta: DEFAULT_META,
      isVisible: true,
      isShowBorders: false,
      animationDuration: 800,
      colors: defaultPreset,
      textConfig: {},
      backgroundImages: {},
      layoutConfig: DEFAULT_LAYOUT,
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

    if (Object.keys(patch).length > 0) {
      console.log('[adminStateStore] Applying patch', patch);
      set(patch as any);
    } else {
      console.log('[adminStateStore] No changes detected, skipping update');
    }
  },
}));
