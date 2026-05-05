'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import * as GL from '@/lib/gameLogic';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface ScoreEvent {
  id: string;
  amount: number;
}

interface State {
  game: GL.GameState;
  history: GL.GameState[];
}

type Action =
  | { type: 'DRAW' }
  | { type: 'MOVE_FOUNDATION'; source: GL.MoveSource }
  | { type: 'MOVE_TABLEAU';    source: GL.MoveSource; toPile: number }
  | { type: 'UNDO' }
  | { type: 'NEW_GAME' }
  | { type: 'SET_GAME'; game: GL.GameState };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'DRAW':
      return { game: GL.drawFromStock(state.game), history: [...state.history.slice(-50), state.game] };

    case 'MOVE_FOUNDATION': {
      const next = GL.moveToFoundation(state.game, action.source);
      if (!next) return state;
      return { game: next, history: [...state.history.slice(-50), state.game] };
    }

    case 'MOVE_TABLEAU': {
      const next = GL.moveToTableau(state.game, action.source, action.toPile);
      if (!next) return state;
      return { game: next, history: [...state.history.slice(-50), state.game] };
    }

    case 'UNDO':
      if (!state.history.length) return state;
      return { game: state.history[state.history.length - 1], history: state.history.slice(0, -1) };

    case 'NEW_GAME':
      return { game: GL.initGame(), history: [] };

    case 'SET_GAME':
      return { ...state, game: action.game };

    default:
      return state;
  }
}

export function useGame(tournamentId?: string) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    game: GL.initGame(),
    history: [] as GL.GameState[],
  }));

  const { user } = useAuth();
  const gameRef = useRef(state.game);
  gameRef.current = state.game;

  const [scoreEvents, setScoreEvents] = useState<ScoreEvent[]>([]);
  const prevScore = useRef(0);

  useEffect(() => {
    const diff = state.game.score - prevScore.current;
    if (diff > 0) {
      const id = `${Date.now()}-${Math.random()}`;
      setScoreEvents((ev) => [...ev, { id, amount: diff }]);
      setTimeout(() => setScoreEvents((ev) => ev.filter((e) => e.id !== id)), 1500);
    }
    prevScore.current = state.game.score;
  }, [state.game.score]);

  const draw = useCallback(() => dispatch({ type: 'DRAW' }), []);

  const moveTo = useCallback(
    (source: GL.MoveSource, dest: 'foundation' | 'tableau', toPile?: number) => {
      if (dest === 'foundation') {
        dispatch({ type: 'MOVE_FOUNDATION', source });
      } else if (typeof toPile === 'number') {
        dispatch({ type: 'MOVE_TABLEAU', source, toPile });
      }
    },
    []
  );

  const autoMove = useCallback((source: GL.MoveSource): boolean => {
    const best = GL.findBestMove(gameRef.current, source);
    if (!best) return false;
    if (best.dest === 'foundation') {
      dispatch({ type: 'MOVE_FOUNDATION', source });
    } else {
      dispatch({ type: 'MOVE_TABLEAU', source, toPile: best.pileIndex });
    }
    return true;
  }, []);

  const undo    = useCallback(() => dispatch({ type: 'UNDO' }), []);

  const newGame = useCallback(() => {
    prevScore.current = 0;
    dispatch({ type: 'NEW_GAME' });
  }, []);

  const startAutoComplete = useCallback(() => {
    let current = gameRef.current;
    function step() {
      const next = GL.autoCompleteStep(current);
      if (!next) return;
      current = next;
      dispatch({ type: 'SET_GAME', game: next });
      if (!next.isWon) setTimeout(step, 80);
    }
    step();
  }, []);

  const saveSession = useCallback(
    async (timeRemaining: number) => {
      if (!user) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('game_sessions') as any).insert({
          user_id: user.id,
          tournament_id: tournamentId ?? null,
          score: gameRef.current.score,
          moves: gameRef.current.moves,
          time_remaining: timeRemaining,
          completed: gameRef.current.isWon,
        });
      } catch (_) { /* silent */ }
    },
    [user, tournamentId]
  );

  return {
    game: state.game,
    canUndo: state.history.length > 0,
    scoreEvents,
    isAutoCompletable: GL.canAutoComplete(state.game),
    draw,
    moveTo,
    autoMove,
    undo,
    newGame,
    startAutoComplete,
    saveSession,
  };
}
