(() => {
  const client = window.supabaseClient;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  async function countRows(table, filter = null) {
    let query = client.from(table).select('*', { count: 'exact', head: true });
    if (filter) query = filter(query);
    const { count, error } = await query;
    if (error) {
      console.warn(`VMS dashboard count failed: ${table}`, error);
      return null;
    }
    return count ?? 0;
  }

  async function loadDashboard() {
    if (!client) {
      console.error('VMS: supabaseClient is not available.');
      return;
    }

    const [requests, vehicles, drivers, assignments] = await Promise.all([
      countRows('travel_requests'),
      countRows('vehicles'),
      countRows('drivers'),
      countRows('travel_assignments')
    ]);

    setText('statRequests', requests === null ? '—' : requests);
    setText('statVehicles', vehicles === null ? '—' : vehicles);
    setText('statDrivers', drivers === null ? '—' : drivers);
    setText('statAssignments', assignments === null ? '—' : assignments);

    const [available, maintenance, service, breakdown] = await Promise.all([
      countRows('vehicles', q => q.eq('status', 'available')),
      countRows('vehicles', q => q.eq('status', 'maintenance')),
      countRows('vehicles', q => q.eq('status', 'service')),
      countRows('vehicles', q => q.eq('status', 'breakdown'))
    ]);

    setText('fleetAvailable', available === null ? '—' : available);
    setText('fleetMaintenance', maintenance === null ? '—' : maintenance);
    setText('fleetService', service === null ? '—' : service);
    setText('fleetBreakdown', breakdown === null ? '—' : breakdown);

    const [active, replacement, external] = await Promise.all([
      countRows('drivers', q => q.eq('driver_status', 'active')),
      countRows('drivers', q => q.eq('driver_type', 'replacement')),
      countRows('drivers', q => q.eq('driver_type', 'external'))
    ]);

    setText('driverActive', active === null ? '—' : active);
    setText('driverReplacement', replacement === null ? '—' : replacement);
    setText('driverExternal', external === null ? '—' : external);

    setText(
      'lastRefresh',
      `Dikemas kini ${new Intl.DateTimeFormat('ms-MY', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date())}`
    );
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const ok = await window.VMSRoleGuard.initPageGuard();
      if (!ok) return;

      const profile = window.VMSSession.getProfile();
      setText('dummy', '');
      const nameEl = document.querySelector('[data-user-name]');
      if (nameEl) nameEl.textContent = profile?.full_name || 'Administrator';

      document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await window.VMSSession.logout({ redirect: true });
      });

      await loadDashboard();
    } catch (error) {
      console.error('VMS Admin Dashboard:', error);
    }
  });
})();
