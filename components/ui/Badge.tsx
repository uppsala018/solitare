import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  color?: 'gold' | 'teal' | 'neon' | 'red';
}

const colors = {
  gold:  'bg-gold/20 text-gold border-gold/40',
  teal:  'bg-teal/20 text-teal border-teal/40',
  neon:  'bg-green-neon/20 text-green-neon border-green-neon/40',
  red:   'bg-red-bright/20 text-red-bright border-red-bright/40',
};

export default function Badge({ label, color = 'gold' }: BadgeProps) {
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold border', colors[color])}>
      {label}
    </span>
  );
}
