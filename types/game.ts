import type { Card, MoveSource } from '@/lib/gameLogic';

export const DRAG_TYPE = 'CARD' as const;

export interface DragItem {
  cards: Card[];
  source: MoveSource;
}
