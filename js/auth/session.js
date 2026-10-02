/*
 * VMS - Session Manager
 * Path: /js/auth/session.js
 *
 * Must be loaded after auth.js.
 */

(() => {
  const LOGIN_URL = '/pages/login.html';
  const DASHBOARD_URL = '/index.html';
  const UNAUTHORIZED_URL = '/pages/unauthorized.html';

  const state = {
    loading: false,
    initialized: false,
    session: null,
    user: null,
    profile: null,
    error: null
  };

  let listeners = [];

  function notify() {
    const snapshot = getState();
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('VMS session listener error:', error);
      }
    });
  }

  function getState() {
    return {
      loading: state.loading,
      initialized: state.initialized,
      session: state.session,
      user: state.user,
      profile: state.profile,
      role: state.profile?.role || null,
      isActive: state.profile?.is_active === true,
      error: state.error
    };
  }

  async function loadSession(force = false) {
    if (state.initialized && !force) return getState();

    state.loading = true;
    state.error = null;
    notify();

    try {
      const context = await window.VMSAuth.getAuthContext();

      state.session = context.session;
      state.user = context.user;
      state.profile = context.profile;
      state.error = context.error || null;
      state.initialized = true;

      if (state.user && state.profile?.is_active === true) {
        // Best-effort last-seen update. Do not block login/page loading if it fails.
        window.VMSAuth.updateLastSeen().catch((error) => {
          console.warn('last_seen_at update failed:', error);
        });
      }
    } catch (error) {
      state.session = null;
      state.user = null;
      state.profile = null;
      state.error = error;
      state.initialized = true;
    } finally {
      state.loading = false;
      notify();
    }

    return getState();
  }

  async function requireAuth({ redirect = true } = {}) {
    const current = await loadSession();

    if (!current.user || !current.session) {
      if (redirect) {
        window.location.replace(LOGIN_URL);
      }
      return false;
    }

    if (!current.profile || current.isActive !== true) {
      await window.VMSAuth.signOut().catch(() => {});
      if (redirect) {
        window.location.replace(LOGIN_URL + '?reason=inactive');
      }
      return false;
    }

    return true;
  }

  async function requireRole(allowedRoles, { redirect = true } = {}) {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const authenticated = await requireAuth({ redirect });
    if (!authenticated) return false;

    const role = state.profile?.role || null;
    const permitted = allowed.includes(role);

    if (!permitted && redirect) {
      window.location.replace(UNAUTHORIZED_URL);
    }

    return permitted;
  }

  async function logout({ redirect = true } = {}) {
    const { error } = await window.VMSAuth.signOut();
    state.session = null;
    state.user = null;
    state.profile = null;
    state.error = error || null;
    state.initialized = true;
    notify();

    if (redirect) {
      window.location.replace(LOGIN_URL);
    }

    return { error: error || null };
  }

  function isAuthenticated() {
    return Boolean(state.session && state.user && state.profile?.is_active === true);
  }

  function getCurrentRole() {
    return state.profile?.role || null;
  }

  function getProfile() {
    return state.profile;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((item) => item !== listener);
    };
  }

  // Keep browser state synchronized with Supabase Auth.
  window.VMSAuth.onAuthStateChange((event, session) => {
    // Avoid calling Supabase queries from inside the auth callback.
    setTimeout(async () => {
      state.session = session || null;
      state.user = session?.user || null;

      if (!session?.user) {
        state.profile = null;
        state.initialized = true;
        notify();
        return;
      }

      await loadSession(true);
      console.info('VMS Auth event:', event);
    }, 0);
  });

  window.VMSSession = {
    loadSession,
    requireAuth,
    requireRole,
    logout,
    isAuthenticated,
    getCurrentRole,
    getProfile,
    getState,
    subscribe,
    urls: {
      LOGIN_URL,
      DASHBOARD_URL,
      UNAUTHORIZED_URL
    }
  };
})();
