const data=[
['02/10/2026','07:00','17:30','Kuala Lumpur','Pemohon A','VAN IKTBN 01','En. Pemandu 01','Tunggu','Dijadualkan'],
['02/10/2026','08:00','12:30','Seremban','Pemohon B','SEDAN IKTBN 02','En. Pemandu 02','Tidak Tunggu','Bertolak'],
['02/10/2026','09:00','15:00','Putrajaya','Pemohon C','VAN IKTBN 01','En. Pemandu 03','Tunggu','Dalam Perjalanan'],
['03/10/2026','07:30','16:00','Melaka','Pemohon D','BAS IKTBN 01','Pemandu Gantian','Tunggu','Dijadualkan'],
['04/10/2026','08:00','14:30','Shah Alam','Pemohon E','LORI IKTBN 01','En. Pemandu 01','Tidak Tunggu','Selesai']
];
const rows=document.querySelector('#rows');let current='';
function badge(s){return s==='Selesai'?'greenbadge':s==='Dalam Perjalanan'||s==='Bertolak'?'orange':'blue'}
function render(){const q=search.value.toLowerCase(),df=driverFilter.value,vf=vehicleFilter.value,dt=dateFilter.value;rows.innerHTML=data.filter(x=>(!q||x.join(' ').toLowerCase().includes(q))&&(!current||x[8]===current)&&(!df||x[6]===df)&&(!vf||x[5]===vf)&&(!dt||x[0]===new Date(dt+'T00:00:00').toLocaleDateString('en-GB'))).map(x=>`<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td><td><b>${x[3]}</b></td><td>${x[4]}</td><td>${x[5]}</td><td>${x[6]}</td><td><span class="badge purple">${x[7]}</span></td><td><span class="badge ${badge(x[8])}">${x[8]}</span></td><td><button class="secondary" onclick="toast('Membuka rekod perjalanan')">Lihat</button></td></tr>`).join('')}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');current=b.dataset.tab;render()});
[search,driverFilter,vehicleFilter,dateFilter].forEach(x=>x.addEventListener('input',render));[driverFilter,vehicleFilter].forEach(x=>x.addEventListener('change',render));
driverView.onclick=()=>driverPanel.classList.remove('hidden');closeDriver.onclick=()=>driverPanel.classList.add('hidden');
function driverSchedule(){const names=['En. Pemandu 01','En. Pemandu 02','En. Pemandu 03','Pemandu Gantian'];driverCards.innerHTML=names.map(n=>`<div class="driver-card"><h3>${n}</h3><small>${data.filter(x=>x[6]===n).length} tugasan direkodkan</small>${data.filter(x=>x[6]===n).map(x=>`<div class="job"><b>${x[0]} · ${x[1]}–${x[2]}</b>${x[3]}<br>${x[5]}</div>`).join('')||'<small>Tiada tugasan.</small>'}</div>`).join('')}driverSchedule();
const modal=document.querySelector('#modal');newTrip.onclick=()=>modal.classList.remove('hidden');close.onclick=()=>modal.classList.add('hidden');cancel.onclick=()=>modal.classList.add('hidden');
const now=new Date();tripDate.value=now.toISOString().slice(0,10);
form.onsubmit=e=>{e.preventDefault();toast('Rekod perjalanan berjaya disimpan.');modal.classList.add('hidden');form.reset()};
function toast(x){const t=document.querySelector('#toast');t.textContent=x;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}render();
