const vehicles=[
['VAN IKTBN 01','NCF 1234','Van','Diesel','12,450 km','Beroperasi','Servis 18/10/2026',78],
['SEDAN IKTBN 02','NCF 2234','Kereta Sedan','Petrol','58,305 km','Beroperasi','Servis 28/10/2026',54],
['BAS IKTBN 01','NCF 3234','Bas','Diesel','33,380 km','Dalam Penyelenggaraan','Brek · sedang dibuat',42],
['LORI IKTBN 01','NCF 4234','Lori','Diesel','21,245 km','Beroperasi','Servis 05/11/2026',61],
['EV IKTBN 01','NCF EV01','Kereta Sedan','Elektrik','8,528 km','Beroperasi','Pemeriksaan 12/11/2026',74]
];
const fleet=document.querySelector('#fleet');
function renderFleet(){const q=search.value.toLowerCase();fleet.innerHTML=vehicles.filter(v=>v.join(' ').toLowerCase().includes(q)).map(v=>`<div class="vehicle"><div class="vehicletop"><div><span class="plate">${v[1]}</span><h2>${v[0]}</h2></div><span class="type ${v[3]==='Elektrik'?'evtag':''}">${v[2]}</span></div><div class="meter"><div><small>Meter Semasa</small><b>${v[4]}</b></div><div style="text-align:right"><small>Tenaga</small><b>${v[3]}</b></div></div><div class="progress"><i style="width:${v[7]}%"></i></div><div class="vehiclefoot"><span class="status ${v[5]==='Beroperasi'?'ok': 'bad'}">● ${v[5]}</span><span>${v[6]}</span></div></div>`).join('')}
const services=[
['VAN IKTBN 01','18/09/2026','12,450 km','18/10/2026','18 hari','Akan Datang'],
['SEDAN IKTBN 02','28/09/2026','58,305 km','28/10/2026','28 hari','Akan Datang'],
['BAS IKTBN 01','15/09/2026','33,380 km','—','Sedang Diservis','Sedang Diservis'],
['LORI IKTBN 01','05/08/2026','21,245 km','05/11/2026','34 hari','Akan Datang'],
['EV IKTBN 01','12/09/2026','8,528 km','12/11/2026','43 hari','Akan Datang']
];
function renderServices(){let q=search.value.toLowerCase();serviceRows.innerHTML=services.filter(x=>(!q||x.join(' ').toLowerCase().includes(q))&&(!serviceFilter.value||x[5]===serviceFilter.value)).map(x=>`<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td><span class="badge ${x[5]==='Sedang Diservis'?'redbadge':'warnbadge'}">${x[5]}</span></td><td><button class="secondary" onclick="toast('Rekod penyelenggaraan dibuka')">Lihat</button></td></tr>`).join('')}
search.oninput=()=>{renderFleet();renderServices()};serviceFilter.onchange=renderServices;
addBtn.onclick=()=>vehicleModal.classList.remove('hidden');closeVehicle.onclick=()=>vehicleModal.classList.add('hidden');cancelVehicle.onclick=()=>vehicleModal.classList.add('hidden');
serviceBtn.onclick=()=>serviceModal.classList.remove('hidden');closeService.onclick=()=>serviceModal.classList.add('hidden');cancelService.onclick=()=>serviceModal.classList.add('hidden');
vehicleForm.onsubmit=e=>{e.preventDefault();vehicleModal.classList.add('hidden');toast('Kenderaan berjaya didaftarkan.');e.target.reset()};
serviceForm.onsubmit=e=>{e.preventDefault();serviceModal.classList.add('hidden');toast('Rekod penyelenggaraan berjaya disimpan.');e.target.reset()};
function toast(x){const t=document.querySelector('#toast');t.textContent=x;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
renderFleet();renderServices();
