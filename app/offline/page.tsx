import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen gradient-purple flex flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="text-5xl">♛</div>
      <h1 className="text-2xl text-gold font-black">No connection</h1>
      <p className="text-white/50 text-sm max-w-xs">Your progress is saved. Reconnect to sync scores and rewards.</p>
      <Link className="min-h-11 px-5 rounded-2xl border border-gold/40 text-gold font-bold flex items-center" href="/lobby">
        Try Lobby
      </Link>
    </div>
  );
}
