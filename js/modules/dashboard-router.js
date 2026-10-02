/*
 * VMS - Dashboard Role Router
 * F11C.10
 *
 * Compatible with:
 *   /js/auth/auth.js
 *   /js/auth/session.js
 *   /js/auth/role-guard.js
 *
 * index.html is a gateway only:
 *   login -> index.html -> role dashboard
 */

(() => {
  const ROLE_HOME = Object.freeze({
    admin: '/pages/dashboard-admin.html',
    pegawai_kenderaan: '/pages/dashboard-pegawai-kenderaan.html',
    pemohon: '/pages/dashboard-pemohon.html'
  });

  const ROLE_LABELS = Object.freeze({
    admin: 'Administrator',
    pegawai_kenderaan: 'Pegawai Kenderaan',
    pemohon: 'Pemohon'
  });

  function setMessage(ui, title, message) {
    if (ui?.titleElement) ui.titleElement.textContent = title;
    if (ui?.messageElement) ui.messageElement.textContent = message;
  }

  function getHomeForRole(role) {
    return ROLE_HOME[role] || null;
  }

  async function route(ui = {}) {
    try {
      if (!window.VMSSession) {
        setMessage(ui, 'Ralat sistem', 'Session manager belum dimuatkan.');
        return false;
      }

      setMessage(ui, 'Menyemak akses…', 'Mengesahkan sesi pengguna dan peranan.');

      const authenticated = await window.VMSSession.requireAuth({ redirect: false });

      if (!authenticated) {
        window.location.replace(window.VMSSession.urls.LOGIN_URL);
        return false;
      }

      const role = window.VMSSession.getCurrentRole();
      const target = getHomeForRole(role);

      if (!target) {
        setMessage(
          ui,
          'Akses tidak tersedia',
          `Peranan "${role || 'tidak diketahui'}" belum mempunyai dashboard.`
        );
        setTimeout(() => {
          window.location.replace(window.VMSSession.urls.UNAUTHORIZED_URL);
        }, 600);
        return false;
      }

      setMessage(
        ui,
        ROLE_LABELS[role] || 'Dashboard',
        'Menghantar anda ke dashboard yang sepadan…'
      );

      const targetPath = new URL(target, window.location.origin).pathname;
      if (window.location.pathname !== targetPath) {
        window.location.replace(target);
      }

      return true;
    } catch (error) {
      console.error('VMS dashboard role routing error:', error);
      setMessage(ui, 'Ralat sistem', 'Sila cuba semula.');
      setTimeout(() => {
        window.location.replace(window.VMSSession?.urls?.LOGIN_URL || '/pages/login.html');
      }, 900);
      return false;
    }
  }

  window.VMSRoleHome = {
    route,
    ROLE_HOME,
    ROLE_LABELS
  };
})();
