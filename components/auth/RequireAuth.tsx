'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-purple flex items-center justify-center p-4">
        <div className="text-gold font-bold">Checking sign in...</div>
      </div>
    );
  }

  return <>{children}</>;
}
