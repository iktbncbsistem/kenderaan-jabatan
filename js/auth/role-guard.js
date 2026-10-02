/*
 * VMS - Role Guard / Page Guard
 * Path: /js/auth/role-guard.js
 *
 * Usage:
 * <body data-page-roles="admin">
 * <body data-page-roles="admin,pegawai_kenderaan">
 *
 * Menu element examples:
 * <a data-roles="admin">Pentadbiran</a>
 * <button data-roles="admin,pegawai_kenderaan">Assignment</button>
 * <section data-requires-auth>...</section>
 */

(() => {
  const ROLE_LABELS = {
    admin: 'Administrator',
    pegawai_kenderaan: 'Pegawai Kenderaan',
    pemohon: 'Pemohon'
  };

  function normalizeRoles(value) {
    if (Array.isArray(value)) return value.map((x) => String(x).trim()).filter(Boolean);
    return String(value || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function hasRole(role, allowedRoles) {
    return normalizeRoles(allowedRoles).includes(role);
  }

  function applyVisibility(role) {
    document.querySelectorAll('[data-roles]').forEach((element) => {
      const allowed = normalizeRoles(element.getAttribute('data-roles'));
      const visible = allowed.includes(role);

      element.hidden = !visible;
      element.setAttribute('aria-hidden', String(!visible));
    });

    document.querySelectorAll('[data-role]').forEach((element) => {
      element.textContent = ROLE_LABELS[role] || role || 'Unknown';
    });

    document.querySelectorAll('[data-requires-auth]').forEach((element) => {
      element.hidden = false;
      element.setAttribute('aria-hidden', 'false');
    });
  }

  async function initPageGuard() {
    const body = document.body;
    const requiredRoles = normalizeRoles(body?.dataset?.pageRoles || '');

    const session = await window.VMSSession.loadSession();

    if (!session.user || !session.session) {
      window.location.replace(window.VMSSession.urls.LOGIN_URL);
      return false;
    }

    if (!session.profile || session.isActive !== true) {
      await window.VMSSession.logout({ redirect: false });
      window.location.replace(window.VMSSession.urls.LOGIN_URL + '?reason=inactive');
      return false;
    }

    const role = session.role;
    applyVisibility(role);

    if (requiredRoles.length > 0 && !hasRole(role, requiredRoles)) {
      window.location.replace(window.VMSSession.urls.UNAUTHORIZED_URL);
      return false;
    }

    document.documentElement.dataset.authenticated = 'true';
    document.documentElement.dataset.role = role || '';
    return true;
  }

  function guardElement(element, allowedRoles, callback) {
    const roles = normalizeRoles(allowedRoles);
    const role = window.VMSSession.getCurrentRole();
    const allowed = roles.includes(role);

    if (element) {
      element.hidden = !allowed;
      element.setAttribute('aria-hidden', String(!allowed));
    }

    if (allowed && typeof callback === 'function') callback();
    return allowed;
  }

  // Protect the page automatically when data-page-roles exists.
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body?.hasAttribute('data-page-roles')) {
      initPageGuard().catch((error) => {
        console.error('VMS page guard error:', error);
        window.location.replace(window.VMSSession.urls.LOGIN_URL);
      });
    }
  });

  window.VMSRoleGuard = {
    initPageGuard,
    applyVisibility,
    guardElement,
    normalizeRoles,
    hasRole,
    ROLE_LABELS
  };
})();
