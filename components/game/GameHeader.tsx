'use client';

import { Settings } from 'lucide-react';

interface GameHeaderProps {
  timeFormatted: string;
  score: number;
  timeLeft: number;
  onSettings: () => void;
  tournamentName?: string;
  tournamentPrizePool?: number;
}

export default function GameHeader({
  timeFormatted,
  score,
  timeLeft,
  onSettings,
  tournamentName,
  tournamentPrizePool,
}: GameHeaderProps) {
  const urgent = timeLeft <= 60 && timeLeft > 0;

  return (
    <div className="flex flex-col gap-1 px-3 py-2">
      {tournamentName && (
        <div className="flex items-center justify-between rounded-xl px-3 py-1.5 bg-gold/15 border border-gold/30">
          <span className="text-gold text-xs font-bold truncate">{tournamentName}</span>
          {typeof tournamentPrizePool === 'number' && (
            <span className="text-white text-xs font-bold">${tournamentPrizePool.toFixed(2)} pool</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Pill label="Time">
          <span
            className="font-mono font-bold text-sm tabular-nums"
            style={{ color: urgent ? '#ff3d3d' : '#f5c842' }}
          >
            {timeFormatted}
          </span>
        </Pill>

      <h1 className="text-lg text-gold glow-gold shrink-0" style={{ fontFamily: "'Fredoka One', cursive" }}>
        Solitaire Crown
      </h1>

        <div className="flex items-center gap-1.5">
          <Pill label="Score">
            <span className="font-bold text-sm text-white">{score.toLocaleString()}</span>
          </Pill>
          <button
            className="min-h-11 min-w-11 p-1.5 rounded-xl opacity-60 active:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={onSettings}
            aria-label="Settings"
          >
            <Settings size={15} className="text-white mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
      style={{ background: 'rgba(0,0,0,0.35)' }}
    >
      <span className="text-white/50 text-xs">{label}</span>
      {children}
    </div>
  );
}
