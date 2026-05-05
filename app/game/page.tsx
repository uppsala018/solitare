'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import GameBoard from '@/components/game/GameBoard';

const dndOptions = { enableMouseEvents: true, delayTouchStart: 80 };

function GameWithParams() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId') ?? undefined;

  return (
    <DndProvider backend={TouchBackend} options={dndOptions}>
      <GameBoard tournamentId={tournamentId} />
    </DndProvider>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-purple flex items-center justify-center">
        <span className="text-gold text-2xl font-bold">Loading…</span>
      </div>
    }>
      <GameWithParams />
    </Suspense>
  );
}
