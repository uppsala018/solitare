export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface SetDefinition {
  id: string;
  name: string;
  gradient: string;
  emoji: string;
  accent: string;
  tagline: string;
}

export interface StoredCard {
  n: number;   // 1-9
  r: Rarity;
}

export interface SetProgress {
  setId: string;
  cards: StoredCard[];   // collected cards
  completed: boolean;
}

export interface EarnedCard {
  setId:      string;
  setName:    string;
  cardNumber: number;
  rarity:     Rarity;
  isDuplicate: boolean;
}

export type PackType = 'basic' | 'premium' | 'mega';

export interface PackDef {
  id:    PackType;
  name:  string;
  cards: number;
  cost:  number;
  emoji: string;
  highlight?: boolean;
}

export const PACK_DEFS: PackDef[] = [
  { id: 'basic',   name: 'Basic Pack',   cards: 1, cost: 50,  emoji: '📦' },
  { id: 'premium', name: 'Premium Pack', cards: 3, cost: 120, emoji: '🎁', highlight: true },
  { id: 'mega',    name: 'Mega Pack',    cards: 9, cost: 300, emoji: '🏆' },
];

export const RARITY_COLORS: Record<Rarity, string> = {
  common:    'rgba(200,200,200,0.9)',
  rare:      '#60a5fa',
  epic:      '#a78bfa',
  legendary: '#f5c842',
};

export const RARITY_GLOW: Record<Rarity, string> = {
  common:    'none',
  rare:      '0 0 8px rgba(96,165,250,0.7)',
  epic:      '0 0 10px rgba(167,139,250,0.8)',
  legendary: '0 0 14px rgba(245,200,66,0.9)',
};

export const COLLECTION_SETS: SetDefinition[] = [
  { id:'big_score',   name:'BIG SCORE',   gradient:'linear-gradient(160deg,#1c1409 0%,#4a3000 60%,#6b4a00 100%)', emoji:'💰', accent:'#f5c842', tagline:'A daring heist at the top of the world.' },
  { id:'last_clue',   name:'LAST CLUE',   gradient:'linear-gradient(160deg,#0a0f1a 0%,#112244 60%,#1a3a5c 100%)', emoji:'🔍', accent:'#60a5fa', tagline:'The case that changed everything.' },
  { id:'dark_inside', name:'DARK INSIDE', gradient:'linear-gradient(160deg,#0d0d1a 0%,#1a1040 60%,#2d1b69 100%)', emoji:'🌑', accent:'#a78bfa', tagline:'What lurks in the shadows of the mind.' },
  { id:'galaxy_road', name:'GALAXY ROAD', gradient:'linear-gradient(160deg,#000008 0%,#0a0020 50%,#1a0040 100%)', emoji:'🚀', accent:'#00d4aa', tagline:'The last voyage to the edge of time.' },
  { id:'fire_crown',  name:'FIRE CROWN',  gradient:'linear-gradient(160deg,#1a0500 0%,#4a0d00 50%,#8b1a00 100%)', emoji:'🔥', accent:'#ff3d3d', tagline:'The crown that burns with ambition.' },
  { id:'lost_map',    name:'LOST MAP',    gradient:'linear-gradient(160deg,#1a0f00 0%,#3d2000 50%,#5c3500 100%)', emoji:'🗺️', accent:'#f97316', tagline:'X marks the beginning.' },
  { id:'love',        name:'LOVE?',       gradient:'linear-gradient(160deg,#1a0519 0%,#3d0530 50%,#7b1550 100%)', emoji:'💕', accent:'#ec4899', tagline:'Some questions have no answer.' },
  { id:'clown_train', name:'CLOWN TRAIN', gradient:'linear-gradient(160deg,#0d0010 0%,#200030 50%,#4a0060 100%)', emoji:'🤡', accent:'#c084fc', tagline:'The ride never ends.' },
  { id:'speed_zone',  name:'SPEED ZONE',  gradient:'linear-gradient(160deg,#0a0000 0%,#250000 50%,#3d0000 100%)', emoji:'🏎️', accent:'#ef4444', tagline:'Zero to legend in 9 seconds.' },
  { id:'deep_sea',    name:'DEEP SEA',    gradient:'linear-gradient(160deg,#000a14 0%,#001428 50%,#002850 100%)', emoji:'🌊', accent:'#0ea5e9', tagline:'Beneath the surface, danger waits.' },
  { id:'night_owl',   name:'NIGHT OWL',   gradient:'linear-gradient(160deg,#0a0a14 0%,#14142a 50%,#1e1e3e 100%)', emoji:'🦉', accent:'#94a3b8', tagline:'The city never sleeps, neither does she.' },
  { id:'time_loop',   name:'TIME LOOP',   gradient:'linear-gradient(160deg,#001a0d 0%,#00331a 50%,#004d28 100%)', emoji:'⏳', accent:'#10b981', tagline:'Relive it until you get it right.' },
  { id:'wild_west',   name:'WILD WEST',   gradient:'linear-gradient(160deg,#1a1000 0%,#3d2800 50%,#5c3d00 100%)', emoji:'🤠', accent:'#d97706', tagline:'The law ends at the horizon.' },
  { id:'ice_queen',   name:'ICE QUEEN',   gradient:'linear-gradient(160deg,#001428 0%,#002850 50%,#003c6e 100%)', emoji:'❄️', accent:'#93c5fd', tagline:'A kingdom built on frozen tears.' },
  { id:'robot_wars',  name:'ROBOT WARS',  gradient:'linear-gradient(160deg,#0a0a14 0%,#1a1a2e 50%,#2a2a4a 100%)', emoji:'🤖', accent:'#6366f1', tagline:'The last war. The first machines.' },
];

export const TOTAL_CARDS = COLLECTION_SETS.length * 9; // 135

export function generateRarity(): Rarity {
  const r = Math.random();
  if (r < 0.05) return 'legendary';
  if (r < 0.15) return 'epic';
  if (r < 0.40) return 'rare';
  return 'common';
}

export function collectionKey(userId: string, setId: string) {
  return `sc-coll-${userId}-${setId}`;
}

export function bonusClaimedKey(userId: string) {
  return `sc-coll-bonus-${userId}`;
}
