import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/lobby';
  const redirectUrl = new URL(next, url.origin);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Supabase auth callback failed', error);
      return NextResponse.redirect(new URL('/auth?error=verification_failed', url.origin));
    }
  }

  return NextResponse.redirect(redirectUrl);
}
