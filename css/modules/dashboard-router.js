
/*
 * F11C.9 - Role Home Router
 * Path: /js/modules/dashboard-router.js
 *
 * Usage:
 *  <body data-role-home>
 *  Load after supabase.js, auth.js, session.js, role-guard.js.
 */
(() => {
  const ROLE_HOME = {
    admin: '/pages/dashboard-admin.html',
    pegawai_kenderaan: '/pages/dashboard-pegawai-kenderaan.html',
    pemohon: '/pages/dashboard-pemohon.html',
    pelajar: '/pages/dashboard-pemohon.html'
  };

  async function route() {
    if (!window.VMSSession) throw new Error('VMSSession not loaded.');

    const ok = await window.VMSSession.requireAuth({ redirect: true });
    if (!ok) return false;

    const role = window.VMSSession.getCurrentRole();
    const target = ROLE_HOME[role];

    if (!target) {
      window.location.replace('/pages/unauthorized.html');
      return false;
    }

    const currentPath = window.location.pathname;
    if (!currentPath.endsWith(target.replace(/^\//, ''))) {
      window.location.replace(target);
    }

    return true;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body?.hasAttribute('data-role-home')) {
      route().catch((error) => {
        console.error('VMS role home router error:', error);
        window.location.replace('/pages/login.html');
      });
    }
  });

  window.VMSRoleHome = { route, ROLE_HOME };
})();
