/*
 * VMS - Role Navigation
 * F11C.10
 *
 * Add:
 *   <a data-home-link>Dashboard</a>
 *   <nav data-role-nav>...</nav>
 *
 * Example:
 *   <a data-roles="admin" href="/pages/dashboard-admin.html">Admin</a>
 *   <a data-roles="pegawai_kenderaan" href="/pages/dashboard-pegawai-kenderaan.html">Operasi</a>
 *   <a data-roles="pemohon" href="/pages/dashboard-pemohon.html">Pemohon</a>
 *   <a href="/pages/jadual-perjalanan.html">Jadual Perjalanan</a>
 */

(() => {
  const HOME_BY_ROLE = {
    admin: '/pages/dashboard-admin.html',
    pegawai_kenderaan: '/pages/dashboard-pegawai-kenderaan.html',
    pemohon: '/pages/dashboard-pemohon.html'
  };

  function apply() {
    const role = window.VMSSession?.getCurrentRole?.() || null;
    const home = HOME_BY_ROLE[role] || '/pages/login.html';

    document.querySelectorAll('[data-home-link]').forEach((element) => {
      element.setAttribute('href', home);
    });

    if (window.VMSRoleGuard && role) {
      window.VMSRoleGuard.applyVisibility(role);
    }

    document.documentElement.dataset.role = role || '';
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await window.VMSSession?.loadSession();
      apply();
    } catch (error) {
      console.error('VMS role navigation error:', error);
    }
  });

  window.VMSRoleNavigation = { apply, HOME_BY_ROLE };
})();
