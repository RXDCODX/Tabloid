import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CardVisibility {
  visibility: boolean;
  meta: boolean;
  colorPreset: boolean;
  borders: boolean;
  backgroundImages: boolean;
  fonts: boolean;
  layoutConfig: boolean;
  players: boolean;
  commentators: boolean;
}

export type CardKey = keyof CardVisibility;

interface AdminPanelVisibilityState {
  cardVisibility: CardVisibility;
  cardOrder: CardKey[];
  toggleCard: (cardName: CardKey) => void;
  showAll: () => void;
  hideAll: () => void;
  reorderCards: (newOrder: CardKey[]) => void;
}

const defaultVisibility: CardVisibility = {
  visibility: true,
  meta: true,
  colorPreset: true,
  borders: true,
  backgroundImages: true,
  fonts: true,
  layoutConfig: true,
  players: true,
  commentators: true,
};

const defaultCardOrder: CardKey[] = [
  'visibility',
  'meta',
  'players',
  'colorPreset',
  'borders',
  'backgroundImages',
  'fonts',
  'layoutConfig',
  'commentators',
];

export const useAdminPanelVisibilityStore = create<AdminPanelVisibilityState>()(
  persist(
    set => ({
      cardVisibility: defaultVisibility,
      cardOrder: defaultCardOrder,

      toggleCard: cardName =>
        set(state => ({
          cardVisibility: {
            ...state.cardVisibility,
            [cardName]: !state.cardVisibility[cardName],
          },
        })),

      showAll: () =>
        set({
          cardVisibility: defaultVisibility,
        }),

      hideAll: () =>
        set({
          cardVisibility: {
            visibility: false,
            meta: false,
            colorPreset: false,
            borders: false,
            backgroundImages: false,
            fonts: false,
            layoutConfig: false,
            players: false,
            commentators: false,
          },
        }),

      reorderCards: newOrder =>
        set({
          cardOrder: newOrder,
        }),
    }),
    {
      name: 'admin-panel-visibility-storage',
    }
  )
);
