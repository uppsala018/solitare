import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from '@/lib/gameLogic';
import { initGame } from '@/lib/gameLogic';

interface GameStore {
  gameState: GameState | null;
  soundEnabled: boolean;
  musicEnabled: boolean;
  highScore: number;
  coins: number;
  setGameState: (state: GameState) => void;
  newGame: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  addCoins: (amount: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: null,
      soundEnabled: true,
      musicEnabled: true,
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

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
    }),
    { name: 'solitaire-crown-store' }
  )
);
