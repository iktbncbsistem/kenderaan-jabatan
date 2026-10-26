(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = { vehicles: [], editingId: null, busy: false };
  const labels = {
    vehicle_type: { sedan: 'Sedan', van: 'Van', lori: 'Lori', bas: 'Bas' },
    fuel_type: { petrol: 'Petrol', diesel: 'Diesel', electric: 'Elektrik (EV)', hybrid: 'Hybrid', other: 'Lain-lain' },
    vehicle_status: {
      available: 'Tersedia', assigned: 'Ditetapkan', in_use: 'Sedang Digunakan',
      under_maintenance: 'Dalam Penyelenggaraan', breakdown: 'Rosak',
      inactive: 'Tidak Aktif', retired: 'Dilupuskan'
    }
  };
  const fields = [
    'registration_no','vehicle_name','brand','model','vehicle_type','fuel_type',
    'seating_capacity','required_license_class','current_mileage','vehicle_status',
    'road_tax_expiry','insurance_expiry','last_service_date','next_service_date','notes'
  ];

  function client() {
    if (!window.supabaseClient) throw new Error('Klien Supabase tidak dijumpai. Semak ../js/config/supabase.js.');
    return window.supabaseClient;
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function number(value) {
    const n = Number(value || 0);
    return n.toLocaleString('ms-MY', { maximumFractionDigits: 1 });
  }
  function showToast(message, error = false) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    el.dataset.error = error ? 'true' : 'false';
    window.setTimeout(() => { el.classList.remove('show'); delete el.dataset.error; }, 3200);
  }
  function setMessage(message, show = true) {
  const el = $('pageMessage');

  if (!el) {
    console.error('Elemen #pageMessage tidak ditemui:', message);
    return;
  }

  el.textContent = message;
  el.hidden = !show;
}
  function typeLabel(v) { return labels.vehicle_type[v] || v || '—'; }
  function fuelLabel(v) { return labels.fuel_type[v] || v || '—'; }
  function statusLabel(v) { return labels.vehicle_status[v] || v || '—'; }
  function statusClass(status) {
    if (status === 'available') return 'green';
    if (status === 'under_maintenance' || status === 'assigned' || status === 'in_use') return 'amber';
    return 'red';
  }
  function iconFor(v) {
    if (v.fuel_type === 'electric') return '⚡';
    return ({ sedan:'🚗', van:'🚐', lori:'🚚', bas:'🚌' })[v.vehicle_type] || '🚘';
  }
  function filteredVehicles() {
    const q = $('vehicleSearch').value.trim().toLocaleLowerCase('ms');
    const category = $('categoryFilter').value;
    const fuel = $('fuelFilter').value;
    const status = $('statusFilter').value;
    return state.vehicles.filter(v => {
      const haystack = [v.registration_no, v.vehicle_name, v.brand, v.model, v.required_license_class].join(' ').toLocaleLowerCase('ms');
      return (!q || haystack.includes(q)) && (!category || v.vehicle_type === category) &&
        (!fuel || v.fuel_type === fuel) && (!status || v.vehicle_status === status);
    });
  }
  function card(v) {
    const status = statusClass(v.vehicle_status);
    const details = [
      ['Jenis', typeLabel(v.vehicle_type)], ['Bahan api', fuelLabel(v.fuel_type)],
      ['Kapasiti', v.seating_capacity ? `${esc(v.seating_capacity)} penumpang` : '—'],
      ['Perbatuan', `${number(v.current_mileage)} km`]
    ];
    return `<article class="vehicle-card">
      <div class="vehicle-top"><div class="vehicle-icon">${iconFor(v)}</div><span class="pill ${status}">${esc(statusLabel(v.vehicle_status))}</span></div>
      <div style="padding:0 18px 13px"><div class="vehicle-id">${esc(v.registration_no)}</div><div class="vehicle-model">${esc([v.brand,v.model].filter(Boolean).join(' ') || v.vehicle_name)}</div><small>${esc(v.vehicle_name)}</small></div>
      <div class="vehicle-meta">${details.map(([k,val]) => `<div class="meta"><span>${esc(k)}</span><strong>${val}</strong></div>`).join('')}</div>
      <div class="vehicle-footer"><small>${v.required_license_class ? `Lesen: ${esc(v.required_license_class)}` : 'Fleet jabatan'}</small><button type="button" data-edit="${esc(v.id)}">Kemaskini →</button></div>
    </article>`;
  }
  function row(v) {
    return `<tr><td><b>${esc(v.registration_no)}</b></td><td>${esc(v.vehicle_name)}<br><small>${esc([v.brand,v.model].filter(Boolean).join(' '))}</small></td><td>${esc(typeLabel(v.vehicle_type))}</td><td>${esc(fuelLabel(v.fuel_type))}</td><td>${v.seating_capacity ? esc(v.seating_capacity) : '—'}</td><td>${number(v.current_mileage)} km</td><td><span class="pill ${statusClass(v.vehicle_status)}">${esc(statusLabel(v.vehicle_status))}</span></td><td><button type="button" class="secondary-btn" data-edit="${esc(v.id)}">Kemaskini</button></td></tr>`;
  }
  function render() {
    const list = filteredVehicles();
    $('cardsView').innerHTML = list.map(card).join('');
    $('vehicleTable').innerHTML = list.map(row).join('');
    $('kpiTotal').textContent = state.vehicles.length;
    $('kpiAvailable').textContent = state.vehicles.filter(v => v.vehicle_status === 'available').length;
    $('kpiMaintenance').textContent = state.vehicles.filter(v => ['under_maintenance','breakdown'].includes(v.vehicle_status)).length;
    $('kpiEv').textContent = state.vehicles.filter(v => v.fuel_type === 'electric').length;
    $('kpiInactive').textContent = state.vehicles.filter(v => ['inactive','retired'].includes(v.vehicle_status)).length;
    if (!list.length && state.vehicles.length) setMessage('Tiada kenderaan sepadan dengan carian atau penapis.', true);
    else if (!state.vehicles.length) setMessage('Belum ada rekod kenderaan. Tekan “Daftar Kenderaan” untuk menambah rekod pertama.', true);
    else setMessage('', false);
  }
  async function loadVehicles() {
    setMessage('Memuatkan data kenderaan…', true);
    try {
      const { data, error } = await client().from('vehicles')
        .select('id,registration_no,vehicle_name,brand,model,vehicle_type,fuel_type,seating_capacity,required_license_class,vehicle_status,current_mileage,road_tax_expiry,insurance_expiry,last_service_date,next_service_date,notes,created_at,updated_at')
        .order('registration_no', { ascending: true });
      if (error) throw error;
      state.vehicles = data || [];
      render();
    } catch (error) {
      console.error('Gagal memuatkan kenderaan:', error);
      setMessage(`Gagal memuatkan data Supabase: ${error.message || error}. Semak sambungan, nama kolum dan polisi RLS.`, true);
      showToast('Data kenderaan gagal dimuatkan.', true);
    }
  }
  function openModal(vehicle = null) {
    const form = $('vehicleForm');
    form.reset();
    state.editingId = vehicle?.id || null;
    $('modalTitle').textContent = vehicle ? 'Kemaskini Kenderaan' : 'Daftar Kenderaan';
    $('saveVehicleBtn').textContent = vehicle ? 'Simpan Perubahan' : 'Simpan Kenderaan';
    form.elements.id.value = vehicle?.id || '';
    for (const field of fields) {
      if (form.elements[field]) form.elements[field].value = vehicle?.[field] ?? (field === 'current_mileage' ? '0' : '');
    }
    $('vehicleModal').classList.remove('hidden');
    const first = form.elements.registration_no;
    if (first) first.focus();
  }
  function closeModal() { $('vehicleModal').classList.add('hidden'); state.editingId = null; }
  function formPayload() {
    const form = $('vehicleForm');
    const payload = {};
    for (const field of fields) {
      const raw = form.elements[field]?.value;
      if (raw === undefined) continue;
      if (['seating_capacity'].includes(field)) payload[field] = raw === '' ? null : Number(raw);
      else if (field === 'current_mileage') payload[field] = raw === '' ? 0 : Number(raw);
      else payload[field] = raw.trim() === '' ? null : raw.trim();
    }
    payload.registration_no = String(payload.registration_no || '').trim().toUpperCase();
    payload.vehicle_name = String(payload.vehicle_name || '').trim();
    if (!payload.registration_no || !payload.vehicle_name || !payload.vehicle_type || !payload.fuel_type || !payload.vehicle_status) {
      throw new Error('Sila lengkapkan semua medan wajib.');
    }
    if (payload.current_mileage < 0) throw new Error('Perbatuan tidak boleh negatif.');
    if (payload.seating_capacity !== null && payload.seating_capacity < 1) throw new Error('Kapasiti penumpang mestilah sekurang-kurangnya 1.');
    return payload;
  }
  async function saveVehicle(event) {
    event.preventDefault();
    if (state.busy) return;
    state.busy = true;
    const button = $('saveVehicleBtn');
    button.disabled = true;
    try {
      const payload = formPayload();
      const sb = client();
      let result;
      if (state.editingId) {
        result = await sb.from('vehicles').update(payload).eq('id', state.editingId).select('id').single();
      } else {
        result = await sb.from('vehicles').insert(payload).select('id').single();
      }
      if (result.error) throw result.error;
      closeModal();
      showToast(state.editingId ? 'Rekod kenderaan dikemas kini.' : 'Kenderaan berjaya didaftarkan.');
      await loadVehicles();
    } catch (error) {
      console.error('Gagal menyimpan kenderaan:', error);
      showToast(error.message || 'Kenderaan gagal disimpan.', true);
    } finally {
      state.busy = false;
      button.disabled = false;
    }
  }
  async function init() {
    try {
      if (window.VMSRoleGuard?.initPageGuard) {
        const allowed = await window.VMSRoleGuard.initPageGuard();
        if (!allowed) return;
      } else {
        setMessage('Sistem kawalan peranan tidak dijumpai. Halaman ini tidak boleh digunakan sehingga auth/role-guard dimuatkan.', true);
        return;
      }
      const profile = window.VMSSession?.getProfile?.();
      if (profile) {
        $('profileName').textContent = profile.full_name || 'Pengguna';
        $('profileRole').textContent = profile.role === 'admin' ? 'Pentadbir Sistem' : 'Pegawai Kenderaan';
        $('profileInitials').textContent = (profile.full_name || 'V').split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase();
      }
      $('logoutBtn').addEventListener('click', async () => {
        await window.VMSSession?.logout?.({ redirect: true });
      });
      await loadVehicles();
    } catch (error) {
      console.error(error);
      setMessage(`Ralat permulaan halaman: ${error.message || error}`, true);
    }
  }

  $('vehicleSearch').addEventListener('input', render);
  ['categoryFilter','fuelFilter','statusFilter'].forEach(id => $(id).addEventListener('change', render));
  $('resetFilter').addEventListener('click', () => {
    $('vehicleSearch').value = '';
    $('categoryFilter').value = '';
    $('fuelFilter').value = '';
    $('statusFilter').value = '';
    render();
  });
  $('refreshBtn').addEventListener('click', loadVehicles);
  $('addVehicleBtn').addEventListener('click', () => openModal());
  $('closeModal').addEventListener('click', closeModal);
  $('cancelModal').addEventListener('click', closeModal);
  $('vehicleModal').addEventListener('click', e => { if (e.target === $('vehicleModal')) closeModal(); });
  $('vehicleForm').addEventListener('submit', saveVehicle);
  document.querySelectorAll('.view-btn').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === button));
    const table = button.dataset.view === 'table';
    $('cardsView').classList.toggle('hidden', table);
    $('tableView').classList.toggle('hidden', !table);
  }));
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-edit]');
    if (!button) return;
    const vehicle = state.vehicles.find(v => v.id === button.dataset.edit);
    if (vehicle) openModal(vehicle);
  });
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
