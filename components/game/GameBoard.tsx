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
import GameHeader from './GameHeader';
import TableauPile from './TableauPile';
import FoundationPile from './FoundationPile';
import StockPile from './StockPile';
import ScoreFloat from './ScoreFloat';
import EndGameModal from './EndGameModal';
import RulesModal from './RulesModal';

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
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const { playFlip, playPlace, playFoundation, playWin, playInvalid, playTick } = useSound();

  const started = useRef(false);
  const wonRef  = useRef(false);

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
      timer.pause();
      saveSession(timer.timeLeft);
      const t = setTimeout(() => setShowEnd(true), 700);
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
    playFlip();
  };

  const handleDrop = useCallback(
    (item: DragItem, dest: 'foundation' | 'tableau', toPile?: number) => {
      ensureStarted();
      moveTo(item.source, dest, toPile);
      playPlace();
      if (dest === 'foundation') playFoundation();
    },
    [moveTo, playPlace, playFoundation], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleCardClick = useCallback(
    (pileIndex: number, cardIndex: number) => {
      ensureStarted();
      const source: MoveSource = { type: 'tableau', pileIndex, cardIndex };
      const moved = autoMove(source);
      if (moved) { playPlace(); } else { playInvalid(); }
    },
    [autoMove, playPlace, playInvalid], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleCardDblClick = useCallback(
    (pileIndex: number, cardIndex: number) => {
      ensureStarted();
      moveTo({ type: 'tableau', pileIndex, cardIndex }, 'foundation');
      playFoundation();
    },
    [moveTo, playFoundation], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleWasteTap = useCallback(() => {
    if (!game.waste.length) return;
    ensureStarted();
    const moved = autoMove({ type: 'waste' });
    if (moved) playPlace(); else playInvalid();
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
    setShowEnd(true);
    setShowConfirmEnd(false);
  };

  const timeUsed = 300 - timer.timeLeft;

  /* ── layout ── */

  return (
    <div className="flex flex-col min-h-screen gradient-purple select-none safe-top safe-bottom overflow-hidden">
      <GameHeader
        timeFormatted={timer.formatted}
        score={game.score}
        timeLeft={timer.timeLeft}
        onSettings={() => setShowRules(true)}
      />

      {/* Top row: 4 foundations + gap + stock/waste */}
      <div className="grid grid-cols-7 gap-0.5 px-2 mb-1.5">
        {SUITS.map((suit) => (
          <FoundationPile
            key={suit}
            suit={suit}
            cards={game.foundations[suit]}
            onDrop={(item) => handleDrop(item, 'foundation')}
          />
        ))}
        {/* col 5: spacer */}
        <div className="aspect-[2/3] rounded-lg opacity-0 pointer-events-none" />
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
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-2 flex-1">
        {game.tableau.map((pile, i) => (
          <TableauPile
            key={i}
            pile={pile}
            pileIndex={i}
            onDrop={(item, toPile) => handleDrop(item, 'tableau', toPile)}
            onCardClick={handleCardClick}
            onCardDblClick={handleCardDblClick}
          />
        ))}
      </div>

      {/* Auto-complete button */}
      {isAutoCompletable && !showEnd && (
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
      <ScoreFloat events={scoreEvents} totalScore={game.score} />

      <EndGameModal
        open={showEnd}
        isWon={game.isWon}
        score={game.score}
        moves={game.moves}
        timeUsed={timeUsed}
        timeBonus={timer.bonus}
        isTournament={!!tournamentId}
        onPlayAgain={handleNewGame}
      />

      <RulesModal open={showRules} onClose={() => setShowRules(false)} />

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
