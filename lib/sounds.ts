import { Howl } from 'howler';

type SoundName = 'cardFlip' | 'cardPlace' | 'win' | 'deal' | 'click' | 'coins';

const soundMap: Record<SoundName, string> = {
  cardFlip:  '/sounds/card-flip.mp3',
  cardPlace: '/sounds/card-place.mp3',
  win:       '/sounds/win.mp3',
  deal:      '/sounds/deal.mp3',
  click:     '/sounds/click.mp3',
  coins:     '/sounds/coins.mp3',
};

const cache: Partial<Record<SoundName, Howl>> = {};

export function playSound(name: SoundName, volume = 0.6) {
  if (!cache[name]) {
    cache[name] = new Howl({ src: [soundMap[name]], volume });
  }
  cache[name]!.play();
}

export function preloadSounds() {
  (Object.keys(soundMap) as SoundName[]).forEach((name) => {
    cache[name] = new Howl({ src: [soundMap[name]], preload: true });
  });
}
