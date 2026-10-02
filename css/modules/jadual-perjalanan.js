/*
 * F11C.12 - Global Travel Schedule
 * Uses the existing public-safe RPC:
 *   public.get_public_driver_schedule(timestamptz, timestamptz)
 */
(() => {
  const fmtDate = new Intl.DateTimeFormat('ms-MY', {day:'2-digit', month:'2-digit', year:'numeric'});
  const fmtTime = new Intl.DateTimeFormat('ms-MY', {hour:'2-digit', minute:'2-digit', hour12:false});
  let allRows = [];

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function localIsoDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  function returnBadge(value){
    if(value === 'wait') return '<span class="vp-return"><i>◷</i>Tunggu</span>';
    if(value === 'no_wait') return '<span class="vp-return"><i>↩</i>Tidak Tunggu</span>';
    return '<span class="vp-return"><i>—</i>Tiada Pemandu</span>';
  }

  function statusBadge(status){
    if(status === 'ongoing') return '<span class="vp-status vp-status-amber">● Ongoing</span>';
    return '<span class="vp-status vp-status-green">● Scheduled</span>';
  }

  function render(rows){
    const body = document.getElementById('scheduleBody');
    const empty = document.getElementById('scheduleEmpty');
    const count = document.getElementById('resultCount');
    body.innerHTML = '';
    count.textContent = `${rows.length} rekod`;
    empty.hidden = rows.length !== 0;

    rows.forEach((row) => {
      const start = new Date(row.scheduled_start);
      const end = new Date(row.scheduled_end);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="strong">${escapeHtml(fmtDate.format(start))}</span><span class="muted">${escapeHtml(row.requester_department || '—')}</span></td>
        <td><span class="strong">${escapeHtml(fmtTime.format(start))}</span><span class="muted">hingga ${escapeHtml(fmtTime.format(end))}</span></td>
        <td><span class="strong">${escapeHtml(row.origin || '—')}</span><span class="muted">→ ${escapeHtml(row.destination || '—')}</span></td>
        <td><span class="strong">${escapeHtml(row.registration_no || '—')}</span><span class="muted">${escapeHtml(row.vehicle_name || '—')} · ${escapeHtml(row.vehicle_type || '—')}</span></td>
        <td><span class="strong">${escapeHtml(row.driver_name || '—')}</span></td>
        <td>${returnBadge(row.driver_requirement)}</td>
        <td>${escapeHtml(row.purpose || '—')}</td>
        <td>${statusBadge(row.assignment_status)}</td>
      `;
      body.appendChild(tr);
    });
  }

  function applyClientFilters(){
    const search = String(document.getElementById('searchInput').value || '').trim().toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const rows = allRows.filter(row => {
      const hay = [row.origin,row.destination,row.registration_no,row.vehicle_name,row.vehicle_type,row.driver_name,row.purpose,row.requester_department].join(' ').toLowerCase();
      if(search && !hay.includes(search)) return false;
      if(status !== 'all' && row.assignment_status !== status) return false;
      return true;
    });
    render(rows);
  }

  async function loadSchedule(){
    const client = window.supabaseClient;
    if(!client) throw new Error('Supabase client tidak dijumpai.');

    const errorBox = document.getElementById('scheduleError');
    errorBox.hidden = true;

    const fromValue = document.getElementById('fromDate').value;
    const toValue = document.getElementById('toDate').value;
    const from = fromValue ? new Date(`${fromValue}T00:00:00`) : new Date();
    const to = toValue ? new Date(`${toValue}T23:59:59`) : new Date(Date.now()+14*86400000);

    if(to <= from){
      errorBox.textContent = 'Tarikh akhir mesti selepas tarikh mula.';
      errorBox.hidden = false;
      allRows = [];
      render([]);
      return;
    }

    const {data,error} = await client.rpc('get_public_driver_schedule',{
      p_from: from.toISOString(),
      p_to: to.toISOString()
    });

    if(error){
      console.error('VMS public schedule RPC error:', error);
      errorBox.textContent = error.message || 'Gagal memuatkan jadual perjalanan.';
      errorBox.hidden = false;
      allRows = [];
      render([]);
      return;
    }

    allRows = Array.isArray(data) ? data : [];
    applyClientFilters();
  }

  function setDefaults(){
    const today = new Date();
    const later = new Date(); later.setDate(later.getDate()+14);
    document.getElementById('fromDate').value = localIsoDate(today);
    document.getElementById('toDate').value = localIsoDate(later);
  }

  function reset(){
    setDefaults();
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    loadSchedule().catch(console.error);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    setDefaults();

    document.getElementById('applyFilter')?.addEventListener('click', () => loadSchedule().catch(console.error));
    document.getElementById('resetFilter')?.addEventListener('click', reset);
    document.getElementById('searchInput')?.addEventListener('input', applyClientFilters);
    document.getElementById('statusFilter')?.addEventListener('change', applyClientFilters);

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await window.VMSSession.logout({redirect:true});
    });

    try {
      const state = await window.VMSSession.loadSession();
      if(!state.user || !state.session || !state.profile || state.isActive !== true) return;
      await loadSchedule();
    } catch(error) {
      console.error('VMS schedule init error:', error);
    }
  });

  window.VMSJourneySchedule = {loadSchedule, render};
})();
