(() => {
  const client = window.supabaseClient;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  async function countRows(table, filter = null) {
    if (!client) return null;

    let query = client
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (filter) {
      query = filter(query);
    }

    const { count, error } = await query;

    if (error) {
      console.warn(`VMS dashboard count failed: ${table}`, error);
      return null;
    }

    return count ?? 0;
  }

  async function loadDashboard() {
    const [
      requests,
      vehicles,
      drivers,
      assignments
    ] = await Promise.all([
      countRows('travel_requests'),
      countRows('vehicles'),
      countRows('drivers'),
      countRows('travel_assignments')
    ]);

    setText('statRequests', requests ?? '—');
    setText('statVehicles', vehicles ?? '—');
    setText('statDrivers', drivers ?? '—');
    setText('statAssignments', assignments ?? '—');

    /*
     * IMPORTANT:
     * Vehicles table uses vehicle_status,
     * NOT status.
     */
    const [
      available,
      maintenance,
      service,
      breakdown
    ] = await Promise.all([
      countRows(
        'vehicles',
        q => q.eq('vehicle_status', 'available')
      ),

      countRows(
        'vehicles',
        q => q.eq('vehicle_status', 'maintenance')
      ),

      countRows(
        'vehicles',
        q => q.eq('vehicle_status', 'service')
      ),

      countRows(
        'vehicles',
        q => q.eq('vehicle_status', 'breakdown')
      )
    ]);

    setText('fleetAvailable', available ?? '—');
    setText('fleetMaintenance', maintenance ?? '—');
    setText('fleetService', service ?? '—');
    setText('fleetBreakdown', breakdown ?? '—');

    const [
      activeDrivers,
      replacementDrivers,
      externalDrivers
    ] = await Promise.all([
      countRows(
        'drivers',
        q => q.eq('driver_status', 'active')
      ),

      countRows(
        'drivers',
        q => q.eq('driver_type', 'replacement')
      ),

      countRows(
        'drivers',
        q => q.eq('driver_type', 'external')
      )
    ]);

    setText('driverActive', activeDrivers ?? '—');
    setText('driverReplacement', replacementDrivers ?? '—');
    setText('driverExternal', externalDrivers ?? '—');

    const now = new Intl.DateTimeFormat('ms-MY', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date());

    setText('lastRefresh', `Dikemas kini ${now}`);
  }

  async function init() {
  try {
    if (!window.VMSSession) {
      console.error('VMSSession tidak tersedia.');
      return;
    }

    const session = await window.VMSSession.loadSession();

    // Role Guard sudah menjaga akses halaman.
    // Di sini kita cuma tunggu session/profile yang sah.
    if (
      !session?.user ||
      !session?.session ||
      !session?.profile ||
      session.isActive !== true
    ) {
      return;
    }

    const profile = session.profile;

    const nameEl =
      document.querySelector('[data-user-name]');

    if (nameEl) {
      nameEl.textContent =
        profile.full_name || 'Administrator';
    }

    const logoutBtn =
      document.getElementById('logoutBtn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await window.VMSSession.logout({
          redirect: true
        });
      });
    }

    await loadDashboard();

  } catch (error) {
    console.error(
      'VMS Admin Dashboard error:',
      error
    );
  }
}

  document.addEventListener(
    'DOMContentLoaded',
    init
  );
})();
