import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Server-side only — uses the service role key to bypass RLS.
// Never import this in client components.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY   || 'placeholder-service-role-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
);
