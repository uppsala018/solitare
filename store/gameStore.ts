import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from '@/lib/gameLogic';
import { initGame } from '@/lib/gameLogic';

interface GameStore {
  gameState: GameState | null;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  autoCompleteEnabled: boolean;
  theme: 'classic' | 'midnight' | 'ocean' | 'forest';
  highScore: number;
  coins: number;
  setGameState: (state: GameState) => void;
  newGame: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleHaptics: () => void;
  toggleAutoComplete: () => void;
  setTheme: (theme: GameStore['theme']) => void;
  addCoins: (amount: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: null,
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
      autoCompleteEnabled: true,
      theme: 'classic',
      highScore: 0,
      coins: 1000,

      setGameState: (state) =>
        set((s) => ({
          gameState: state,
          highScore: state.score > s.highScore ? state.score : s.highScore,
        })),

      newGame: () => set({ gameState: initGame() }),

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
      toggleAutoComplete: () => set((s) => ({ autoCompleteEnabled: !s.autoCompleteEnabled })),
      setTheme: (theme) => set({ theme }),

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
    }),
    { name: 'solitaire-crown-store' }
  )
);
