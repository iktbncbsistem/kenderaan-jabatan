
/*
 * F11C.9 - Global Travel Schedule
 * Path: /js/modules/jadual-perjalanan.js
 */
(() => {
  const fmtDate = new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const fmtTime = new Intl.DateTimeFormat('ms-MY', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");

  function returnBadge(requirement) {
    if (requirement === 'wait') {
      return '<span class="vms-return"><span class="ico">◷</span>Tunggu</span>';
    }
    if (requirement === 'no_wait') {
      return '<span class="vms-return"><span class="ico">↩</span>Tidak Tunggu</span>';
    }
    return '<span class="vms-return"><span class="ico">—</span>Tiada Pemandu</span>';
  }

  function statusBadge(status) {
    if (status === 'ongoing') return '<span class="vms-badge vms-badge-amber">● Ongoing</span>';
    if (status === 'completed') return '<span class="vms-badge vms-badge-grey">✓ Completed</span>';
    return '<span class="vms-badge vms-badge-green">● Scheduled</span>';
  }

  function render(rows) {
    const tbody = document.getElementById('scheduleBody');
    const empty = document.getElementById('scheduleEmpty');

    tbody.innerHTML = '';

    if (!rows.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    for (const row of rows) {
      const start = new Date(row.scheduled_start);
      const end = new Date(row.scheduled_end);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <span class="vms-time">${escapeHtml(fmtDate.format(start))}</span>
          <span class="vms-sub">${escapeHtml(row.requester_department || '—')}</span>
        </td>
        <td>
          <span class="vms-time">${escapeHtml(fmtTime.format(start))}</span>
          <span class="vms-sub">${escapeHtml(fmtTime.format(end))}</span>
        </td>
        <td>
          <strong>${escapeHtml(row.origin)}</strong>
          <span class="vms-sub">→ ${escapeHtml(row.destination)}</span>
        </td>
        <td>
          <strong>${escapeHtml(row.registration_no)}</strong>
          <span class="vms-sub">${escapeHtml(row.vehicle_name)} · ${escapeHtml(row.vehicle_type)}</span>
        </td>
        <td>${escapeHtml(row.driver_name || '—')}</td>
        <td>${returnBadge(row.driver_requirement)}</td>
        <td>${escapeHtml(row.purpose || '—')}</td>
        <td>${statusBadge(row.assignment_status)}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  async function loadSchedule() {
    const fromInput = document.getElementById('fromDate');
    const toInput = document.getElementById('toDate');
    const error = document.getElementById('scheduleError');
    const client = window.supabaseClient;

    if (!client) throw new Error('Supabase client tidak dijumpai.');

    error.hidden = true;

    const from = fromInput.value
      ? new Date(`${fromInput.value}T00:00:00`)
      : new Date();

    const to = toInput.value
      ? new Date(`${toInput.value}T23:59:59`)
      : new Date(Date.now() + 14 * 86400000);

    const { data, error: rpcError } = await client.rpc('get_public_driver_schedule', {
      p_from: from.toISOString(),
      p_to: to.toISOString()
    });

    if (rpcError) {
      console.error(rpcError);
      error.textContent = rpcError.message || 'Gagal memuatkan jadual perjalanan.';
      error.hidden = false;
      render([]);
      return;
    }

    render(Array.isArray(data) ? data : []);
  }

  function setDefaultDates() {
    const today = new Date();
    const later = new Date(Date.now() + 14 * 86400000);
    const isoDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    };
    document.getElementById('fromDate').value = isoDate(today);
    document.getElementById('toDate').value = isoDate(later);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    setDefaultDates();

    document.getElementById('applyFilter')?.addEventListener('click', () => {
      loadSchedule().catch(console.error);
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await window.VMSSession.logout({ redirect: true });
    });

    try {
      await window.VMSSession.requireAuth({ redirect: true });
      await loadSchedule();
    } catch (error) {
      console.error(error);
    }
  });

  window.VMSJourneySchedule = { loadSchedule, render };
})();
