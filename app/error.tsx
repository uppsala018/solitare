'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('App route error', error);

  return (
    <div className="min-h-screen gradient-purple flex flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="text-5xl">♛</div>
      <h1 className="text-2xl text-gold font-black">Something went wrong</h1>
      <p className="text-white/50 text-sm max-w-xs">The crown slipped. Try again or return to the lobby.</p>
      <button
        className="min-h-11 px-5 rounded-2xl gradient-gold text-purple-deep font-bold"
        onClick={reset}
      >
        Try Again
      </button>
    </div>
  );
}
