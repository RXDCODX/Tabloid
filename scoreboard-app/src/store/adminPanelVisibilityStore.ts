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
}

interface AdminPanelVisibilityState {
  cardVisibility: CardVisibility;
  toggleCard: (cardName: keyof CardVisibility) => void;
  showAll: () => void;
  hideAll: () => void;
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
};

export const useAdminPanelVisibilityStore = create<AdminPanelVisibilityState>()(
  persist(
    set => ({
      cardVisibility: defaultVisibility,

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
          },
        }),
    }),
    {
      name: 'admin-panel-visibility-storage',
    }
  )
);
