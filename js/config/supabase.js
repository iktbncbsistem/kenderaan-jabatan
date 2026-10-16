
/*
 * VMS - Supabase Client
 * Path: /js/config/supabase.js
 * Supabase project: VMS
 */

const SUPABASE_URL = 'https://yzkvvttkmeezjbfbbfkd.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_3ZKDUfe01srbU3tPmWvzsQ_7XXfr0MP';

if (!window.supabase) {
  throw new Error(
    'Supabase JS library is not loaded. Load @supabase/supabase-js before supabase.js.'
  );
}

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'vms-supabase-auth'
    }
  }
);
