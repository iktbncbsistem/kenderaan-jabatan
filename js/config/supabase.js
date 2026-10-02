/*
 * VMS - Supabase Client
 * Path: /js/config/supabase.js
 *
 * The Supabase CDN script MUST be loaded before this file.
 */

const SUPABASE_URL = 'https://oonlogvseziuklrdbfwv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rp2hRDbVkFpNV_ERaZENAQ_50gRQk3_';

if (!window.supabase) {
  throw new Error('Supabase JS library is not loaded. Load @supabase/supabase-js before supabase.js.');
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
