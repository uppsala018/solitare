import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-purple flex flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="text-5xl">♛</div>
      <h1 className="text-2xl text-gold font-black">Page not found</h1>
      <p className="text-white/50 text-sm max-w-xs">This part of the kingdom does not exist.</p>
      <Link className="min-h-11 px-5 rounded-2xl gradient-gold text-purple-deep font-bold flex items-center" href="/lobby">
        Back to Lobby
      </Link>
    </div>
  );
}
