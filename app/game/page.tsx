'use client';

import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import GameBoard from '@/components/game/GameBoard';

const dndOptions = { enableMouseEvents: true, delayTouchStart: 80 };

export default function GamePage() {
  return (
    <DndProvider backend={TouchBackend} options={dndOptions}>
      <GameBoard />
    </DndProvider>
  );
}
