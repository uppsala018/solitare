'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Power, RotateCcw, List, Sparkles } from 'lucide-react';
import type { MoveSource } from '@/lib/gameLogic';
import { SUITS } from '@/lib/gameLogic';
import type { DragItem } from '@/types/game';
import { useGame } from '@/hooks/useGame';
import { useTimer } from '@/hooks/useTimer';
import { useSound } from '@/hooks/useSound';
import { supabase } from '@/lib/supabase';
import type { Tournament } from '@/types/database';
import GameHeader from './GameHeader';
import TableauPile from './TableauPile';
import FoundationPile from './FoundationPile';
import StockPile from './StockPile';
import ScoreFloat from './ScoreFloat';
import ScorePopup from './ScorePopup';
import EndGameModal from './EndGameModal';
import RulesModal from './RulesModal';
import SettingsModal from '@/components/ui/SettingsModal';
import Particles from '@/components/ui/Particles';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { useTournament } from '@/hooks/useTournament';
import TournamentResultsModal from '@/components/lobby/TournamentResultsModal';

interface GameBoardProps {
  tournamentId?: string;
}

export default function GameBoard({ tournamentId }: GameBoardProps) {
  const {
    game, canUndo, scoreEvents, isAutoCompletable,
    draw, moveTo, autoMove, undo, newGame, startAutoComplete, saveSession,
  } = useGame(tournamentId);

  const [showEnd,        setShowEnd]        = useState(false);
  const [showRules,      setShowRules]      = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showTournamentResults, setShowTournamentResults] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [invalidCard, setInvalidCard] = useState<{ pileIndex: number; cardIndex: number; pulse: number } | null>(null);
  const { hapticsEnabled, autoCompleteEnabled } = useGameStore();
  const { user } = useAuth();
  const { leaderboard, subscribeToLeaderboard, enterTournament } = useTournament();

  const { playFlip, playPlace, playFoundation, playWin, playInvalid, playTick } = useSound();

  const started = useRef(false);
  const wonRef  = useRef(false);

  useEffect(() => {
    if (!tournamentId) {
      setTournament(null);
      return;
    }

    async function loadTournament() {
      const { data, error } = await (supabase.from('tournaments') as any)
        .select('id,name,theme,prize_pool,entry_fee,max_players,current_players,ends_at,multiplier,is_active,created_at')
        .eq('id', tournamentId)
        .single();
      if (error) console.error('Failed to load tournament banner', error);
      setTournament(data ?? null);
    }

    loadTournament();
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;
    const unsubscribe = subscribeToLeaderboard(tournamentId);
    return unsubscribe;
  }, [tournamentId, subscribeToLeaderboard]);

  function ensureStarted() {
    if (!started.current) { started.current = true; timer.start(); }
  }

  const handleExpire = useCallback(() => {
    saveSession(0);
    setShowEnd(true);
  }, [saveSession]);

  const timer = useTimer(handleExpire);

  // Win detection via effect (safe — no side-effects in render)
  useEffect(() => {
    if (game.isWon && !wonRef.current) {
      wonRef.current = true;
      playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
      if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.([50, 30, 50]);
      timer.pause();
      saveSession(timer.timeLeft);
      const t = setTimeout(() => {
        if (tournamentId) setShowTournamentResults(true);
        else setShowEnd(true);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [game.isWon]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick when under 1 minute, every 10 s
  useEffect(() => {
    if (timer.timeLeft <= 60 && timer.timeLeft > 0 && timer.timeLeft % 10 === 0) {
      playTick();
    }
  }, [timer.timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── handlers ── */

  const handleDraw = () => {
    ensureStarted();
    draw();
    if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(10);
    playFlip();
  };

  const handleDrop = useCallback(
    (item: DragItem, dest: 'foundation' | 'tableau', toPile?: number) => {
      ensureStarted();
      const moved = moveTo(item.source, dest, toPile);
      if (moved) {
        if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(30);
        if (dest === 'foundation') playFoundation();
        else playPlace();
      } else {
        if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(100);
        playInvalid();
      }
    },
    [moveTo, playPlace, playFoundation], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleCardClick = useCallback(
    (pileIndex: number, cardIndex: number) => {
      ensureStarted();
      const source: MoveSource = { type: 'tableau', pileIndex, cardIndex };
      const moved = autoMove(source);
      if (moved) {
        if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(30);
        playPlace();
      } else {
        setInvalidCard({ pileIndex, cardIndex, pulse: Date.now() });
        if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(100);
        playInvalid();
      }
    },
    [autoMove, playPlace, playInvalid], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleCardDblClick = useCallback(
    (pileIndex: number, cardIndex: number) => {
      ensureStarted();
      const moved = moveTo({ type: 'tableau', pileIndex, cardIndex }, 'foundation');
      if (moved) playFoundation();
      else {
        setInvalidCard({ pileIndex, cardIndex, pulse: Date.now() });
        if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(100);
        playInvalid();
      }
    },
    [moveTo, playFoundation], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleWasteTap = useCallback(() => {
    if (!game.waste.length) return;
    ensureStarted();
    const moved = autoMove({ type: 'waste' });
    if (moved) {
      if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(30);
      playPlace();
    } else {
      if (hapticsEnabled && typeof navigator !== 'undefined') navigator.vibrate?.(100);
      playInvalid();
    }
  }, [game.waste, autoMove, playPlace, playInvalid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUndo = () => {
    if (!canUndo) return;
    undo();
    playFlip();
  };

  const handleNewGame = () => {
    newGame();
    timer.reset();
    wonRef.current   = false;
    started.current  = false;
    setShowEnd(false);
    setShowConfirmEnd(false);
  };

  const handleEndConfirm = () => {
    timer.pause();
    saveSession(timer.timeLeft);
    if (tournamentId) setShowTournamentResults(true);
    else setShowEnd(true);
    setShowConfirmEnd(false);
  };

  const timeUsed = 300 - timer.timeLeft;
  const finalScore = game.score + (game.isWon ? timer.bonus : 0);

  /* ── layout ── */

  return (
    <div className="flex flex-col min-h-screen gradient-purple select-none safe-top safe-bottom overflow-hidden">
      <GameHeader
        timeFormatted={timer.formatted}
        score={game.score}
        timeLeft={timer.timeLeft}
        onSettings={() => setShowSettings(true)}
        tournamentName={tournament ? `${tournament.theme} - ${tournament.name}` : undefined}
        tournamentPrizePool={tournament ? Number(tournament.prize_pool) : undefined}
      />

      {/* Top row: 4 foundations + gap + stock/waste */}
      <div
        className="grid grid-cols-7 gap-1 px-2 mb-2 w-full max-w-5xl mx-auto"
        style={{
          ['--game-card-h' as string]: 'clamp(78px, 13.8vw, 158px)',
          ['--game-card-fd-offset' as string]: 'clamp(14px, 2.2vw, 24px)',
          ['--game-card-fu-offset' as string]: 'clamp(22px, 3.4vw, 38px)',
        }}
      >
        {SUITS.map((suit) => (
          <FoundationPile
            key={suit}
            suit={suit}
            cards={game.foundations[suit]}
            onDrop={(item) => handleDrop(item, 'foundation')}
          />
        ))}
        {/* col 5: spacer */}
          <div className="h-[var(--game-card-h)] rounded-lg opacity-0 pointer-events-none" />
        {/* cols 6-7: stock + waste */}
        <div className="col-span-2">
          <StockPile
            stockCount={game.stock.length}
            waste={game.waste}
            onDraw={handleDraw}
            onWasteTap={handleWasteTap}
          />
        </div>
      </div>

      {/* Tableau */}
      <div
        className="grid grid-cols-7 gap-1 px-2 pb-2 flex-1 w-full max-w-5xl mx-auto"
        style={{
          ['--game-card-h' as string]: 'clamp(78px, 13.8vw, 158px)',
          ['--game-card-fd-offset' as string]: 'clamp(14px, 2.2vw, 24px)',
          ['--game-card-fu-offset' as string]: 'clamp(22px, 3.4vw, 38px)',
        }}
      >
        {game.tableau.map((pile, i) => (
          <TableauPile
            key={i}
            pile={pile}
            pileIndex={i}
            onDrop={(item, toPile) => handleDrop(item, 'tableau', toPile)}
            onCardClick={handleCardClick}
            onCardDblClick={handleCardDblClick}
            invalidCard={invalidCard}
          />
        ))}
      </div>

      {/* Auto-complete button */}
      {autoCompleteEnabled && isAutoCompletable && !showEnd && (
        <div className="flex justify-center pb-2">
          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-purple-deep gradient-gold text-sm"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={startAutoComplete}
          >
            <Sparkles size={15} />
            Auto Complete
          </motion.button>
        </div>
      )}

      {/* Bottom toolbar */}
      <div
        className="flex items-center justify-around px-6 py-2.5"
        style={{ background: 'rgba(0,0,0,0.45)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <ToolBtn icon={<Power size={18} />}       label="End"   onClick={() => setShowConfirmEnd(true)} />
        <ToolBtn icon={<RotateCcw size={18} />}   label="Undo"  onClick={handleUndo} disabled={!canUndo} badge="1💎" />
        <ToolBtn icon={<List size={18} />}         label="Rules" onClick={() => setShowRules(true)} />
      </div>

      {/* Overlays */}
      <ScorePopup events={scoreEvents} />
      <ScoreFloat totalScore={game.score} />
      <Particles active={showConfetti} kind="confetti" />

      <EndGameModal
        open={showEnd && !tournamentId}
        isWon={game.isWon}
        score={game.score}
        moves={game.moves}
        timeUsed={timeUsed}
        timeBonus={timer.bonus}
        isTournament={!!tournamentId}
        onPlayAgain={handleNewGame}
      />

      <TournamentResultsModal
        open={showTournamentResults}
        tournament={tournament}
        myScore={finalScore}
        myMoves={game.moves}
        leaderboard={leaderboard}
        currentUserId={user?.id ?? ''}
        onPlayAgain={async () => {
          if (!tournamentId) return;
          const result = await enterTournament(tournamentId);
          if (result.success) {
            setShowTournamentResults(false);
            handleNewGame();
          }
        }}
        onClose={() => {
          setShowTournamentResults(false);
          setShowEnd(false);
        }}
      />

      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Confirm end */}
      {showConfirmEnd && (
        <div className="fixed inset-0 bg-black/65 z-40 flex items-center justify-center px-8">
          <motion.div
            className="w-full max-w-xs rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: 'linear-gradient(160deg, #2d1b69, #1a0533)',
              border: '1px solid rgba(245,200,66,0.3)',
            }}
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-xl text-white text-center font-semibold">End this game?</h3>
            <p className="text-white/45 text-sm text-center">Your score will be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEndConfirm}
                className="flex-1 py-2.5 rounded-xl gradient-gold text-purple-deep font-bold text-sm"
              >
                End
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ToolBtn({
  icon, label, onClick, disabled, badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 relative disabled:opacity-35 active:scale-95 transition-transform"
    >
      <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <span className="text-white/75">{icon}</span>
      </div>
      <span className="text-white/45 text-xs">{label}</span>
      {badge && !disabled && (
        <span className="absolute -top-1 -right-2 text-[9px] text-gold opacity-65">{badge}</span>
      )}
    </button>
  );
}
