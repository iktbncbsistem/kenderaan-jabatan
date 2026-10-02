/* F11C.12 - Pemohon Dashboard */
(() => {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if(el) el.textContent = value;
  };

  const esc = (value) => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  const isoLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  };

  function badge(status){
    if(status === 'ongoing') return '<span class="vp-status vp-status-amber">● Ongoing</span>';
    return '<span class="vp-status vp-status-green">● Scheduled</span>';
  }

  function returnBadge(value){
    if(value === 'wait') return '<span class="vp-return"><i>◷</i>Tunggu</span>';
    if(value === 'no_wait') return '<span class="vp-return"><i>↩</i>Tidak Tunggu</span>';
    return '<span class="vp-return"><i>—</i>Tiada Pemandu</span>';
  }

  function renderPreview(rows){
    const body = document.getElementById('previewBody');
    const empty = document.getElementById('previewEmpty');
    body.innerHTML = '';
    if(!rows.length){ empty.hidden = false; return; }
    empty.hidden = true;
    rows.slice(0,6).forEach(row => {
      const start = new Date(row.scheduled_start);
      const end = new Date(row.scheduled_end);
      const dateText = new Intl.DateTimeFormat('ms-MY',{day:'2-digit',month:'2-digit',year:'numeric'}).format(start);
      const timeStart = new Intl.DateTimeFormat('ms-MY',{hour:'2-digit',minute:'2-digit',hour12:false}).format(start);
      const timeEnd = new Intl.DateTimeFormat('ms-MY',{hour:'2-digit',minute:'2-digit',hour12:false}).format(end);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="strong">${esc(dateText)}</span><span class="muted">${esc(row.requester_department || '—')}</span></td>
        <td><span class="strong">${esc(timeStart)}</span><span class="muted">→ ${esc(timeEnd)}</span></td>
        <td><span class="strong">${esc(row.origin || '—')}</span><span class="muted">→ ${esc(row.destination || '—')}</span></td>
        <td><span class="strong">${esc(row.registration_no || '—')}</span><span class="muted">${esc(row.vehicle_name || '—')}</span></td>
        <td>${esc(row.driver_name || '—')}</td>
        <td>${returnBadge(row.driver_requirement)}</td>
        <td>${badge(row.assignment_status)}</td>
      `;
      body.appendChild(tr);
    });
  }

  async function loadDashboard(){
    const client = window.supabaseClient;
    if(!client) throw new Error('Supabase client tidak dijumpai.');

    const state = await window.VMSSession.loadSession();
    if(!state.user || !state.session || !state.profile || state.isActive !== true) return;

    setText('userName', state.profile.full_name || 'Pemohon');
    const nameEl = document.querySelector('[data-user-name]');
    if(nameEl) nameEl.textContent = state.profile.full_name || 'Pemohon';

    // Safe, user-scoped query. The schema's requester linkage is known as requester_profile_id.
    const {count: requestCount, error: requestError} = await client
      .from('travel_requests')
      .select('id',{count:'exact',head:true})
      .eq('requester_profile_id', state.profile.id);

    if(requestError){
      console.warn('VMS pemohon request count failed:', requestError);
      setText('myRequests','—');
    } else {
      setText('myRequests', requestCount ?? 0);
    }

    // Load the full current day first, then the following 14-day window.
    // This avoids missing journeys that already started earlier today.
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0,0,0,0);
    const end14 = new Date(dayStart);
    end14.setDate(end14.getDate()+14);

    const {data: scheduleData, error: scheduleError} = await client.rpc('get_public_driver_schedule',{
      p_from: dayStart.toISOString(),
      p_to: end14.toISOString()
    });

    if(scheduleError){
      console.warn('VMS pemohon schedule preview failed:', scheduleError);
      setText('todayTrips','—');
      setText('upcomingTrips','—');
      renderPreview([]);
      return;
    }

    const rows = Array.isArray(scheduleData) ? scheduleData : [];
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate()+1);
    const todayRows = rows.filter(row => {
      const d = new Date(row.scheduled_start);
      return d >= dayStart && d < dayEnd;
    });

    setText('todayTrips', todayRows.length);
    setText('upcomingTrips', rows.length);
    renderPreview(rows);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await window.VMSSession.logout({redirect:true});
    });

    try {
      await loadDashboard();
    } catch(error){
      console.error('VMS pemohon dashboard error:', error);
      const box = document.getElementById('dashboardError');
      if(box){
        box.textContent = error.message || 'Dashboard gagal dimuatkan.';
        box.hidden = false;
      }
    }
  });

  window.VMSPemohonDashboard = {loadDashboard};
})();
