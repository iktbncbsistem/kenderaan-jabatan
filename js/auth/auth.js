/*
 * VMS - Authentication Service
 * Path: /js/auth/auth.js
 */

(() => {
  const supabase = window.supabaseClient;

  if (!supabase) {
    throw new Error('window.supabaseClient is not available. Load /js/config/supabase.js first.');
  }

  async function signIn(email, password) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');

    if (!cleanEmail || !cleanPassword) {
      return { data: null, error: new Error('Email dan password diperlukan.') };
    }

    return await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    });
  }

  async function signOut() {
    return await supabase.auth.signOut();
  }

  async function getSession() {
    return await supabase.auth.getSession();
  }

  async function getUser() {
    return await supabase.auth.getUser();
  }

  async function getCurrentProfile() {
    const { data: userData, error: userError } = await getUser();
    if (userError) return { data: null, error: userError };
    if (!userData?.user) {
      return { data: null, error: new Error('Tiada pengguna sedang login.') };
    }

    return await supabase
      .from('profiles')
      .select('id, full_name, staff_no, phone, email, department, position_title, role, is_active, last_seen_at')
      .eq('id', userData.user.id)
      .maybeSingle();
  }

  async function getAuthContext() {
    const [{ data: sessionData, error: sessionError }, { data: userData, error: userError }] = await Promise.all([
      getSession(),
      getUser()
    ]);

    if (sessionError) return { session: null, user: null, profile: null, error: sessionError };
    if (userError) return { session: sessionData.session || null, user: null, profile: null, error: userError };

    const session = sessionData?.session || null;
    const user = userData?.user || null;

    if (!session || !user) {
      return { session: null, user: null, profile: null, error: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, staff_no, phone, email, department, position_title, role, is_active, last_seen_at')
      .eq('id', user.id)
      .maybeSingle();

    return {
      session,
      user,
      profile: profile || null,
      error: profileError || null
    };
  }

  async function updateLastSeen() {
    const { data: userData } = await getUser();
    const user = userData?.user;
    if (!user) return { data: null, error: null };

    return await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', user.id);
  }

  function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  window.VMSAuth = {
    signIn,
    signOut,
    getSession,
    getUser,
    getCurrentProfile,
    getAuthContext,
    updateLastSeen,
    onAuthStateChange
  };
})();
